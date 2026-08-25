import { DOMAINS, PRIORITY_WEIGHT, type Domain, type Goal, type Skill } from '../domain/types'
import { buildGraph, eligibleGoalIds } from '../graph/dag'
import { mulberry32, thompsonSelect, type BanditArm } from './bandit'
import { kellyPlan, type KellySlice } from './kelly'
import { kaplanMeier, type SurvivalCurve } from './survival'
import { hbarOf, newlyEligibleIfDone } from './wealth'
import { dollarImpact } from './pnl'

export const TWO_HOUR_MINUTES = 120

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
  hbar: number
  stakeCents: number
  estimatedMinutes: number
  /** Claim + skill time if this node finishes. */
  impactCents: number
  /** Dollar impact of work that becomes startable iff this node finishes. */
  optionCents: number
  /** Thompson sample × (impact + option). A prediction of you, not the market. */
  expectedCents: number
  /** Expected cents per hour so a short high-claim hour can beat a long one. */
  centsPerHour: number
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
 * Rank open work by expected dollars per hour on the feasible set.
 *
 *   E[$] = Thompson(domain) × (dollarImpact(node) + dollarImpact(unlocks))
 *
 * The DAG is a hard filter: blocked nodes are never `next`. Dollars cannot
 * promote them. Thompson is a draw from this writer's completion posterior,
 * not a calibrated market probability.
 */
export function allocate(goals: Goal[], now: number, seed = now, skills: Skill[] = []): AllocationPlan {
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
  const byId = Object.fromEntries(goals.map((g) => [g.id, g])) as Record<string, Goal>

  const eligible = new Set(eligibleGoalIds(graph))
  const ranked: NextAction[] = Object.values(graph.nodes)
    .filter((n) => n.status === 'open')
    .map((n) => {
      const goal = byId[n.id]
      const t = theta[n.domain] ?? 0.5
      const k = kellyByDomain[n.domain]?.bps ?? 0
      const crit = n.onCriticalPath ? 1.25 : 1
      const pri = PRIORITY_WEIGHT[goal.priority]
      const ageDays = Math.max(0, (now - goal.createdAt) / 86_400_000)
      const age = 1 + Math.min(ageDays, 21) / 42
      const hbar = hbarOf(goal, n.onCriticalPath)
      const impactCents = dollarImpact(goal, skills)
      const unlockIds = newlyEligibleIfDone(graph, n.id)
      const optionCents = unlockIds.reduce((sum, id) => {
        const child = byId[id]
        return sum + (child ? dollarImpact(child, skills) : 0)
      }, 0)
      const hours = Math.max(goal.estimatedMinutes, 1) / 60
      const expectedCents = Math.round(t * (impactCents + optionCents))
      const centsPerHour = Math.round(expectedCents / hours)
      const wealth = 1 + Math.log1p(hbar) / 8
      const money = 1 + Math.log1p(expectedCents / 100) / 6
      const score = t * (0.35 + k / 10000) * crit * pri * age * wealth * money
      const reasons: string[] = []
      if (n.onCriticalPath) reasons.push('on the critical path')
      if (optionCents > 0) {
        reasons.push(
          `unlocks about $${Math.round(optionCents / 100).toLocaleString('en-US')} of blocked work`
        )
      }
      if (k >= 2000) reasons.push('this area has been paying off')
      if (t > 0.6) reasons.push('your track record in this area is hot')
      if (goal.priority === 'high') reasons.push('you marked this high priority')
      if (impactCents > 0) {
        reasons.push(`about $${Math.round(impactCents / 100).toLocaleString('en-US')} if you finish`)
      }
      if (n.blocked) reasons.push('blocked — finish prerequisites first')
      if (!n.blocked && eligible.has(n.id)) reasons.push('ready to start')
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
        hbar,
        stakeCents: goal.stakeCents ?? 0,
        estimatedMinutes: goal.estimatedMinutes,
        impactCents,
        optionCents,
        expectedCents,
        centsPerHour,
      }
    })
    .sort((a, b) => {
      if (a.blocked !== b.blocked) return Number(a.blocked) - Number(b.blocked)
      if (a.centsPerHour !== b.centsPerHour) return b.centsPerHour - a.centsPerHour
      return b.score - a.score
    })

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

/**
 * Greedy two-hour book: replay the allocator, skipping work that does not
 * fit the remaining minutes. Blocked nodes never enter the sequence.
 */
export function nextHours(
  goals: Goal[],
  now: number,
  seed: number,
  skills: Skill[] = [],
  budgetMinutes = TWO_HOUR_MINUTES
): NextAction[] {
  const live: Goal[] = goals.map((g) => ({ ...g, dependsOn: g.dependsOn.slice() }))
  const out: NextAction[] = []
  let clock = 0
  let steps = 0
  const cap = Math.min(8, live.filter((g) => g.status === 'open').length + 1)

  while (clock < budgetMinutes && steps < cap) {
    steps += 1
    const plan = allocate(live, now, (seed + steps * 17) >>> 0, skills)
    const pick = plan.ranked.find((row) => {
      if (row.blocked) return false
      const g = live.find((x) => x.id === row.goalId)
      return Boolean(g && g.status === 'open' && clock + g.estimatedMinutes <= budgetMinutes)
    })
    if (!pick) break
    const idx = live.findIndex((x) => x.id === pick.goalId)
    const g = live[idx]
    clock += g.estimatedMinutes
    live[idx] = { ...g, status: 'completed', completedAt: now + clock * 60_000 }
    out.push(pick)
  }
  return out
}

function domainArms(goals: Goal[]): BanditArm[] {
  return DOMAINS.map((domain) => {
    const inDomain = goals.filter((g) => g.domain === domain)
    const successes = inDomain.filter((g) => g.status === 'completed').length
    const failures = inDomain.filter((g) => g.status === 'abandoned').length
    return { id: domain, alpha: 1 + successes, beta: 1 + failures }
  })
}
