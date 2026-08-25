'use client'

import { useState } from 'react'
import type { HypotrophyEngine } from '@/hooks/useEngine'
import GoalComposer from './GoalComposer'
import GoalBook from './GoalBook'
import GraphView from './GraphView'
import CapitalRose from './CapitalRose'
import { formatHours, formatUsd, formatUsdRate } from '@/lib/format'
import { useToast } from '../Toast'

export default function WorkView({ engine }: { engine: HypotrophyEngine }) {
  const toast = useToast()
  const { plan, graph, goals, impactCents, complete, abandon, remove, create } = engine
  const [showMap, setShowMap] = useState(false)
  const blockedIds = new Set(
    Object.values(graph.nodes)
      .filter((n) => n.blocked)
      .map((n) => n.id)
  )
  const next = plan.next
  const feasible = plan.ranked.filter((r) => !r.blocked)

  return (
    <div className="space-y-6">
      <section>
        <div className="kicker">Work</div>
        <h1 className="font-display text-3xl text-[var(--paper)]">Ranked, feasible work</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          Blocked items cannot be next. Ranked by expected dollars per hour: your finish rate times
          the claim, the skill time, and what finishing unlocks.
        </p>
      </section>

      {next ? (
        <section className="ticket px-6 py-5">
          <div className="kicker">Up next</div>
          <h2 className="mt-1 font-display text-2xl text-[var(--paper)]">{next.title}</h2>
          <p className="mt-1 text-sm text-[var(--mute)]">
            About {formatUsd(impactCents)} if you finish
            {next.optionCents > 0 ? ` · unlocks ${formatUsd(next.optionCents)}` : ''} ·{' '}
            {formatUsdRate(next.centsPerHour)} expected.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-[var(--mute)]">
            {next.reasons.map((r) => (
              <li key={r}>— {r}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-gold"
              onClick={async () => {
                await complete(next.goalId)
                toast('Done')
              }}
            >
              Done
            </button>
            <details className="quant">
              <summary>How this was ranked</summary>
              <p className="mt-2 max-w-lg text-sm text-[var(--mute)]">
                Feasible set first. Then expected dollars per hour = P(you finish this kind of work)
                × (claim + skill time + unlocked children). Score {next.score.toFixed(3)}.
              </p>
              <div className="mt-4 max-w-xs">
                <CapitalRose kelly={plan.kelly} />
              </div>
            </details>
          </div>
        </section>
      ) : (
        <p className="panel p-6 text-[var(--mute)]">No ready work. Add some below.</p>
      )}

      {feasible.length > 1 && (
        <section className="panel overflow-hidden">
          <div className="border-b border-[var(--line)] px-5 py-4">
            <div className="kicker">By expected dollars / hour</div>
          </div>
          <ol>
            {feasible.slice(0, 8).map((row, i) => (
              <li
                key={row.goalId}
                className="flex flex-wrap items-baseline justify-between gap-2 border-t border-[var(--line)] px-5 py-3 text-sm"
              >
                <span>
                  {i + 1}. {row.title}
                </span>
                <span className="font-mono text-[var(--gold)]">
                  {formatUsdRate(row.centsPerHour)} · {formatHours(row.estimatedMinutes)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <GoalComposer goals={goals} onCreate={create} />
      <GoalBook
        goals={goals}
        criticalPath={plan.criticalPath}
        blockedIds={blockedIds}
        onComplete={complete}
        onAbandon={abandon}
        onDelete={remove}
      />

      <div>
        <button type="button" className="btn-quiet" onClick={() => setShowMap((v) => !v)}>
          {showMap ? 'Hide map' : 'Show map'}
        </button>
        {showMap && (
          <div className="mt-4">
            <GraphView engine={engine} />
          </div>
        )}
      </div>
    </div>
  )
}
