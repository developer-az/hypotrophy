import type { AllocationPlan } from './allocator'
import type { PersonalPnl } from './pnl'
import type { ForwardBook } from './forward'

export interface CioInput {
  plan: AllocationPlan
  pnl: PersonalPnl
  forward: ForwardBook
  impactCents: number
}

/**
 * English briefing from the P&L. Gemini may rewrite tone; it must not invent dollars.
 */
export function draftMemo(input: CioInput): string {
  const { plan, pnl, forward, impactCents } = input
  const next = plan.next
  const nextP = next ? forward.goals.find((g) => g.goalId === next.goalId) : undefined

  const line1 = next
    ? `Do this now: "${next.title}". If you finish it, that is about ${usd(impactCents)} of claim plus skill time. Chance you complete it in 7 days: ${pct(nextP?.p7)}; in 90 days: ${pct(nextP?.p90)}.`
    : 'Nothing is ready to start. Add work with a dollar claim, or finish a blocker.'

  const line2 = `Net worth on this device is ${usd(pnl.netWorthCents)} (cash ${usd(pnl.cashCents)}, debt ${usd(pnl.liabilityCents)}). Monthly bills ${usd(pnl.burnCentsPerMonth)}. Blended skill rate ${usd(pnl.blendedRateCentsPerHour)}/hr.`

  const line3 =
    pnl.burnCentsPerMonth > 0 && pnl.blendedRateCentsPerHour > 0
      ? `At your rate you need about ${Math.max(1, Math.ceil(pnl.burnCentsPerMonth / pnl.blendedRateCentsPerHour))} billed hours a month to cover bills. 90-day expected profit if you follow the ranked work: ${usd(pnl.expectedProfit90dCents)}.`
      : `90-day expected profit if you follow the ranked work: ${usd(pnl.expectedProfit90dCents)}. Log cash and a skill rate so this number means something.`

  const line4 = `Open claims ${usd(pnl.claimedCents)}. The model does not know the market. It knows whether you finish, and what you said an hour of you is worth.`

  return [line1, line2, line3, line4].join(' ')
}

export function cioPayload(input: CioInput) {
  const { plan, pnl, forward, impactCents } = input
  return {
    next: plan.next
      ? {
          title: plan.next.title,
          domain: plan.next.domain,
          impactCents,
          p7: round3(forward.goals.find((g) => g.goalId === plan.next?.goalId)?.p7 ?? 0),
          p90: round3(forward.goals.find((g) => g.goalId === plan.next?.goalId)?.p90 ?? 0),
        }
      : null,
    pnl: {
      netWorthCents: pnl.netWorthCents,
      cashCents: pnl.cashCents,
      liabilityCents: pnl.liabilityCents,
      burnCentsPerMonth: pnl.burnCentsPerMonth,
      blendedRateCentsPerHour: pnl.blendedRateCentsPerHour,
      claimedCents: pnl.claimedCents,
      expectedProfit90dCents: pnl.expectedProfit90dCents,
      expectedHours90: pnl.expectedHours90,
    },
  }
}

function pct(p: number | undefined): string {
  return `${Math.round((p ?? 0) * 100)}%`
}

function usd(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  return `${sign}$${Math.abs(Math.round(cents / 100)).toLocaleString('en-US')}`
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}
