'use client'

import type { HypotrophyEngine } from '@/hooks/useEngine'
import GoalComposer from './GoalComposer'
import GoalBook from './GoalBook'
import { bpsPct, DOMAIN_META, formatDuration } from '@/lib/format'
import { useToast } from '../Toast'
import { medianSurvival } from '@/engine'

export default function CommandDeck({ engine }: { engine: HypotrophyEngine }) {
  const toast = useToast()
  const { plan, graph, goals, create, complete, abandon, remove } = engine
  const blockedIds = new Set(
    Object.values(graph.nodes)
      .filter((n) => n.blocked)
      .map((n) => n.id)
  )
  const next = plan.next
  const open = goals.filter((g) => g.status === 'open').length
  const median = medianSurvival(plan.survival)

  return (
    <div className="grid gap-6 xl:grid-cols-12">
      <div className="space-y-6 xl:col-span-8">
        {next ? (
          <section className="panel overflow-hidden">
            <div className="border-b border-[var(--line)] px-6 py-5">
              <div className="kicker">Do this next</div>
              <h2 className="mt-1 font-display text-3xl leading-tight text-[var(--paper)] sm:text-4xl">
                {next.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--mute)]">
                Unblocked, on the desk, ranked for {DOMAIN_META[next.domain].label.toLowerCase()}.
              </p>
            </div>
            <div className="grid gap-4 px-6 py-5 sm:grid-cols-3">
              <Stat label="Domain" value={DOMAIN_META[next.domain].label} />
              <Stat label="Est." value={`${engine.goals.find((g) => g.id === next.goalId)?.estimatedMinutes ?? '—'}m`} />
              <Stat label="Weight" value={bpsPct(next.kellyBps)} />
            </div>
            <ul className="space-y-1 border-t border-[var(--line)] px-6 py-4 text-sm text-[var(--mute)]">
              {next.reasons.map((r) => (
                <li key={r}>— {r}</li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 px-6 pb-6 sm:flex-row sm:items-center">
              <button
                type="button"
                className="btn-gold"
                onClick={async () => {
                  await complete(next.goalId)
                  toast('Closed. Ledger advanced.')
                }}
              >
                Mark done
              </button>
              <details className="quant">
                <summary>How this was ranked</summary>
                <p className="mt-2 max-w-lg text-sm text-[var(--mute)]">
                  Thompson sample θ={next.thompson.toFixed(3)} · half-Kelly {bpsPct(next.kellyBps)} ·
                  score {next.score.toFixed(3)}. Blocked nodes cannot win. The math lives on Capital.
                </p>
              </details>
            </div>
          </section>
        ) : (
          <section className="panel p-8">
            <div className="kicker">Clear desk</div>
            <h2 className="mt-1 font-display text-3xl text-[var(--paper)]">Nothing is queued</h2>
            <p className="mt-2 max-w-lg text-[var(--mute)]">
              Add a goal below, or load a demo week from the welcome screen after a reset. The
              allocator only picks feasible work.
            </p>
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
          <div className="kicker">This book</div>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="Open" value={String(open)} />
            <Stat label="Closed" value={String(engine.projection.completedCount)} />
            <Stat label="Cut" value={String(engine.projection.abandonedCount)} />
            <Stat label="Path" value={`${plan.criticalPathMinutes}m`} />
          </dl>
        </section>
        <section className="panel p-5">
          <div className="kicker">Time-to-done</div>
          <p className="mt-2 font-display text-2xl text-[var(--paper)]">{formatDuration(median)}</p>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Median from Kaplan–Meier. Open goals are censored — not failed.
          </p>
        </section>
        {plan.cycles.length > 0 && (
          <section className="panel p-5">
            <div className="kicker">Cycle</div>
            <p className="mt-2 text-sm" style={{ color: 'var(--bad)' }}>
              {plan.cycles[0].join(' → ')} cannot be scheduled. Break a dependency.
            </p>
          </section>
        )}
      </aside>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="kicker">{label}</div>
      <div className="mt-1 font-mono text-lg text-[var(--paper)]">{value}</div>
    </div>
  )
}
