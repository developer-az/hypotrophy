import type { ChainEntry } from '../crypto/chain'
import {
  emptyProjection,
  isAccountKind,
  isDomain,
  isMoneyKind,
  isPriority,
  type Account,
  type Goal,
  type Projection,
  type Skill,
} from './types'

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
    accounts: { ...state.accounts },
    skills: { ...state.skills },
    money: state.money.slice(),
    intel: state.intel.slice(),
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
    case 'account.opened':
      return applyAccountOpened(next, entry)
    case 'account.balanced':
      return applyAccountBalanced(next, entry)
    case 'money.posted':
      return applyMoneyPosted(next, entry)
    case 'skill.upserted':
      return applySkill(next, entry)
    case 'intel.recorded':
      return applyIntel(next, entry)
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
  const stake = int(p.stakeCents, -1)
  if (stake >= 0 && stake <= 50_000_000) goal.stakeCents = stake
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
    kind !== 'warning' &&
    kind !== 'memo'
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

function applyAccountOpened(state: Projection, entry: ChainEntry): Projection {
  const p = entry.payload as Record<string, unknown>
  const id = str(p.id)
  const name = str(p.name).slice(0, 80)
  const kind = str(p.kind)
  if (!id || !name || state.accounts[id] || !isAccountKind(kind)) return state
  const account: Account = {
    id,
    name,
    kind,
    cents: 0,
    openedAt: entry.ts,
    updatedAt: entry.ts,
  }
  state.accounts[id] = account
  return state
}

function applyAccountBalanced(state: Projection, entry: ChainEntry): Projection {
  const p = entry.payload as Record<string, unknown>
  const id = str(p.id)
  const account = id ? state.accounts[id] : undefined
  if (!account) return state
  const cents = int(p.cents, Number.NaN)
  if (!Number.isInteger(cents) || Math.abs(cents) > 500_000_000) return state
  state.accounts[id] = { ...account, cents, updatedAt: entry.ts }
  return state
}

function applyMoneyPosted(state: Projection, entry: ChainEntry): Projection {
  const p = entry.payload as Record<string, unknown>
  const id = str(p.id)
  const accountId = str(p.accountId)
  const kind = str(p.kind)
  const account = accountId ? state.accounts[accountId] : undefined
  if (!id || !account || !isMoneyKind(kind)) return state
  if (state.money.some((m) => m.id === id)) return state
  const cents = int(p.cents, -1)
  if (cents <= 0 || cents > 500_000_000) return state
  const delta = kind === 'income' ? cents : -cents
  state.accounts[accountId] = {
    ...account,
    cents: account.cents + delta,
    updatedAt: entry.ts,
  }
  state.money.unshift({
    id,
    accountId,
    cents,
    kind,
    memo: optStr(p.memo)?.slice(0, 200),
    postedAt: entry.ts,
  })
  if (state.money.length > 200) state.money.length = 200
  return state
}

function applySkill(state: Projection, entry: ChainEntry): Projection {
  const p = entry.payload as Record<string, unknown>
  const id = str(p.id)
  const name = str(p.name).slice(0, 80)
  const domain = str(p.domain)
  if (!id || !name || !isDomain(domain)) return state
  const rate = int(p.rateCentsPerHour, -1)
  if (rate < 0 || rate > 500_000) return state
  const skill: Skill = {
    id,
    name,
    domain,
    rateCentsPerHour: rate,
    updatedAt: entry.ts,
  }
  state.skills[id] = skill
  return state
}

function applyIntel(state: Projection, entry: ChainEntry): Projection {
  const p = entry.payload as Record<string, unknown>
  const id = str(p.id)
  const title = str(p.title).slice(0, 120)
  if (!id || !title) return state
  const centsRaw = p.cents
  const cents =
    typeof centsRaw === 'number' && Number.isInteger(centsRaw) && centsRaw >= 0 && centsRaw <= 500_000_000
      ? centsRaw
      : undefined
  const skillId = optStr(p.skillId)
  if (skillId && state.skills[skillId] && cents != null) {
    state.skills[skillId] = { ...state.skills[skillId], rateCentsPerHour: cents, updatedAt: entry.ts }
  }
  const existing = state.intel.findIndex((i) => i.id === id)
  const item = {
    id,
    title,
    cents,
    skillId,
    note: optStr(p.note)?.slice(0, 2000),
    createdAt: entry.ts,
  }
  if (existing >= 0) state.intel[existing] = item
  else state.intel.unshift(item)
  if (state.intel.length > 50) state.intel.length = 50
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
