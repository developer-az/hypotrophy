import type { Domain, Goal } from './types'

export function domainStats(goals: Goal[]): Record<string, { completed: number; created: number }> {
  const out: Record<string, { completed: number; created: number }> = {}
  for (const goal of goals) {
    const bucket = out[goal.domain] ?? { completed: 0, created: 0 }
    bucket.created += 1
    if (goal.status === 'completed') bucket.completed += 1
    out[goal.domain] = bucket
  }
  return out
}

export function goalsInDomain(goals: Goal[], domain: Domain): Goal[] {
  return goals.filter((g) => g.domain === domain)
}
