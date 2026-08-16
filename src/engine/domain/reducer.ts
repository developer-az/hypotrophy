import type { ChainEntry } from '../crypto/chain'
import { emptyProjection, isDomain, isPriority, type Goal, type Projection } from './types'

/**
 * Pure reducer. Given the same event log, every client reconstructs the same
 * projection. This is the CQRS read model — the chain is the source of truth,
 * the projection is disposable and can be rebuilt.
 *
 * Invalid events are skipped rather than crashing the fold. A corrupt or
 * hostile event must not poison the rest of a user's history. The chain
 * still records that the event existed; the projection simply ignores it.
 */
export function fold(chain: readonly ChainEntry[]): Projection {
  let state = emptyProjection()
  for (const entry of chain) {
    state = apply(state, entry)
  }
  return state
}

export function apply(state: Projection, entry: ChainEntry): Projection {
  const next: Projection = {
    ...state,
    goals: { ...state.goals },
    insights: state.insights.slice(),
    lastEventAt: entry.ts,
  }

  switch (entry.type) {
    case 'ledger.genesis': {
      if (state.genesisAt !== null) return state
      return { ...next, genesisAt: entry.ts }
    }
    case 'goal.created':
      return applyCreated(next, entry)
    case 'goal.completed':
      return applyCompleted(next, entry)
    case 'goal.abandoned':
      return applyAbandoned(next, entry)
    case 'goal.deleted':
      return applyDeleted(next, entry)
    case 'goal.linked':
      return applyLinked(next, entry)
    case 'insight.recorded':
      return applyInsight(next, entry)
    default:
      return state
  }
}

function applyCreated(state: Projection, entry: ChainEntry): Projection {
  const p = entry.payload as Record<string, unknown>
  const id = str(p.id)
  if (!id || state.goals[id]) return state
  const domain = str(p.domain)
  const priority = str(p.priority)
  if (!isDomain(domain) || !isPriority(priority)) return state
  const title = str(p.title)
  if (!title) return state
  const estimatedMinutes = int(p.estimatedMinutes, 30)
  if (estimatedMinutes <= 0 || estimatedMinutes > 24 * 60) return state
  const dependsOn = strArray(p.dependsOn).filter((dep) => dep !== id)

  const goal: Goal = {
    id,
    title: title.slice(0, 200),
    description: optStr(p.description)?.slice(0, 2000),
    domain,
    priority,
    dependsOn,
    estimatedMinutes,
    createdAt: entry.ts,
    status: 'open',
  }
  state.goals[id] = goal
  state.createdCount += 1
  return state
}

function applyCompleted(state: Projection, entry: ChainEntry): Projection {
  const id = str((entry.payload as Record<string, unknown>).id)
  const goal = id ? state.goals[id] : undefined
  if (!goal || goal.status !== 'open') return state
  state.goals[id] = { ...goal, status: 'completed', completedAt: entry.ts }
  state.completedCount += 1
  return state
}

function applyAbandoned(state: Projection, entry: ChainEntry): Projection {
  const id = str((entry.payload as Record<string, unknown>).id)
  const goal = id ? state.goals[id] : undefined
  if (!goal || goal.status !== 'open') return state
  state.goals[id] = { ...goal, status: 'abandoned', abandonedAt: entry.ts }
  state.abandonedCount += 1
  return state
}

function applyDeleted(state: Projection, entry: ChainEntry): Projection {
  const id = str((entry.payload as Record<string, unknown>).id)
  if (!id || !state.goals[id]) return state
  const removed = state.goals[id]
  delete state.goals[id]
  if (removed.status === 'open') {
    /* createdCount stays — deletion is not un-creating history */
  }
  for (const other of Object.values(state.goals)) {
    if (other.dependsOn.includes(id)) {
      state.goals[other.id] = {
        ...other,
        dependsOn: other.dependsOn.filter((d) => d !== id),
      }
    }
  }
  return state
}

function applyLinked(state: Projection, entry: ChainEntry): Projection {
  const p = entry.payload as Record<string, unknown>
  const id = str(p.id)
  const goal = id ? state.goals[id] : undefined
  if (!goal) return state
  const extra = strArray(p.dependsOn).filter((d) => d !== id && state.goals[d])
  const dependsOn = unique([...goal.dependsOn, ...extra])
  state.goals[id] = { ...goal, dependsOn }
  return state
}

function applyInsight(state: Projection, entry: ChainEntry): Projection {
  const p = entry.payload as Record<string, unknown>
  const id = str(p.id)
  const title = str(p.title)
  const content = str(p.content)
  if (!id || !title || !content) return state
  const kind = str(p.kind)
  if (
    kind !== 'suggestion' &&
    kind !== 'analysis' &&
    kind !== 'encouragement' &&
    kind !== 'warning'
  ) {
    return state
  }
  state.insights.unshift({
    id,
    kind,
    title: title.slice(0, 120),
    content: content.slice(0, 4000),
    domain: isDomain(str(p.domain)) ? (p.domain as Goal['domain']) : undefined,
    createdAt: entry.ts,
    relevantGoalIds: strArray(p.relevantGoalIds),
  })
  if (state.insights.length > 50) state.insights.length = 50
  return state
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function optStr(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function int(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isInteger(value) ? value : fallback
}

function strArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string' && v.length > 0)
}

function unique(xs: string[]): string[] {
  return [...new Set(xs)]
}
