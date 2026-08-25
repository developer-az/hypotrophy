'use client'

import { useState, type FormEvent } from 'react'

interface WelcomeProps {
  onStart: (input: {
    cashCents: number
    billsCents: number
    rateCentsPerHour: number
    goalTitle?: string
  }) => Promise<void> | void
  onDemo: () => void
}

export default function Welcome({ onStart, onDemo }: WelcomeProps) {
  const [cash, setCash] = useState('5000')
  const [bills, setBills] = useState('2500')
  const [rate, setRate] = useState('75')
  const [goal, setGoal] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      await onStart({
        cashCents: Math.max(0, Math.round(Number(cash || '0') * 100)),
        billsCents: Math.max(0, Math.round(Number(bills || '0') * 100)),
        rateCentsPerHour: Math.max(0, Math.round(Number(rate || '0') * 100)),
        goalTitle: goal.trim() || undefined,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-xl flex-col justify-center px-1 py-8">
      <p className="kicker">Hypotrophy</p>
      <h1 className="mt-4 font-display text-4xl leading-[1.1] text-[var(--paper)] sm:text-5xl">
        Start with what you have
      </h1>
      <p className="mt-3 text-[var(--mute)]">
        Cash, bills, what an hour of you is worth, and one money goal. Then the app tells you what
        to do next. Stays on this device.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block">
          <span className="kicker mb-1 block">Cash on hand $</span>
          <input className="field" inputMode="decimal" value={cash} onChange={(e) => setCash(e.target.value)} />
        </label>
        <label className="block">
          <span className="kicker mb-1 block">Monthly bills $</span>
          <input className="field" inputMode="decimal" value={bills} onChange={(e) => setBills(e.target.value)} />
        </label>
        <label className="block">
          <span className="kicker mb-1 block">What you earn per hour $</span>
          <input className="field" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
        </label>
        <label className="block">
          <span className="kicker mb-1 block">One money goal (optional)</span>
          <input
            className="field"
            placeholder="Land a $8k contract"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </label>
        <button type="submit" className="btn-gold w-full" disabled={busy}>
          {busy ? 'Opening…' : 'Open my book'}
        </button>
      </form>

      <button type="button" className="btn-quiet mt-3 w-full" onClick={onDemo} disabled={busy}>
        Load a demo week
      </button>
    </div>
  )
}
