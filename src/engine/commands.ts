import { appendEntry, type ChainEntry } from './crypto/chain'
import type {
  Domain,
  EngineEventType,
  GoalAbandonedPayload,
  GoalCreatedPayload,
  GoalIdPayload,
  GoalLinkedPayload,
  InsightRecordedPayload,
  Priority,
} from './domain/types'
import { isDomain, isPriority } from './domain/types'

export class CommandError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CommandError'
  }
}

function newId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `id_${Math.random().toString(36).slice(2)}_${Date.now()}`
}

export async function genesis(chain: readonly ChainEntry[], ts: number): Promise<ChainEntry> {
  return appendEntry(chain, 'ledger.genesis', { protocol: 'hypotrophy-hce', version: 1 }, ts)
}

export async function createGoal(
  chain: readonly ChainEntry[],
  input: {
    title: string
    description?: string
    domain: Domain
    priority: Priority
    dependsOn?: string[]
    estimatedMinutes?: number
    id?: string
  },
  ts: number
): Promise<ChainEntry> {
  const title = input.title.trim()
  if (title.length < 2) throw new CommandError('title must be at least 2 characters')
  if (title.length > 200) throw new CommandError('title is too long')
  if (!isDomain(input.domain)) throw new CommandError('unknown domain')
  if (!isPriority(input.priority)) throw new CommandError('unknown priority')
  const estimatedMinutes = input.estimatedMinutes ?? 30
  if (!Number.isInteger(estimatedMinutes) || estimatedMinutes < 5 || estimatedMinutes > 1440) {
    throw new CommandError('estimatedMinutes must be an integer between 5 and 1440')
  }
  const payload: GoalCreatedPayload = {
    id: input.id ?? newId(),
    title,
    description: input.description?.trim().slice(0, 2000) || undefined,
    domain: input.domain,
    priority: input.priority,
    dependsOn: input.dependsOn ?? [],
    estimatedMinutes,
  }
  return appendEntry(chain, 'goal.created', payload, ts)
}

export async function completeGoal(
  chain: readonly ChainEntry[],
  id: string,
  ts: number
): Promise<ChainEntry> {
  const payload: GoalIdPayload = { id }
  return appendEntry(chain, 'goal.completed', payload, ts)
}

export async function abandonGoal(
  chain: readonly ChainEntry[],
  id: string,
  ts: number,
  reason?: string
): Promise<ChainEntry> {
  const payload: GoalAbandonedPayload = { id, reason }
  return appendEntry(chain, 'goal.abandoned', payload, ts)
}

export async function deleteGoal(
  chain: readonly ChainEntry[],
  id: string,
  ts: number
): Promise<ChainEntry> {
  const payload: GoalIdPayload = { id }
  return appendEntry(chain, 'goal.deleted', payload, ts)
}

export async function linkGoal(
  chain: readonly ChainEntry[],
  id: string,
  dependsOn: string[],
  ts: number
): Promise<ChainEntry> {
  const payload: GoalLinkedPayload = { id, dependsOn }
  return appendEntry(chain, 'goal.linked', payload, ts)
}

export async function recordInsight(
  chain: readonly ChainEntry[],
  input: InsightRecordedPayload,
  ts: number
): Promise<ChainEntry> {
  return appendEntry(chain, 'insight.recorded', input, ts)
}

export const EVENT_TYPES: EngineEventType[] = [
  'ledger.genesis',
  'goal.created',
  'goal.completed',
  'goal.abandoned',
  'goal.deleted',
  'goal.linked',
  'insight.recorded',
]
