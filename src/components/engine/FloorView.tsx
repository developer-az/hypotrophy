'use client'

import type { HypotrophyEngine } from '@/hooks/useEngine'
import GoalComposer from './GoalComposer'
import GoalBook from './GoalBook'
import { bpsPct, DOMAIN_META, formatHbar, formatPct, formatUsd } from '@/lib/format'
import { useToast } from '../Toast'

export default function FloorView({ engine }: { engine: HypotrophyEngine }) {
  const toast = useToast()
  const { plan, graph, goals, book, forward, complete, abandon, remove, create } = engine
  const blockedIds = new Set(
    Object.values(graph.nodes)
      .filter((n) => n.blocked)
      .map((n) => n.id)
  )
  const next = plan.next
  const priced = next ? book.priced.find((p) => p.goalId === next.goalId) : undefined
  const odds = next ? forward.goals.find((g) => g.goalId === next.goalId) : undefined
  const unlock = book.unlocks[0]

  return (
    <div className="grid gap-6 xl:grid-cols-12">
      <div className="space-y-6 xl:col-span-8">
        {next ? (
          <section className="ticket overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
              <div>
                <div className="kicker">The stake</div>
                <h2 className="mt-1 font-display text-3xl leading-tight text-[var(--paper)] sm:text-4xl">
                  {next.title}
                </h2>
                <p className="mt-2 max-w-xl text-sm text-[var(--mute)]">
                  Only legal fill on the desk. DAG is a hard constraint. Thompson, half-Kelly, and ħ
                  rank the feasible set — they cannot promote blocked work.
                </p>
              </div>
              <div className="text-right">
                <div className="kicker">ħ · this fill</div>
                <div className="font-display text-4xl text-[var(--gold)]">
                  {priced ? formatHbar(priced.hbar).replace(' ħ', '') : '—'}
                  <span className="ml-1 font-mono text-sm text-[var(--mute)]">ħ</span>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-[var(--line)] sm:grid-cols-4">
              <Metric label="Domain" value={DOMAIN_META[next.domain].label} />
              <Metric label="P(fill 7d)" value={formatPct(odds?.p7 ?? 0)} />
              <Metric label="P(fill 30d)" value={formatPct(odds?.p30 ?? 0)} />
              <Metric
                label="Claim"
                value={next.stakeCents ? formatUsd(next.stakeCents) : 'unpriced'}
              />
            </div>

            <ul className="space-y-1 px-6 py-4 text-sm text-[var(--mute)]">
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
                  toast('Filled. NAV realized.')
                }}
              >
                Mark filled
              </button>
              <details className="quant">
                <summary>How this was priced</summary>
                <p className="mt-2 max-w-lg text-sm text-[var(--mute)]">
                  θ={next.thompson.toFixed(3)} · half-Kelly {bpsPct(next.kellyBps)} · score{' '}
                  {next.score.toFixed(3)} · ħ{next.hbar}. Forward paths use the same allocator with
                  a different Thompson seed. That is a prediction of *you*, not of the market.
                </p>
              </details>
            </div>
          </section>
        ) : (
          <section className="panel p-8">
            <div className="kicker">Empty tape</div>
            <h2 className="mt-1 font-display text-3xl text-[var(--paper)]">No eligible fill</h2>
            <p className="mt-2 max-w-lg text-[var(--mute)]">
              Write a position below, or load the working book from welcome. The allocator will not
              invent work that the DAG forbids.
            </p>
          </section>
        )}

        {unlock && (
          <section className="panel px-6 py-5">
            <div className="kicker">Cheap alpha</div>
            <p className="mt-1 font-display text-2xl text-[var(--paper)]">{unlock.title}</p>
            <p className="mt-1 text-sm text-[var(--mute)]">
              Finish this and {unlock.unlockIds.length} blocked claim
              {unlock.unlockIds.length === 1 ? '' : 's'} become eligible — {formatHbar(unlock.unlockHbar)}{' '}
              sitting behind one fill.
            </p>
          </section>
        )}

        <GoalComposer goals={goals} onCreate={create} />
        <GoalBook
          goals={goals}
          criticalPath={plan.criticalPath}
          blockedIds={blockedIds}
          priced={book.priced}
          onComplete={complete}
          onAbandon={abandon}
          onDelete={remove}
        />
      </div>

      <aside className="space-y-4 xl:col-span-4">
        <section className="panel p-5">
          <div className="kicker">Forward 7 / 30 / 90</div>
          <p className="mt-2 text-xs text-[var(--mute)]">
            {forward.paths} paths · {forward.capacityMinutesPerDay}m/day focused capacity
          </p>
          <dl className="mt-4 space-y-3">
            <Horizon label="7d" fills={forward.expectedFills.d7} hbar={forward.expectedHbar.d7} min={forward.expectedMinutes.d7} />
            <Horizon label="30d" fills={forward.expectedFills.d30} hbar={forward.expectedHbar.d30} min={forward.expectedMinutes.d30} />
            <Horizon label="90d" fills={forward.expectedFills.d90} hbar={forward.expectedHbar.d90} min={forward.expectedMinutes.d90} />
          </dl>
        </section>
        <section className="panel p-5">
          <div className="kicker">Tape</div>
          <ol className="mt-3 space-y-2">
            {plan.ranked
              .filter((r) => !r.blocked)
              .slice(0, 5)
              .map((row, i) => {
                const p = forward.goals.find((g) => g.goalId === row.goalId)
                return (
                  <li key={row.goalId} className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate text-[var(--paper)]">
                      <span className="mr-2 font-mono text-[10px] text-[var(--gold)]">{i + 1}</span>
                      {row.title}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-[var(--mute)]">
                      {formatPct(p?.p7 ?? 0)} · ħ{row.hbar}
                    </span>
                  </li>
                )
              })}
          </ol>
        </section>
        {plan.cycles.length > 0 && (
          <section className="panel p-5">
            <div className="kicker">Cycle — unscheduable</div>
            <p className="mt-2 text-sm" style={{ color: 'var(--bad)' }}>
              {plan.cycles[0].join(' → ')}
            </p>
          </section>
        )}
      </aside>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--ink-2)] px-5 py-4">
      <div className="kicker">{label}</div>
      <div className="mt-1 font-mono text-lg text-[var(--paper)]">{value}</div>
    </div>
  )
}

function Horizon({
  label,
  fills,
  hbar,
  min,
}: {
  label: string
  fills: number
  hbar: number
  min: number
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--gold)]">{label}</span>
      <span className="font-mono text-sm text-[var(--paper)]">
        {fills.toFixed(1)} fills · {formatHbar(hbar)} · {min}m
      </span>
    </div>
  )
}
