'use client'

import { useMemo, useState } from 'react'
import type { Goal, PricedGoal } from '@/engine'
import { DOMAIN_META, formatHbar, formatUsd } from '@/lib/format'
import { useToast } from '../Toast'

interface GoalBookProps {
  goals: Goal[]
  criticalPath: string[]
  blockedIds: Set<string>
  priced?: PricedGoal[]
  onComplete: (id: string) => void | Promise<unknown>
  onAbandon: (id: string) => void | Promise<unknown>
  onDelete: (id: string) => void | Promise<unknown>
}

type Filter = 'open' | 'completed' | 'abandoned' | 'all'

export default function GoalBook({
  goals,
  criticalPath,
  blockedIds,
  priced = [],
  onComplete,
  onAbandon,
  onDelete,
}: GoalBookProps) {
  const toast = useToast()
  const [filter, setFilter] = useState<Filter>('open')
  const crit = new Set(criticalPath)

  const visible = useMemo(() => {
    const list = filter === 'all' ? goals : goals.filter((g) => g.status === filter)
    const rank = { open: 0, completed: 1, abandoned: 2 }
    const pr = { high: 0, medium: 1, low: 2 }
    return [...list].sort((a, b) => {
      if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status]
      if (pr[a.priority] !== pr[b.priority]) return pr[a.priority] - pr[b.priority]
      return b.createdAt - a.createdAt
    })
  }, [filter, goals])

  if (goals.length === 0) {
    return (
      <div className="panel p-10 text-center">
        <div className="kicker">Empty book</div>
        <p className="mt-2 text-[var(--mute)]">Write the first goal. One sentence is enough.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl text-[var(--paper)]">The book</h3>
        <div className="seg" role="group" aria-label="Filter goals">
          {(['open', 'completed', 'abandoned', 'all'] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === 'abandoned' ? 'cut' : f === 'completed' ? 'done' : f}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 && (
        <p className="panel p-6 text-sm text-[var(--mute)]">Nothing in this filter.</p>
      )}
      {visible.map((goal) => {
        const quote = priced.find((p) => p.goalId === goal.id)
        const blocked = blockedIds.has(goal.id)
        return (
          <article key={goal.id} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="chip">
                    {DOMAIN_META[goal.domain].mark} {DOMAIN_META[goal.domain].label}
                  </span>
                  <span className="chip">{goal.priority}</span>
                  {crit.has(goal.id) && <span className="chip chip-gold">critical path</span>}
                  {blocked && <span className="chip">blocked</span>}
                </div>
                <h3
                  className={`font-display text-xl text-[var(--paper)] ${
                    goal.status !== 'open' ? 'line-through opacity-60' : ''
                  }`}
                >
                  {goal.title}
                </h3>
                {goal.description && <p className="mt-1 text-sm text-[var(--mute)]">{goal.description}</p>}
                <p className="mt-2 font-mono text-[11px] text-[var(--mute)]">
                  {goal.estimatedMinutes}m
                  {quote ? ` · ${formatHbar(quote.hbar)}` : ''}
                  {goal.stakeCents ? ` · ${formatUsd(goal.stakeCents)} claimed` : ''}
                  {goal.dependsOn.length > 0 ? ` · ${goal.dependsOn.length} deps` : ''}
                  {` · ${new Date(goal.createdAt).toLocaleDateString()}`}
                </p>
              </div>
              {goal.status === 'open' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-quiet"
                    disabled={blocked}
                    onClick={async () => {
                      await onComplete(goal.id)
                      toast('Closed')
                    }}
                    title={blocked ? 'Finish prerequisites first' : 'Mark complete'}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    className="btn-quiet"
                    onClick={async () => {
                      await onAbandon(goal.id)
                      toast('Cut from the book')
                    }}
                  >
                    Cut
                  </button>
                  <button
                    type="button"
                    className="btn-quiet"
                    onClick={async () => {
                      if (!window.confirm('Delete this goal from the ledger?')) return
                      await onDelete(goal.id)
                      toast('Deleted')
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
