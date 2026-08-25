import { describe, expect, it } from 'vitest'
import { buildGraph } from '../graph/dag'
import { allocate } from '../quant/allocator'
import { forecast } from '../quant/forward'
import { draftMemo } from '../quant/memo'
import { COMPOUND_BPS, hbarOf, newlyEligibleIfDone, priceBook } from '../quant/wealth'
import { fold } from '../domain/reducer'
import { createGoal, genesis } from '../commands'
import type { Goal } from '../domain/types'

function g(partial: Partial<Goal> & Pick<Goal, 'id' | 'title' | 'domain'>): Goal {
  return {
    priority: 'medium',
    dependsOn: [],
    estimatedMinutes: 60,
    createdAt: 0,
    status: 'open',
    ...partial,
  }
}

describe('ħ pricing', () => {
  it('prices a career hour above a habitat hour', () => {
    const career = g({
      id: 'c',
      title: 'Ship',
      domain: 'career',
      priority: 'high',
      estimatedMinutes: 60,
    })
    const home = g({
      id: 'h',
      title: 'Desk',
      domain: 'home',
      priority: 'low',
      estimatedMinutes: 60,
    })
    expect(hbarOf(career, true)).toBeGreaterThan(hbarOf(home, false))
    expect(COMPOUND_BPS.finance).toBeGreaterThan(COMPOUND_BPS.home)
  })

  it('names the unlock behind an eligible blocker', () => {
    const goals: Goal[] = [
      g({ id: 'root', title: 'Root', domain: 'career', priority: 'high' }),
      g({
        id: 'child',
        title: 'Child',
        domain: 'finance',
        priority: 'high',
        dependsOn: ['root'],
        estimatedMinutes: 90,
      }),
    ]
    const graph = buildGraph(goals)
    expect(newlyEligibleIfDone(graph, 'root')).toEqual(['child'])
    const book = priceBook(goals, graph)
    const root = book.priced.find((p) => p.goalId === 'root')
    expect(root?.unlockIds).toEqual(['child'])
    expect(root?.unlockHbar).toBeGreaterThan(0)
    expect(book.unlocks[0]?.goalId).toBe('root')
  })
})

describe('forward book', () => {
  it('is deterministic and keeps probabilities in [0, 1]', () => {
    const goals: Goal[] = [
      g({ id: 'a', title: 'A', domain: 'career', priority: 'high', estimatedMinutes: 400 }),
      g({
        id: 'b',
        title: 'B',
        domain: 'career',
        priority: 'high',
        dependsOn: ['a'],
        estimatedMinutes: 400,
      }),
    ]
    const a = forecast(goals, 1, 42, { paths: 8, capacityMinutesPerDay: 90 })
    const b = forecast(goals, 1, 42, { paths: 8, capacityMinutesPerDay: 90 })
    expect(a).toEqual(b)
    for (const row of a.goals) {
      expect(row.p7).toBeGreaterThanOrEqual(0)
      expect(row.p7).toBeLessThanOrEqual(1)
      expect(row.p90).toBeGreaterThanOrEqual(row.p7 - 1e-9)
    }
    const root = a.goals.find((x) => x.goalId === 'a')
    const child = a.goals.find((x) => x.goalId === 'b')
    expect(root?.p7).toBeGreaterThan(child?.p7 ?? 1)
  })

  it('clears more minutes when daily capacity rises', () => {
    const goals: Goal[] = [
      g({ id: 'a', title: 'A', domain: 'learning', estimatedMinutes: 120 }),
      g({ id: 'b', title: 'B', domain: 'learning', estimatedMinutes: 120 }),
    ]
    const thin = forecast(goals, 1, 7, { paths: 8, capacityMinutesPerDay: 60 })
    const fat = forecast(goals, 1, 7, { paths: 8, capacityMinutesPerDay: 240 })
    expect(fat.expectedMinutes.d7).toBeGreaterThanOrEqual(thin.expectedMinutes.d7)
  })
})

describe('CIO memo', () => {
  it('does not invent a next when the book is empty', () => {
    const empty: Goal[] = []
    const plan = allocate(empty, 1, 1)
    const forward = forecast(empty, 1, 1, { paths: 4 })
    const pnl = {
      netWorthCents: 0,
      cashCents: 0,
      liabilityCents: 0,
      burnCentsPerMonth: 0,
      blendedRateCentsPerHour: 0,
      claimedCents: 0,
      expectedProfit90dCents: 0,
      expectedHours90: 0,
      runwayDays: null,
      hoursToCoverBills: null,
    }
    expect(draftMemo({ plan, pnl, forward, impactCents: 0 })).toMatch(/nothing is ready/i)
  })
})

describe('stake cents on create', () => {
  it('folds an integer claim and ignores junk', async () => {
    const ts = 1_700_000_000_000
    let chain = [await genesis([], ts)]
    chain = [
      ...chain,
      await createGoal(
        chain,
        { id: 's', title: 'Close the round', domain: 'career', priority: 'high', stakeCents: 250000 },
        ts + 1
      ),
    ]
    expect(fold(chain).goals.s.stakeCents).toBe(250000)
  })
})
