import { medianSurvival } from './survival'
import type { AllocationPlan } from './allocator'
import type { CapitalBook } from './wealth'
import type { ForwardBook } from './forward'

export interface CioInput {
  plan: AllocationPlan
  book: CapitalBook
  forward: ForwardBook
}

/**
 * Deterministic CIO memo from the same numbers the Floor shows.
 * Gemini may rewrite tone; it must not invent probabilities.
 */
export function draftMemo(input: CioInput): string {
  const { plan, book, forward } = input
  const next = plan.next
  const median = medianSurvival(plan.survival)
  const medianLabel = formatMedian(median)
  const topKelly = plan.kelly[0]
  const leak = plan.kelly[plan.kelly.length - 1]
  const unlock = book.unlocks[0]
  const nextP = next ? forward.goals.find((g) => g.goalId === next.goalId) : undefined
  const hit =
    plan.survival.n === 0 ? 0 : Math.round((plan.survival.events / plan.survival.n) * 100)

  const line1 = next
    ? `The desk's only legal fill is "${next.title}" — unblocked, ${next.domain}, ħ${book.priced.find((p) => p.goalId === next.goalId)?.hbar ?? 0}. Forward book: ${pct(nextP?.p7)} in 7d, ${pct(nextP?.p30)} in 30d under ${forward.capacityMinutesPerDay} focused minutes/day.`
    : 'The book has no eligible fill. Write a position with clear prerequisites or cut a cycle.'

  const line2 = topKelly
    ? `Half-Kelly concentrates ${bps(topKelly.bps)} of attention into ${topKelly.domain} (p=${topKelly.p.toFixed(2)}, odds ${topKelly.odds.toFixed(2)}). Treat ${leak?.domain ?? 'thin domains'} as a residual, not a personality project.`
    : 'Kelly is uniform — the posterior has not seen enough closes to have an opinion.'

  const line3 = unlock
    ? `Highest unlock: finish "${unlock.title}" and ${unlock.unlockIds.length} blocked claim${unlock.unlockIds.length === 1 ? '' : 's'} become eligible (ħ${unlock.unlockHbar} behind the door). That is the cheap alpha — one fill, more optionality.`
    : `7-day expected clear is ħ${forward.expectedHbar.d7} / ${forward.expectedMinutes.d7}m. 30-day ħ${forward.expectedHbar.d30}. Do not confuse motion with NAV.`

  const line4 = `Hit rate on the chain is ${hit}% (${plan.survival.events} events, ${plan.survival.censored} censored). Median time-to-done ${medianLabel}. Claimed dollar stakes on open work: ${usd(book.claimedCents)}. The model does not know the market. It knows whether *you* finish.`

  return [line1, line2, line3, line4].join(' ')
}

export function cioPayload(input: CioInput) {
  const { plan, book, forward } = input
  return {
    next: plan.next
      ? {
          title: plan.next.title,
          domain: plan.next.domain,
          kellyBps: plan.next.kellyBps,
          thompson: round3(plan.next.thompson),
          hbar: book.priced.find((p) => p.goalId === plan.next?.goalId)?.hbar ?? 0,
          p7: round3(forward.goals.find((g) => g.goalId === plan.next?.goalId)?.p7 ?? 0),
          p30: round3(forward.goals.find((g) => g.goalId === plan.next?.goalId)?.p30 ?? 0),
        }
      : null,
    kelly: plan.kelly.slice(0, 4).map((k) => ({
      domain: k.domain,
      bps: k.bps,
      p: round3(k.p),
    })),
    navHbar: book.navHbar,
    realizedHbar: book.realizedHbar,
    claimedCents: book.claimedCents,
    criticalPathMinutes: plan.criticalPathMinutes,
    survival: {
      n: plan.survival.n,
      events: plan.survival.events,
      censored: plan.survival.censored,
    },
    forward: {
      capacityMinutesPerDay: forward.capacityMinutesPerDay,
      expectedHbar7: forward.expectedHbar.d7,
      expectedHbar30: forward.expectedHbar.d30,
      expectedFills7: forward.expectedFills.d7,
      expectedFills30: forward.expectedFills.d30,
    },
    unlock: book.unlocks[0]
      ? { title: book.unlocks[0].title, unlockHbar: book.unlocks[0].unlockHbar }
      : null,
  }
}

function pct(p: number | undefined): string {
  return `${Math.round((p ?? 0) * 100)}%`
}

function bps(n: number): string {
  return `${(n / 100).toFixed(1)}%`
}

function usd(cents: number): string {
  if (cents <= 0) return 'none declared'
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}

function formatMedian(ms: number | null): string {
  if (ms == null) return 'n/a'
  if (ms < 86_400_000) return `${Math.max(1, Math.round(ms / 3_600_000))}h`
  return `${(ms / 86_400_000).toFixed(1)}d`
}
