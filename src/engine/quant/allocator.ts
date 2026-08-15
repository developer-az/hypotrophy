import { DOMAINS, PRIORITY_WEIGHT, type Domain, type Goal } from '../domain/types'
import { buildGraph, eligibleGoalIds } from '../graph/dag'
import { mulberry32, thompsonSelect, type BanditArm } from './bandit'
import { kellyPlan, type KellySlice } from './kelly'
import { kaplanMeier, type SurvivalCurve } from './survival'

export interface NextAction {
  goalId: string
  title: string
  domain: Domain
  score: number
  reasons: string[]
  thompson: number
  kellyBps: number
  onCriticalPath: boolean
  blocked: boolean
}

export interface AllocationPlan {
  next: NextAction | null
  ranked: NextAction[]
  kelly: KellySlice[]
  survival: SurvivalCurve
  criticalPath: string[]
  criticalPathMinutes: number
  cycles: string[][]
}

/**
 * Combine three independent signals into one ranking:
 *   1. Thompson sample of domain yield (exploration vs exploitation)
 *   2. Half-Kelly capital weight of that domain
 *   3. Critical-path membership + priority + mild age (anti-starvation)
 *
 * Eligible goals only: blocked nodes are never recommended. That is the
 * scheduler invariant — the DAG is a hard constraint, the quant layer
 * is a soft ranking on the feasible set.
 */
export function allocate(goals: Goal[], now: number, seed = now): AllocationPlan {
  const graph = buildGraph(goals)
  const kelly = kellyPlan(goals)
  const kellyByDomain = Object.fromEntries(kelly.map((s) => [s.domain, s])) as Record<
    Domain,
    KellySlice
  >
  const survival = kaplanMeier(goals, now)
  const rng = mulberry32(seed >>> 0)
  const arms = domainArms(goals)
  const sampled = thompsonSelect(arms, rng)
  const theta = Object.fromEntries(sampled.map((s) => [s.id, s.theta])) as Record<string, number>

  const eligible = new Set(eligibleGoalIds(graph))
  const ranked: NextAction[] = Object.values(graph.nodes)
    .filter((n) => n.status === 'open')
    .map((n) => {
      const goal = goals.find((g) => g.id === n.id)!
      const t = theta[n.domain] ?? 0.5
      const k = kellyByDomain[n.domain]?.bps ?? 0
      const crit = n.onCriticalPath ? 1.25 : 1
      const pri = PRIORITY_WEIGHT[goal.priority]
      const ageDays = Math.max(0, (now - goal.createdAt) / 86_400_000)
      const age = 1 + Math.min(ageDays, 21) / 42
      const feasible = eligible.has(n.id) ? 1 : 0.05
      const score = t * (0.35 + k / 10000) * crit * pri * age * feasible
      const reasons: string[] = []
      if (n.onCriticalPath) reasons.push('on the critical path')
      if (k >= 2000) reasons.push(`Kelly over-weights ${n.domain}`)
      if (t > 0.6) reasons.push('Thompson sample likes this domain today')
      if (goal.priority === 'high') reasons.push('high stated priority')
      if (n.blocked) reasons.push('blocked on unfinished prerequisites')
      if (!n.blocked && eligible.has(n.id)) reasons.push('prerequisites clear')
      return {
        goalId: n.id,
        title: n.title,
        domain: n.domain,
        score,
        reasons,
        thompson: t,
        kellyBps: k,
        onCriticalPath: n.onCriticalPath,
        blocked: n.blocked,
      }
    })
    .sort((a, b) => b.score - a.score)

  const next = ranked.find((r) => !r.blocked) ?? null
  return {
    next,
    ranked,
    kelly,
    survival,
    criticalPath: graph.criticalPath,
    criticalPathMinutes: graph.criticalPathMinutes,
    cycles: graph.cycles,
  }
}

function domainArms(goals: Goal[]): BanditArm[] {
  return DOMAINS.map((domain) => {
    const inDomain = goals.filter((g) => g.domain === domain)
    const successes = inDomain.filter((g) => g.status === 'completed').length
    const failures = inDomain.filter((g) => g.status === 'abandoned').length
    return { id: domain, alpha: 1 + successes, beta: 1 + failures }
  })
}
