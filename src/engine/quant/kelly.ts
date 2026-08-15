import { DOMAINS, PRIORITY_WEIGHT, type Domain, type Goal } from '../domain/types'

/**
 * Half-Kelly time allocation across life domains.
 *
 * Classic Kelly fraction for a binary bet with net odds b and win prob p:
 *   f* = (b p − q) / b = p − q/b
 * where q = 1 − p.
 *
 * Here a "bet" is an hour of attention in a domain.
 *   p  = empirical completion rate with Laplace smoothing (posterior mean)
 *   b  = expected payoff / unit cost, using priority as payoff
 *
 * Full Kelly is too aggressive on noisy personal data (the same reason
 * desks use half-Kelly). We publish integer basis points so receipts
 * stay canonical-integer-safe.
 */

export interface KellySlice {
  domain: Domain
  p: number
  odds: number
  fullBps: number
  bps: number
}

const LAPLACE_A = 1
const LAPLACE_B = 1
const HALF = 0.5

export function kellyPlan(goals: Goal[]): KellySlice[] {
  const raw = DOMAINS.map((domain) => slice(domain, goals)).filter((s) => s.fullBps > 0)
  const half = raw.map((s) => ({ ...s, bps: Math.floor(s.fullBps * HALF) }))
  const total = half.reduce((n, s) => n + s.bps, 0)
  if (total <= 0) {
    return DOMAINS.map((domain) => ({
      domain,
      p: 0.5,
      odds: 1,
      fullBps: 0,
      bps: Math.floor(10000 / DOMAINS.length),
    }))
  }
  return half
    .map((s) => ({ ...s, bps: Math.round((s.bps / total) * 10000) }))
    .sort((a, b) => b.bps - a.bps)
}

function slice(domain: Domain, goals: Goal[]): KellySlice {
  const inDomain = goals.filter((g) => g.domain === domain)
  const successes = inDomain.filter((g) => g.status === 'completed').length
  const failures = inDomain.filter((g) => g.status === 'abandoned').length
  const p = (successes + LAPLACE_A) / (successes + failures + LAPLACE_A + LAPLACE_B)

  const open = inDomain.filter((g) => g.status === 'open')
  const payoff =
    open.length === 0
      ? 1
      : open.reduce((n, g) => n + PRIORITY_WEIGHT[g.priority], 0) / open.length
  const odds = Math.max(0.1, payoff)
  const q = 1 - p
  const f = p - q / odds
  const fullBps = Math.max(0, Math.floor(f * 10000))

  return { domain, p, odds, fullBps, bps: fullBps }
}
