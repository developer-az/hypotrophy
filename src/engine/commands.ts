import { appendEntry, type ChainEntry } from './crypto/chain'
import type {
  AccountKind,
  Domain,
  EngineEventType,
  GoalAbandonedPayload,
  GoalCreatedPayload,
  GoalIdPayload,
  GoalLinkedPayload,
  InsightRecordedPayload,
  MoneyKind,
  Priority,
} from './domain/types'
import { isAccountKind, isDomain, isMoneyKind, isPriority } from './domain/types'

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
    stakeCents?: number
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
  if (input.stakeCents != null) {
    if (!Number.isInteger(input.stakeCents) || input.stakeCents < 0 || input.stakeCents > 50_000_000) {
      throw new CommandError('stakeCents must be an integer between 0 and 50000000')
    }
    payload.stakeCents = input.stakeCents
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

export async function openAccount(
  chain: readonly ChainEntry[],
  input: { id?: string; name: string; kind: AccountKind },
  ts: number
): Promise<ChainEntry> {
  const name = input.name.trim()
  if (name.length < 1 || name.length > 80) throw new CommandError('account name must be 1–80 characters')
  if (!isAccountKind(input.kind)) throw new CommandError('unknown account kind')
  return appendEntry(
    chain,
    'account.opened',
    { id: input.id ?? newId(), name, kind: input.kind },
    ts
  )
}

export async function setAccountBalance(
  chain: readonly ChainEntry[],
  id: string,
  cents: number,
  ts: number
): Promise<ChainEntry> {
  if (!id) throw new CommandError('account id required')
  if (!Number.isInteger(cents) || Math.abs(cents) > 500_000_000) {
    throw new CommandError('balance must be integer cents within ±$5,000,000')
  }
  return appendEntry(chain, 'account.balanced', { id, cents }, ts)
}

export async function postMoney(
  chain: readonly ChainEntry[],
  input: { id?: string; accountId: string; cents: number; kind: MoneyKind; memo?: string },
  ts: number
): Promise<ChainEntry> {
  if (!input.accountId) throw new CommandError('account id required')
  if (!isMoneyKind(input.kind)) throw new CommandError('unknown money kind')
  if (!Number.isInteger(input.cents) || input.cents <= 0 || input.cents > 500_000_000) {
    throw new CommandError('amount must be a positive integer in cents')
  }
  return appendEntry(
    chain,
    'money.posted',
    {
      id: input.id ?? newId(),
      accountId: input.accountId,
      cents: input.cents,
      kind: input.kind,
      memo: input.memo?.trim().slice(0, 200) || undefined,
    },
    ts
  )
}

export async function upsertSkill(
  chain: readonly ChainEntry[],
  input: { id?: string; name: string; domain: Domain; rateCentsPerHour: number },
  ts: number
): Promise<ChainEntry> {
  const name = input.name.trim()
  if (name.length < 1 || name.length > 80) throw new CommandError('skill name must be 1–80 characters')
  if (!isDomain(input.domain)) throw new CommandError('unknown domain')
  if (!Number.isInteger(input.rateCentsPerHour) || input.rateCentsPerHour < 0 || input.rateCentsPerHour > 500_000) {
    throw new CommandError('rate must be integer cents per hour, 0–500000')
  }
  return appendEntry(
    chain,
    'skill.upserted',
    {
      id: input.id ?? newId(),
      name,
      domain: input.domain,
      rateCentsPerHour: input.rateCentsPerHour,
    },
    ts
  )
}

export async function recordIntel(
  chain: readonly ChainEntry[],
  input: { id?: string; title: string; cents?: number; skillId?: string; note?: string },
  ts: number
): Promise<ChainEntry> {
  const title = input.title.trim()
  if (title.length < 2 || title.length > 120) throw new CommandError('intel title must be 2–120 characters')
  if (input.cents != null && (!Number.isInteger(input.cents) || input.cents < 0 || input.cents > 500_000_000)) {
    throw new CommandError('intel cents must be a non-negative integer')
  }
  return appendEntry(
    chain,
    'intel.recorded',
    {
      id: input.id ?? newId(),
      title,
      cents: input.cents,
      skillId: input.skillId,
      note: input.note?.trim().slice(0, 2000) || undefined,
    },
    ts
  )
}

export const EVENT_TYPES: EngineEventType[] = [
  'ledger.genesis',
  'goal.created',
  'goal.completed',
  'goal.abandoned',
  'goal.deleted',
  'goal.linked',
  'insight.recorded',
  'account.opened',
  'account.balanced',
  'money.posted',
  'skill.upserted',
  'intel.recorded',
]
