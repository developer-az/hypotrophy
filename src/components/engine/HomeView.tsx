'use client'

import { useEffect, useState } from 'react'
import type { HypotrophyEngine } from '@/hooks/useEngine'
import { formatUsd, formatUsdRate } from '@/lib/format'
import { aiService } from '@/lib/aiService'
import { useToast } from '../Toast'

export default function HomeView({
  engine,
  onWork,
  onMoney,
}: {
  engine: HypotrophyEngine
  onWork: () => void
  onMoney: () => void
}) {
  const toast = useToast()
  const { plan, pnl, impactCents, memo, briefing, complete, logMoney, accounts } = engine
  const [brief, setBrief] = useState(memo)

  useEffect(() => {
    setBrief(memo)
    let cancelled = false
    void aiService.generateCioMemo(briefing, memo).then((insight) => {
      if (!cancelled && insight.content.trim()) setBrief(insight.content.trim())
    })
    return () => {
      cancelled = true
    }
  }, [memo, briefing])
  const next = plan.next
  const cash = accounts.find((a) => a.kind === 'cash') ?? accounts[0]
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)

  const log = async (kind: 'income' | 'expense') => {
    if (!cash || busy) return
    const dollars = Number(amount)
    if (!Number.isFinite(dollars) || dollars <= 0) return
    setBusy(true)
    try {
      await logMoney({ accountId: cash.id, cents: Math.round(dollars * 100), kind, memo: kind })
      setAmount('')
      toast(kind === 'income' ? 'Income logged' : 'Spend logged')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="kicker">Home</div>
        <h1 className="font-display text-4xl text-[var(--paper)]">Your money, skills, and next hour</h1>
        <p className="mt-2 max-w-2xl text-[var(--mute)]">
          One book on this device. Net worth is what you typed. The next action is the work most
          likely to raise 90-day profit if you actually finish it.
        </p>
      </section>

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Net worth" value={formatUsd(pnl.netWorthCents)} />
        <Stat label="Monthly bills" value={formatUsd(pnl.burnCentsPerMonth)} />
        <Stat label="Your rate" value={formatUsdRate(pnl.blendedRateCentsPerHour)} />
        <Stat label="90-day expected" value={formatUsd(pnl.expectedProfit90dCents)} />
      </dl>

      {next ? (
        <section className="ticket overflow-hidden">
          <div className="border-b border-[var(--line)] px-6 py-5">
            <div className="kicker">Do this now</div>
            <h2 className="mt-1 font-display text-3xl leading-tight text-[var(--paper)] sm:text-4xl">
              {next.title}
            </h2>
            <p className="mt-2 text-[var(--mute)]">
              If you finish, that is about {formatUsd(impactCents)}. Ready to start
              {next.reasons.includes('ready to start') ? '.' : ' after blockers.'}
            </p>
          </div>
          <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center">
            <button
              type="button"
              className="btn-gold"
              onClick={async () => {
                await complete(next.goalId)
                toast('Done. Books updated.')
              }}
            >
              Mark done
            </button>
            <button type="button" className="btn-quiet" onClick={onWork}>
              See all work
            </button>
          </div>
        </section>
      ) : (
        <section className="panel p-8">
          <div className="kicker">Do this now</div>
          <h2 className="mt-1 font-display text-3xl text-[var(--paper)]">Nothing is queued</h2>
          <p className="mt-2 text-[var(--mute)]">Add work with a dollar claim, or log cash first.</p>
          <button type="button" className="btn-gold mt-5" onClick={onWork}>
            Add work
          </button>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <div className="kicker">Briefing</div>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--paper)]">{brief}</p>
        </section>
        <section className="panel p-6">
          <div className="kicker">Log money</div>
          <p className="mt-1 text-sm text-[var(--mute)]">
            {cash ? `Posts to ${cash.name}.` : 'Open a cash account on Money first.'}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              className="field"
              inputMode="decimal"
              placeholder="$ amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!cash || busy}
            />
            <button type="button" className="btn-gold" disabled={!cash || busy} onClick={() => void log('income')}>
              Got paid
            </button>
            <button type="button" className="btn-quiet" disabled={!cash || busy} onClick={() => void log('expense')}>
              Spent
            </button>
          </div>
          <button type="button" className="mt-4 text-sm text-[var(--gold)] underline" onClick={onMoney}>
            Full money desk
          </button>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-5">
      <div className="kicker">{label}</div>
      <div className="mt-1 font-display text-2xl text-[var(--paper)]">{value}</div>
    </div>
  )
}
