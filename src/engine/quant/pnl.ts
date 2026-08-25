import type { Goal, Projection, Skill } from '../domain/types'
import type { ForwardBook } from './forward'

const MONTH_MS = 30 * 86_400_000
export const BILLS_INTEL_ID = 'intel-monthly-bills'

export interface PersonalPnl {
  netWorthCents: number
  cashCents: number
  liabilityCents: number
  burnCentsPerMonth: number
  blendedRateCentsPerHour: number
  claimedCents: number
  expectedProfit90dCents: number
  expectedHours90: number
}

/**
 * Personal P&L over the same ledger as work.
 * Net worth is declared snapshots plus posted income/expense — not a bank feed.
 * 90-day expected profit uses P(fill) from the forward book times declared claims,
 * plus blended skill rate times expected hours. That is still a prediction of *you*.
 */
export function buildPnl(
  projection: Projection,
  forward: ForwardBook,
  now: number
): PersonalPnl {
  const accounts = Object.values(projection.accounts)
  let cashCents = 0
  let liabilityCents = 0
  for (const a of accounts) {
    if (a.kind === 'credit') liabilityCents += Math.abs(a.cents)
    else cashCents += a.cents
  }
  const netWorthCents = cashCents - liabilityCents
  const skills = Object.values(projection.skills)
  const blendedRateCentsPerHour =
    skills.length === 0
      ? 0
      : Math.round(skills.reduce((n, s) => n + s.rateCentsPerHour, 0) / skills.length)

  const bills = projection.intel.find((i) => i.id === BILLS_INTEL_ID)
  const burned = expensesInWindow(projection, now - MONTH_MS, now)
  const burnCentsPerMonth = bills?.cents != null ? bills.cents : burned

  const open = Object.values(projection.goals).filter((g) => g.status === 'open')
  const claimedCents = open.reduce((n, g) => n + (g.stakeCents ?? 0), 0)
  const expectedHours90 = Math.round((forward.expectedMinutes.d90 / 60) * 10) / 10
  let expectedFromClaims = 0
  for (const g of open) {
    const row = forward.goals.find((f) => f.goalId === g.id)
    expectedFromClaims += Math.round((g.stakeCents ?? 0) * (row?.p90 ?? 0))
  }
  const expectedProfit90dCents =
    expectedFromClaims + Math.round(blendedRateCentsPerHour * expectedHours90)

  return {
    netWorthCents,
    cashCents,
    liabilityCents,
    burnCentsPerMonth,
    blendedRateCentsPerHour,
    claimedCents,
    expectedProfit90dCents,
    expectedHours90,
  }
}

/** Dollar value if this action is finished — claim plus hours at the matching skill rate. */
export function dollarImpact(goal: Goal, skills: Skill[]): number {
  const rate = rateForDomain(skills, goal.domain)
  const hours = goal.estimatedMinutes / 60
  return Math.round((goal.stakeCents ?? 0) + rate * hours)
}

export function dollarImpactFromNext(
  next: { goalId: string; stakeCents: number } | null,
  goals: Goal[],
  skills: Skill[]
): number {
  if (!next) return 0
  const goal = goals.find((g) => g.id === next.goalId)
  if (goal) return dollarImpact(goal, skills)
  return next.stakeCents
}

export function rateForDomain(skills: Skill[], domain: Goal['domain']): number {
  const match = skills.filter((s) => s.domain === domain)
  if (match.length === 0) {
    if (skills.length === 0) return 0
    return Math.round(skills.reduce((n, s) => n + s.rateCentsPerHour, 0) / skills.length)
  }
  return Math.round(match.reduce((n, s) => n + s.rateCentsPerHour, 0) / match.length)
}

function expensesInWindow(projection: Projection, from: number, to: number): number {
  return projection.money
    .filter((m) => m.kind === 'expense' && m.postedAt >= from && m.postedAt <= to)
    .reduce((n, m) => n + m.cents, 0)
}
