'use client'

import { useState } from 'react'
import type { HypotrophyEngine } from '@/hooks/useEngine'
import GoalComposer from './GoalComposer'
import GoalBook from './GoalBook'
import GraphView from './GraphView'
import CapitalRose from './CapitalRose'
import { formatUsd } from '@/lib/format'
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

  return (
    <div className="space-y-6">
      <section>
        <div className="kicker">Work</div>
        <h1 className="font-display text-3xl text-[var(--paper)]">Ranked, feasible work</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          Blocked items cannot be next. Dollars you claimed and your skill rate change the ranking.
          The map is optional.
        </p>
      </section>

      {next ? (
        <section className="ticket px-6 py-5">
          <div className="kicker">Up next</div>
          <h2 className="mt-1 font-display text-2xl text-[var(--paper)]">{next.title}</h2>
          <p className="mt-1 text-sm text-[var(--mute)]">
            About {formatUsd(impactCents)} if you finish.
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
                Feasible set first. Then track record in that area, how hot the open work is, whether
                it sits on the longest path, and expected dollars if you finish. Score{' '}
                {next.score.toFixed(3)}.
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
