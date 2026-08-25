'use client'

import { useMemo, useState, type FormEvent } from 'react'
import type { Domain, Goal, Priority } from '@/engine'
import { DOMAINS } from '@/engine'
import { detectDomain, detectPriority, DOMAIN_META, splitTitle } from '@/lib/format'
import { useToast } from '../Toast'

interface GoalComposerProps {
  goals: Goal[]
  onCreate: (input: {
    title: string
    description?: string
    domain: Domain
    priority: Priority
    dependsOn?: string[]
    estimatedMinutes?: number
    stakeCents?: number
  }) => Promise<unknown>
}

export default function GoalComposer({ goals, onCreate }: GoalComposerProps) {
  const toast = useToast()
  const [input, setInput] = useState('')
  const [minutes, setMinutes] = useState(30)
  const [stake, setStake] = useState('')
  const [dependsOn, setDependsOn] = useState('')
  const [busy, setBusy] = useState(false)
  const [overrideDomain, setOverrideDomain] = useState<Domain | ''>('')
  const [overridePriority, setOverridePriority] = useState<Priority | ''>('')

  const previewDomain = overrideDomain || (input.trim().length > 3 ? detectDomain(input) : 'personal')
  const previewPriority = overridePriority || (input.trim().length > 3 ? detectPriority(input) : 'medium')
  const openGoals = useMemo(() => goals.filter((g) => g.status === 'open'), [goals])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || busy) return
    setBusy(true)
    try {
      const { title, description } = splitTitle(input.trim())
      const dollars = stake.trim() === '' ? undefined : Number(stake)
      const stakeCents =
        dollars != null && Number.isFinite(dollars) && dollars >= 0
          ? Math.round(dollars * 100)
          : undefined
      await onCreate({
        title,
        description,
        domain: previewDomain,
        priority: previewPriority,
        estimatedMinutes: minutes,
        dependsOn: dependsOn ? [dependsOn] : [],
        stakeCents,
      })
      setInput('')
      setDependsOn('')
      setStake('')
      setOverrideDomain('')
      setOverridePriority('')
      toast('On the ledger')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="panel p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="kicker">Open a position</div>
          <h2 className="font-display text-2xl text-[var(--paper)]">New claim</h2>
        </div>
        <div className="flex gap-2">
          <span className="chip">{DOMAIN_META[previewDomain].label}</span>
          <span className="chip">{previewPriority}</span>
        </div>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Close the Series A intro. Claim is the raise, not the coffee."
        className="field min-h-[108px] resize-none"
        disabled={busy}
      />

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <label className="block">
          <span className="kicker mb-1 block">Domain</span>
          <select
            className="field"
            value={overrideDomain}
            onChange={(e) => setOverrideDomain(e.target.value as Domain | '')}
          >
            <option value="">auto</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {DOMAIN_META[d].label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="kicker mb-1 block">Priority</span>
          <select
            className="field"
            value={overridePriority}
            onChange={(e) => setOverridePriority(e.target.value as Priority | '')}
          >
            <option value="">auto</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </label>
        <label className="block">
          <span className="kicker mb-1 block">Minutes</span>
          <input
            type="number"
            min={5}
            max={1440}
            step={5}
            className="field"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="kicker mb-1 block">Claim $</span>
          <input
            type="number"
            min={0}
            step={1}
            className="field"
            placeholder="optional"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="kicker mb-1 block">Depends on</span>
          <select className="field" value={dependsOn} onChange={(e) => setDependsOn(e.target.value)}>
            <option value="">none</option>
            {openGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title.slice(0, 42)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button type="submit" disabled={!input.trim() || busy} className="btn-gold mt-5 w-full">
        {busy ? 'Writing…' : 'Book the position'}
      </button>
    </form>
  )
}
