import { DOMAINS, PRIORITY_WEIGHT, type Domain, type Goal } from '../domain/types'
import type { GoalGraph } from '../graph/dag'

/**
 * Human-capital units (ħ).
 *
 * This is not a market forecast and not a promised return. It is a
 * dimensionless price so two hours can be compared: an hour that
 * compounds optionality (career, finance, learning) vs an hour of
 * habitat. Health is priced as duration of the compounding machine.
 *
 * When the user declares a dollar claim (`stakeCents`), expected value
 * is that claim times P(done by T) from the forward book — a prediction
 * of *this writer's* completion, not of the economy.
 *
 * Multipliers are basis points so every published number stays integer.
 */
export const COMPOUND_BPS: Record<Domain, number> = {
  finance: 4000,
  career: 3500,
  learning: 2800,
  health: 2600,
  relationships: 1900,
  creativity: 1700,
  personal: 1200,
  home: 1100,
}

export interface PricedGoal {
  goalId: string
  title: string
  domain: Domain
  hbar: number
  stakeCents: number
  onCriticalPath: boolean
  blocked: boolean
  unlockIds: string[]
  unlockHbar: number
}

export interface CapitalBook {
  navHbar: number
  realizedHbar: number
  openHbar: number
  claimedCents: number
  priced: PricedGoal[]
  unlocks: PricedGoal[]
}

/** Integer ħ for one goal. Critical-path work gets a 25% bottleneck premium. */
export function hbarOf(goal: Goal, onCriticalPath: boolean): number {
  const compound = COMPOUND_BPS[goal.domain]
  const pri = PRIORITY_WEIGHT[goal.priority]
  const crit = onCriticalPath ? 125 : 100
  return Math.max(0, Math.round((goal.estimatedMinutes * compound * pri * crit) / 10_000))
}

export function priceBook(goals: Goal[], graph: GoalGraph): CapitalBook {
  const priced: PricedGoal[] = goals.map((goal) => {
    const node = graph.nodes[goal.id]
    const onCriticalPath = Boolean(node?.onCriticalPath)
    const blocked = Boolean(node?.blocked)
    const unlockIds =
      goal.status === 'open' && node ? newlyEligibleIfDone(graph, goal.id) : []
    const unlockHbar = unlockIds.reduce((n, id) => {
      const g = goals.find((x) => x.id === id)
      const child = g ? graph.nodes[id] : undefined
      return n + (g ? hbarOf(g, Boolean(child?.onCriticalPath)) : 0)
    }, 0)
    return {
      goalId: goal.id,
      title: goal.title,
      domain: goal.domain,
      hbar: hbarOf(goal, onCriticalPath),
      stakeCents: goal.stakeCents ?? 0,
      onCriticalPath,
      blocked,
      unlockIds,
      unlockHbar,
    }
  })

  const realizedHbar = priced
    .filter((p) => goals.find((g) => g.id === p.goalId)?.status === 'completed')
    .reduce((n, p) => n + p.hbar, 0)
  const openHbar = priced
    .filter((p) => goals.find((g) => g.id === p.goalId)?.status === 'open')
    .reduce((n, p) => n + p.hbar, 0)
  const claimedCents = goals
    .filter((g) => g.status === 'open')
    .reduce((n, g) => n + (g.stakeCents ?? 0), 0)

  const unlocks = priced
    .filter((p) => {
      const g = goals.find((x) => x.id === p.goalId)
      return g?.status === 'open' && !p.blocked && p.unlockHbar > 0
    })
    .sort((a, b) => b.hbar + b.unlockHbar - (a.hbar + a.unlockHbar))

  return {
    navHbar: realizedHbar + openHbar,
    realizedHbar,
    openHbar,
    claimedCents,
    priced,
    unlocks,
  }
}

/** Dependents that become eligible iff this node fills and every other prereq is already done. */
export function newlyEligibleIfDone(graph: GoalGraph, id: string): string[] {
  const node = graph.nodes[id]
  if (!node) return []
  const out: string[] = []
  for (const depId of node.dependents) {
    const child = graph.nodes[depId]
    if (!child || child.status !== 'open') continue
    const remaining = child.dependsOn.filter((d) => d !== id && graph.nodes[d]?.status === 'open')
    if (remaining.length === 0) out.push(depId)
  }
  return out
}

export function domainCompoundLabel(domain: Domain): string {
  return `${(COMPOUND_BPS[domain] / 1000).toFixed(2)}×`
}

export function compoundTable(): { domain: Domain; bps: number }[] {
  return DOMAINS.map((domain) => ({ domain, bps: COMPOUND_BPS[domain] })).sort(
    (a, b) => b.bps - a.bps
  )
}
