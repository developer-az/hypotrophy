'use client'

import type { Goal } from '@/engine'
import { DOMAIN_META } from '@/lib/format'

interface GoalBookProps {
  goals: Goal[]
  criticalPath: string[]
  blockedIds: Set<string>
  onComplete: (id: string) => void
  onAbandon: (id: string) => void
  onDelete: (id: string) => void
}

export default function GoalBook({
  goals,
  criticalPath,
  blockedIds,
  onComplete,
  onAbandon,
  onDelete,
}: GoalBookProps) {
  const crit = new Set(criticalPath)
  const sorted = [...goals].sort((a, b) => {
    const rank = { open: 0, completed: 1, abandoned: 2 }
    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status]
    const pr = { high: 0, medium: 1, low: 2 }
    if (pr[a.priority] !== pr[b.priority]) return pr[a.priority] - pr[b.priority]
    return b.createdAt - a.createdAt
  })

  if (goals.length === 0) {
    return (
      <div className="panel p-10 text-center">
        <div className="kicker">Empty book</div>
        <p className="mt-2 text-[var(--mute)]">Commit a goal, or load the demo ledger to see the engine work.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sorted.map((goal) => {
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
                  <span className="chip">{goal.status}</span>
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
                {goal.description && (
                  <p className="mt-1 text-sm text-[var(--mute)]">{goal.description}</p>
                )}
                <p className="mt-2 font-mono text-[11px] text-[var(--mute)]">
                  {goal.estimatedMinutes}m · {new Date(goal.createdAt).toLocaleDateString()}
                  {goal.dependsOn.length > 0 ? ` · deps ${goal.dependsOn.length}` : ''}
                </p>
              </div>
              {goal.status === 'open' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-quiet"
                    disabled={blocked}
                    onClick={() => onComplete(goal.id)}
                    title={blocked ? 'Finish prerequisites first' : 'Mark complete'}
                  >
                    Close
                  </button>
                  <button type="button" className="btn-quiet" onClick={() => onAbandon(goal.id)}>
                    Cut
                  </button>
                  <button type="button" className="btn-quiet" onClick={() => onDelete(goal.id)}>
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
