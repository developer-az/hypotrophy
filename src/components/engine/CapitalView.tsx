'use client'

import type { HypotrophyEngine } from '@/hooks/useEngine'
import { bpsPct, DOMAIN_META, formatDuration } from '@/lib/format'
import { medianSurvival } from '@/engine'

export default function CapitalView({ engine }: { engine: HypotrophyEngine }) {
  const { plan } = engine
  const median = medianSurvival(plan.survival)
  const maxBps = Math.max(1, ...plan.kelly.map((k) => k.bps))
  const maxS = Math.max(1, ...plan.survival.points.map((p) => p.t), 1)

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="kicker">Human capital desk</div>
        <h2 className="font-display text-3xl text-[var(--paper)]">Half-Kelly allocation</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          Each domain is a bet. Win probability is the Laplace-smoothed completion rate. Odds are
          average open priority. Full Kelly is too loud on noisy personal data, so we publish half
          Kelly in basis points — the same haircut a trading desk uses.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <div className="kicker">Weights</div>
          <div className="mt-4 space-y-3">
            {plan.kelly.map((slice) => (
              <div key={slice.domain}>
                <div className="mb-1 flex justify-between font-mono text-xs text-[var(--mute)]">
                  <span>{DOMAIN_META[slice.domain].label}</span>
                  <span>
                    {bpsPct(slice.bps)} · p={slice.p.toFixed(2)} · b={slice.odds.toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--ink-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--gold)]"
                    style={{ width: `${(slice.bps / maxBps) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-6">
          <div className="kicker">Kaplan–Meier</div>
          <p className="mt-1 font-display text-2xl text-[var(--paper)]">
            median {formatDuration(median)}
          </p>
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
            n={plan.survival.n} · events={plan.survival.events} · censored={plan.survival.censored}
          </p>
        </section>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--line)] px-6 py-4">
          <div className="kicker">Ranked book</div>
          <h3 className="font-display text-xl text-[var(--paper)]">Thompson × Kelly × path</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mute)]">
              <tr>
                <th className="px-4 py-3">goal</th>
                <th className="px-4 py-3">θ</th>
                <th className="px-4 py-3">kelly</th>
                <th className="px-4 py-3">score</th>
                <th className="px-4 py-3">flags</th>
              </tr>
            </thead>
            <tbody>
              {plan.ranked.map((row) => (
                <tr key={row.goalId} className="border-t border-[var(--line)]">
                  <td className="px-4 py-3 text-[var(--paper)]">{row.title}</td>
                  <td className="px-4 py-3 font-mono text-[var(--mute)]">{row.thompson.toFixed(3)}</td>
                  <td className="px-4 py-3 font-mono text-[var(--mute)]">{bpsPct(row.kellyBps)}</td>
                  <td className="px-4 py-3 font-mono text-[var(--gold)]">{row.score.toFixed(3)}</td>
                  <td className="px-4 py-3 text-[11px] text-[var(--mute)]">
                    {row.onCriticalPath ? 'crit ' : ''}
                    {row.blocked ? 'blocked' : 'eligible'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
