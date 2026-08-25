'use client'

import type { HypotrophyEngine } from '@/hooks/useEngine'
import CapitalRose from './CapitalRose'
import { bpsPct, DOMAIN_META, formatDuration, formatHbar, formatPct, formatUsd } from '@/lib/format'
import { COMPOUND_BPS, medianSurvival } from '@/engine'

export default function BookView({ engine }: { engine: HypotrophyEngine }) {
  const { plan, book, forward } = engine
  const median = medianSurvival(plan.survival)
  const maxS = Math.max(1, ...plan.survival.points.map((p) => p.t), 1)
  const navMark = book.realizedHbar + forward.expectedHbar.d30

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="kicker">The book</div>
        <h2 className="font-display text-3xl text-[var(--paper)]">Where capital should go</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          NAV is realized ħ plus open ħ. Mark-to-model is realized plus the 30-day expected clear
          from the forward book. Compound weights are relative optionality — not a promised yield.
          Dollar stakes you typed are claims; P(fill) comes from *your* posterior, not the news.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="NAV ħ" value={formatHbar(book.navHbar)} />
          <Stat label="Mark 30d" value={formatHbar(navMark)} />
          <Stat label="Claimed" value={formatUsd(book.claimedCents)} />
          <Stat label="Median done" value={formatDuration(median)} />
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <div className="kicker">Half-Kelly rose</div>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Attention fraction by domain. Full Kelly on noisy Bernoulli data over-bets; we haircut
            50% like a desk.
          </p>
          <CapitalRose kelly={plan.kelly} />
          <div className="mt-2 space-y-2">
            {plan.kelly.slice(0, 5).map((slice) => (
              <div key={slice.domain} className="flex justify-between font-mono text-xs text-[var(--mute)]">
                <span>
                  {DOMAIN_META[slice.domain].label} · {(COMPOUND_BPS[slice.domain] / 1000).toFixed(2)}×
                </span>
                <span>
                  {bpsPct(slice.bps)} · p={slice.p.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-6">
          <div className="kicker">Survival — time-to-done</div>
          <p className="mt-1 font-display text-2xl text-[var(--paper)]">median {formatDuration(median)}</p>
          <svg viewBox="0 0 320 140" className="mt-4 w-full" aria-label="Survival curve">
            <polyline
              fill="none"
              stroke="#d4a054"
              strokeWidth="2"
              points={plan.survival.points
                .map((p) => {
                  const x = 10 + (p.t / maxS) * 300
                  const y = 10 + (1 - p.survival) * 110
                  return `${x},${y}`
                })
                .join(' ')}
            />
            <line x1="10" y1="120" x2="310" y2="120" stroke="rgba(239,230,210,0.2)" />
            <line x1="10" y1="10" x2="10" y2="120" stroke="rgba(239,230,210,0.2)" />
          </svg>
          <p className="mt-2 font-mono text-[11px] text-[var(--mute)]">
            n={plan.survival.n} · events={plan.survival.events} · censored={plan.survival.censored}. Open
            work is censored, not failed.
          </p>
        </section>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--line)] px-6 py-4">
          <div className="kicker">Forward book</div>
          <h3 className="font-display text-xl text-[var(--paper)]">P(fill) past the snapshot</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mute)]">
              <tr>
                <th className="px-4 py-3">position</th>
                <th className="px-4 py-3">7d</th>
                <th className="px-4 py-3">30d</th>
                <th className="px-4 py-3">90d</th>
                <th className="px-4 py-3">E[ħ 30d]</th>
                <th className="px-4 py-3">θ / kelly</th>
              </tr>
            </thead>
            <tbody>
              {plan.ranked.map((row) => {
                const f = forward.goals.find((g) => g.goalId === row.goalId)
                return (
                  <tr key={row.goalId} className="border-t border-[var(--line)]">
                    <td className="px-4 py-3 text-[var(--paper)]">
                      {row.title}
                      <span className="ml-2 font-mono text-[10px] text-[var(--mute)]">
                        {row.blocked ? 'blocked' : 'eligible'}
                        {row.onCriticalPath ? ' · crit' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[var(--gold)]">{formatPct(f?.p7 ?? 0)}</td>
                    <td className="px-4 py-3 font-mono">{formatPct(f?.p30 ?? 0)}</td>
                    <td className="px-4 py-3 font-mono text-[var(--mute)]">{formatPct(f?.p90 ?? 0)}</td>
                    <td className="px-4 py-3 font-mono">{f ? formatHbar(f.expectedHbar30) : '—'}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[var(--mute)]">
                      {row.thompson.toFixed(3)} · {bpsPct(row.kellyBps)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="kicker">{label}</div>
      <div className="mt-1 font-mono text-xl text-[var(--paper)]">{value}</div>
    </div>
  )
}
