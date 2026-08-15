'use client'

import type { HypotrophyEngine } from '@/hooks/useEngine'
import GoalComposer from './GoalComposer'
import GoalBook from './GoalBook'
import { bpsPct, DOMAIN_META, formatDuration } from '@/lib/format'

export default function CommandDeck({ engine }: { engine: HypotrophyEngine }) {
  const { plan, graph, goals, create, complete, abandon, remove } = engine
  const blockedIds = new Set(
    Object.values(graph.nodes)
      .filter((n) => n.blocked)
      .map((n) => n.id)
  )
  const next = plan.next

  return (
    <div className="grid gap-6 xl:grid-cols-12">
      <div className="space-y-6 xl:col-span-8">
        {next && (
          <section className="panel overflow-hidden">
            <div className="border-b border-[var(--line)] px-6 py-4">
              <div className="kicker">Next best action</div>
              <h2 className="font-display text-3xl text-[var(--paper)]">{next.title}</h2>
            </div>
            <div className="grid gap-4 px-6 py-5 sm:grid-cols-3">
              <Stat label="Domain" value={DOMAIN_META[next.domain].label} />
              <Stat label="Thompson θ" value={next.thompson.toFixed(3)} />
              <Stat label="Kelly weight" value={bpsPct(next.kellyBps)} />
            </div>
            <ul className="space-y-1 border-t border-[var(--line)] px-6 py-4 text-sm text-[var(--mute)]">
              {next.reasons.map((r) => (
                <li key={r}>— {r}</li>
              ))}
            </ul>
            <div className="px-6 pb-5">
              <button type="button" className="btn-gold" onClick={() => complete(next.goalId)}>
                Close this position
              </button>
            </div>
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
      </div>
      <aside className="space-y-4 xl:col-span-4">
        <section className="panel p-5">
          <div className="kicker">Book</div>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="Open" value={String(goals.filter((g) => g.status === 'open').length)} />
            <Stat label="Closed" value={String(engine.projection.completedCount)} />
            <Stat label="Cut" value={String(engine.projection.abandonedCount)} />
            <Stat label="Critical path" value={`${plan.criticalPathMinutes}m`} />
          </dl>
        </section>
        <section className="panel p-5">
          <div className="kicker">Survival</div>
          <p className="mt-2 font-display text-2xl text-[var(--paper)]">
            median {formatDuration(engine.plan.survival.points.length ? medianish(engine) : null)}
          </p>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Kaplan–Meier on time-to-completion. Open goals are censored, not failed.
          </p>
        </section>
        {plan.cycles.length > 0 && (
          <section className="panel p-5">
            <div className="kicker">Cycle detected</div>
            <p className="mt-2 text-sm text-[var(--gold)]">
              {plan.cycles[0].join(' → ')} cannot be scheduled. Break the loop.
            </p>
          </section>
        )}
      </aside>
    </div>
  )
}

function medianish(engine: HypotrophyEngine): number | null {
  const pts = engine.plan.survival.points
  const hit = pts.find((p) => p.survival <= 0.5)
  return hit ? hit.t : null
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="kicker">{label}</div>
      <div className="mt-1 font-mono text-lg text-[var(--paper)]">{value}</div>
    </div>
  )
}
