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
  createdAt: number
  completedAt?: number
  abandonedAt?: number
  status: GoalStatus
}

export interface Insight {
  id: string
  kind: 'suggestion' | 'analysis' | 'encouragement' | 'warning'
  title: string
  content: string
  domain?: Domain
  createdAt: number
  relevantGoalIds: string[]
}

export type EngineEventType =
  | 'ledger.genesis'
  | 'goal.created'
  | 'goal.completed'
  | 'goal.abandoned'
  | 'goal.deleted'
  | 'goal.linked'
  | 'insight.recorded'

export interface GoalCreatedPayload {
  id: string
  title: string
  description?: string
  domain: Domain
  priority: Priority
  dependsOn: string[]
  estimatedMinutes: number
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

export type EnginePayload =
  | GenesisPayload
  | GoalCreatedPayload
  | GoalIdPayload
  | GoalAbandonedPayload
  | GoalLinkedPayload
  | InsightRecordedPayload

export interface Projection {
  protocol: 'hypotrophy-hce'
  version: 1
  goals: Record<string, Goal>
  insights: Insight[]
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
