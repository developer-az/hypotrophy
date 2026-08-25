import type { Goal } from '../domain/types'
import { allocate } from './allocator'
import { hbarOf } from './wealth'

export const DEFAULT_CAPACITY_MINUTES_PER_DAY = 150
export const DEFAULT_PATHS = 24
export const HORIZONS = [7, 30, 90] as const
export type HorizonDays = (typeof HORIZONS)[number]

export interface GoalForecast {
  goalId: string
  title: string
  p7: number
  p30: number
  p90: number
  expectedHbar7: number
  expectedHbar30: number
}

export interface ForwardBook {
  capacityMinutesPerDay: number
  paths: number
  expectedMinutes: { d7: number; d30: number; d90: number }
  expectedHbar: { d7: number; d30: number; d90: number }
  expectedFills: { d7: number; d30: number; d90: number }
  goals: GoalForecast[]
}

/**
 * Posterior predictive over the next T days.
 *
 * Each path replays the same allocator the UI uses, with a different
 * Thompson seed, spending a daily capacity budget. That is the only
 * honest "prediction past the current snapshot": not the market, not
 * the news — the distribution of *this DAG* under *this person's*
 * domain posteriors and stated durations.
 *
 * Blocked nodes never fill. Goals that do not fit the remaining
 * budget are skipped (stranded minutes), same as a real day.
 */
export function forecast(
  goals: Goal[],
  now: number,
  seed: number,
  opts?: { paths?: number; capacityMinutesPerDay?: number }
): ForwardBook {
  const paths = Math.max(4, Math.min(64, opts?.paths ?? DEFAULT_PATHS))
  const capacity = Math.max(30, opts?.capacityMinutesPerDay ?? DEFAULT_CAPACITY_MINUTES_PER_DAY)
  const open = goals.filter((g) => g.status === 'open')
  const tallies: Record<string, { c7: number; c30: number; c90: number }> = {}
  for (const g of open) tallies[g.id] = { c7: 0, c30: 0, c90: 0 }

  let min7 = 0
  let min30 = 0
  let min90 = 0
  let h7 = 0
  let h30 = 0
  let h90 = 0
  let f7 = 0
  let f30 = 0
  let f90 = 0

  for (let i = 0; i < paths; i++) {
    const s = (seed + i * 9973) >>> 0
    const r7 = simulate(goals, now, s, capacity * 7)
    const r30 = simulate(goals, now, s + 1, capacity * 30)
    const r90 = simulate(goals, now, s + 2, capacity * 90)
    min7 += r7.minutes
    min30 += r30.minutes
    min90 += r90.minutes
    h7 += r7.hbar
    h30 += r30.hbar
    h90 += r90.hbar
    f7 += r7.filled.size
    f30 += r30.filled.size
    f90 += r90.filled.size
    for (const id of open.map((g) => g.id)) {
      if (r7.filled.has(id)) tallies[id].c7 += 1
      if (r30.filled.has(id)) tallies[id].c30 += 1
      if (r90.filled.has(id)) tallies[id].c90 += 1
    }
  }

  const goalForecasts: GoalForecast[] = open.map((g) => {
    const t = tallies[g.id]
    const p7 = t.c7 / paths
    const p30 = t.c30 / paths
    const hbar = hbarOf(g, false)
    return {
      goalId: g.id,
      title: g.title,
      p7,
      p30,
      p90: t.c90 / paths,
      expectedHbar7: Math.round(hbar * p7),
      expectedHbar30: Math.round(hbar * p30),
    }
  })

  return {
    capacityMinutesPerDay: capacity,
    paths,
    expectedMinutes: {
      d7: Math.round(min7 / paths),
      d30: Math.round(min30 / paths),
      d90: Math.round(min90 / paths),
    },
    expectedHbar: {
      d7: Math.round(h7 / paths),
      d30: Math.round(h30 / paths),
      d90: Math.round(h90 / paths),
    },
    expectedFills: {
      d7: Math.round((f7 / paths) * 100) / 100,
      d30: Math.round((f30 / paths) * 100) / 100,
      d90: Math.round((f90 / paths) * 100) / 100,
    },
    goals: goalForecasts.sort((a, b) => b.p7 - a.p7 || b.p30 - a.p30),
  }
}

function simulate(
  goals: Goal[],
  now: number,
  seed: number,
  budget: number
): { filled: Set<string>; minutes: number; hbar: number } {
  const live: Goal[] = goals.map((g) => ({ ...g, dependsOn: g.dependsOn.slice() }))
  const filled = new Set<string>()
  let clock = 0
  let hbar = 0
  let steps = 0
  const cap = Math.min(48, live.filter((g) => g.status === 'open').length + 2)

  while (clock < budget && steps < cap) {
    steps += 1
    const plan = allocate(live, now, (seed + steps * 13) >>> 0)
    const pick = plan.ranked.find((row) => {
      if (row.blocked) return false
      const g = live.find((x) => x.id === row.goalId)
      return Boolean(g && g.status === 'open' && clock + g.estimatedMinutes <= budget)
    })
    if (!pick) break
    const idx = live.findIndex((x) => x.id === pick.goalId)
    const g = live[idx]
    clock += g.estimatedMinutes
    hbar += hbarOf(g, pick.onCriticalPath)
    live[idx] = { ...g, status: 'completed', completedAt: now + clock * 60_000 }
    filled.add(g.id)
  }

  return { filled, minutes: clock, hbar }
}
