export const DOMAINS = [
  'personal',
  'health',
  'career',
  'learning',
  'relationships',
  'finance',
  'creativity',
  'home',
] as const

export type Domain = (typeof DOMAINS)[number]
export type Priority = 'low' | 'medium' | 'high'
export type GoalStatus = 'open' | 'completed' | 'abandoned'
export const ACCOUNT_KINDS = ['cash', 'brokerage', 'credit', 'other'] as const
export type AccountKind = (typeof ACCOUNT_KINDS)[number]
export type MoneyKind = 'income' | 'expense'

export const PRIORITY_WEIGHT: Record<Priority, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

export interface Goal {
  id: string
  title: string
  description?: string
  domain: Domain
  priority: Priority
  dependsOn: string[]
  estimatedMinutes: number
  /** Optional dollar claim on this position, integer cents. Absent = unpriced. */
  stakeCents?: number
  createdAt: number
  completedAt?: number
  abandonedAt?: number
  status: GoalStatus
}

export interface Insight {
  id: string
  kind: 'suggestion' | 'analysis' | 'encouragement' | 'warning' | 'memo'
  title: string
  content: string
  domain?: Domain
  createdAt: number
  relevantGoalIds: string[]
}

export interface Account {
  id: string
  name: string
  kind: AccountKind
  /** Signed cents for cash/brokerage; amount owed (positive) for credit. */
  cents: number
  openedAt: number
  updatedAt: number
}

export interface MoneyPost {
  id: string
  accountId: string
  cents: number
  kind: MoneyKind
  memo?: string
  postedAt: number
}

export interface Skill {
  id: string
  name: string
  domain: Domain
  rateCentsPerHour: number
  updatedAt: number
}

export interface Intel {
  id: string
  title: string
  cents?: number
  skillId?: string
  note?: string
  createdAt: number
}

export type EngineEventType =
  | 'ledger.genesis'
  | 'goal.created'
  | 'goal.completed'
  | 'goal.abandoned'
  | 'goal.deleted'
  | 'goal.linked'
  | 'insight.recorded'
  | 'account.opened'
  | 'account.balanced'
  | 'money.posted'
  | 'skill.upserted'
  | 'intel.recorded'

export interface GoalCreatedPayload {
  id: string
  title: string
  description?: string
  domain: Domain
  priority: Priority
  dependsOn: string[]
  estimatedMinutes: number
  stakeCents?: number
}

export interface GoalIdPayload {
  id: string
}

export interface GoalAbandonedPayload {
  id: string
  reason?: string
}

export interface GoalLinkedPayload {
  id: string
  dependsOn: string[]
}

export interface InsightRecordedPayload {
  id: string
  kind: Insight['kind']
  title: string
  content: string
  domain?: Domain
  relevantGoalIds: string[]
}

export interface GenesisPayload {
  protocol: 'hypotrophy-hce'
  version: 1
}

export interface AccountOpenedPayload {
  id: string
  name: string
  kind: AccountKind
}

export interface AccountBalancedPayload {
  id: string
  cents: number
}

export interface MoneyPostedPayload {
  id: string
  accountId: string
  cents: number
  kind: MoneyKind
  memo?: string
}

export interface SkillUpsertedPayload {
  id: string
  name: string
  domain: Domain
  rateCentsPerHour: number
}

export interface IntelRecordedPayload {
  id: string
  title: string
  cents?: number
  skillId?: string
  note?: string
}

export type EnginePayload =
  | GenesisPayload
  | GoalCreatedPayload
  | GoalIdPayload
  | GoalAbandonedPayload
  | GoalLinkedPayload
  | InsightRecordedPayload
  | AccountOpenedPayload
  | AccountBalancedPayload
  | MoneyPostedPayload
  | SkillUpsertedPayload
  | IntelRecordedPayload

export interface Projection {
  protocol: 'hypotrophy-hce'
  version: 1
  goals: Record<string, Goal>
  insights: Insight[]
  accounts: Record<string, Account>
  skills: Record<string, Skill>
  money: MoneyPost[]
  intel: Intel[]
  genesisAt: number | null
  lastEventAt: number | null
  createdCount: number
  completedCount: number
  abandonedCount: number
}

export function emptyProjection(): Projection {
  return {
    protocol: 'hypotrophy-hce',
    version: 1,
    goals: {},
    insights: [],
    accounts: {},
    skills: {},
    money: [],
    intel: [],
    genesisAt: null,
    lastEventAt: null,
    createdCount: 0,
    completedCount: 0,
    abandonedCount: 0,
  }
}

export function isDomain(value: string): value is Domain {
  return (DOMAINS as readonly string[]).includes(value)
}

export function isPriority(value: string): value is Priority {
  return value === 'low' || value === 'medium' || value === 'high'
}

export function isAccountKind(value: string): value is AccountKind {
  return (ACCOUNT_KINDS as readonly string[]).includes(value)
}

export function isMoneyKind(value: string): value is MoneyKind {
  return value === 'income' || value === 'expense'
}
