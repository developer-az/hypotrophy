import { describe, expect, it } from 'vitest'
import { fold } from '../domain/reducer'
import {
  createGoal,
  genesis,
  openAccount,
  postMoney,
  recordIntel,
  setAccountBalance,
  upsertSkill,
} from '../commands'
import { allocate, nextHours } from '../quant/allocator'
import { forecast } from '../quant/forward'
import { BILLS_INTEL_ID, buildPnl, dollarImpact } from '../quant/pnl'
import { buildDemoLedger } from '../demo/fixture'
import type { Goal } from '../domain/types'

describe('money ledger', () => {
  it('nets cash minus credit and applies income and expense', async () => {
    const ts = 1_700_000_000_000
    let chain = [await genesis([], ts)]
    chain = [...chain, await openAccount(chain, { id: 'cash', name: 'Checking', kind: 'cash' }, ts + 1)]
    chain = [...chain, await setAccountBalance(chain, 'cash', 1_000_000, ts + 2)]
    chain = [...chain, await openAccount(chain, { id: 'card', name: 'Card', kind: 'credit' }, ts + 3)]
    chain = [...chain, await setAccountBalance(chain, 'card', 200_000, ts + 4)]
    chain = [
      ...chain,
      await postMoney(chain, { id: 'pay', accountId: 'cash', cents: 50_000, kind: 'income', memo: 'paycheck' }, ts + 5),
    ]
    chain = [
      ...chain,
      await postMoney(chain, { id: 'rent', accountId: 'cash', cents: 10_000, kind: 'expense', memo: 'lunch' }, ts + 6),
    ]
    const p = fold(chain)
    expect(p.accounts.cash.cents).toBe(1_040_000)
    expect(p.accounts.card.cents).toBe(200_000)
    const pnl = buildPnl(p, forecast([], ts + 6, 1, { paths: 4 }), ts + 6)
    expect(pnl.netWorthCents).toBe(1_040_000 - 200_000)
    expect(pnl.cashCents).toBe(1_040_000)
    expect(pnl.liabilityCents).toBe(200_000)
  })

  it('uses onboarded monthly bills for burn', async () => {
    const ts = 1_700_000_000_000
    let chain = [await genesis([], ts)]
    chain = [
      ...chain,
      await recordIntel(chain, { id: BILLS_INTEL_ID, title: 'Monthly bills', cents: 320_000 }, ts + 1),
    ]
    const pnl = buildPnl(fold(chain), forecast([], ts, 1, { paths: 4 }), ts)
    expect(pnl.burnCentsPerMonth).toBe(320_000)
  })

  it('computes runway days and hours to cover bills', async () => {
    const ts = 1_700_000_000_000
    let chain = [await genesis([], ts)]
    chain = [...chain, await openAccount(chain, { id: 'cash', name: 'Cash', kind: 'cash' }, ts + 1)]
    chain = [...chain, await setAccountBalance(chain, 'cash', 1_200_000, ts + 2)]
    chain = [
      ...chain,
      await recordIntel(chain, { id: BILLS_INTEL_ID, title: 'Monthly bills', cents: 300_000 }, ts + 3),
    ]
    chain = [
      ...chain,
      await upsertSkill(chain, { id: 'dev', name: 'Dev', domain: 'career', rateCentsPerHour: 10_000 }, ts + 4),
    ]
    const pnl = buildPnl(fold(chain), forecast([], ts, 1, { paths: 4 }), ts)
    expect(pnl.runwayDays).toBe(120)
    expect(pnl.hoursToCoverBills).toBe(30)
  })
})

describe('90d expected profit uses p90', () => {
  it('scales a claimed stake by forecast probability', async () => {
    const ts = 1_700_000_000_000
    let chain = [await genesis([], ts)]
    chain = [
      ...chain,
      await createGoal(
        chain,
        {
          id: 'job',
          title: 'Close the offer',
          domain: 'career',
          priority: 'high',
          estimatedMinutes: 60,
          stakeCents: 100_000,
        },
        ts + 1
      ),
    ]
    const projection = fold(chain)
    const goals = Object.values(projection.goals)
    const forward = forecast(goals, ts + 1, 7, { paths: 8, capacityMinutesPerDay: 180 })
    const pnl = buildPnl(projection, forward, ts + 1)
    const p90 = forward.goals.find((g) => g.goalId === 'job')?.p90 ?? 0
    expect(pnl.claimedCents).toBe(100_000)
    expect(pnl.expectedProfit90dCents).toBe(Math.round(100_000 * p90))
  })

  it('adds blended skill hours into 90d expected profit', async () => {
    const ts = 1_700_000_000_000
    let chain = [await genesis([], ts)]
    chain = [
      ...chain,
      await createGoal(
        chain,
        {
          id: 'bill',
          title: 'Billable block',
          domain: 'career',
          priority: 'high',
          estimatedMinutes: 120,
        },
        ts + 1
      ),
    ]
    chain = [
      ...chain,
      await upsertSkill(chain, { id: 'dev', name: 'Dev', domain: 'career', rateCentsPerHour: 10_000 }, ts + 2),
    ]
    const projection = fold(chain)
    const forward = forecast(Object.values(projection.goals), ts + 2, 7, { paths: 8, capacityMinutesPerDay: 180 })
    const pnl = buildPnl(projection, forward, ts + 2)
    const claims = 0
    expect(pnl.blendedRateCentsPerHour).toBe(10_000)
    expect(pnl.expectedProfit90dCents).toBe(claims + Math.round(10_000 * pnl.expectedHours90))
    expect(pnl.expectedHours90).toBeGreaterThan(0)
  })
})

describe('dollar impact and allocator', () => {
  it('prices hours at the skill rate plus the claim', () => {
    const goal: Goal = {
      id: 'g',
      title: 'Billable hour',
      domain: 'career',
      priority: 'high',
      dependsOn: [],
      estimatedMinutes: 60,
      stakeCents: 5000,
      createdAt: 0,
      status: 'open',
    }
    expect(dollarImpact(goal, [{ id: 's', name: 'Dev', domain: 'career', rateCentsPerHour: 15000, updatedAt: 0 }])).toBe(
      20000
    )
  })

  it('still never recommends a blocked goal as next', () => {
    const goals: Goal[] = [
      {
        id: 'root',
        title: 'Root',
        domain: 'career',
        priority: 'low',
        dependsOn: [],
        estimatedMinutes: 30,
        createdAt: 0,
        status: 'open',
      },
      {
        id: 'child',
        title: 'Child',
        domain: 'career',
        priority: 'high',
        dependsOn: ['root'],
        estimatedMinutes: 30,
        stakeCents: 9_000_000,
        createdAt: 1,
        status: 'open',
      },
    ]
    const plan = allocate(goals, 50, 1, [
      { id: 's', name: 'Dev', domain: 'career', rateCentsPerHour: 20000, updatedAt: 0 },
    ])
    expect(plan.next?.goalId).toBe('root')
    expect(plan.ranked.find((r) => r.goalId === 'child')?.blocked).toBe(true)
    expect(plan.next?.optionCents).toBeGreaterThan(0)
  })

  it('ranks a short high-claim hour above a long low-claim hour', () => {
    const goals: Goal[] = [
      {
        id: 'slow',
        title: 'Slow',
        domain: 'career',
        priority: 'high',
        dependsOn: [],
        estimatedMinutes: 240,
        stakeCents: 40_000,
        createdAt: 0,
        status: 'open',
      },
      {
        id: 'quick',
        title: 'Quick',
        domain: 'career',
        priority: 'high',
        dependsOn: [],
        estimatedMinutes: 30,
        stakeCents: 50_000,
        createdAt: 0,
        status: 'open',
      },
    ]
    const plan = allocate(goals, 50, 1)
    expect(plan.next?.goalId).toBe('quick')
    expect(plan.next!.centsPerHour).toBeGreaterThan(
      plan.ranked.find((r) => r.goalId === 'slow')!.centsPerHour
    )
  })

  it('never puts blocked work in the two-hour sequence', () => {
    const goals: Goal[] = [
      {
        id: 'a',
        title: 'A',
        domain: 'career',
        priority: 'high',
        dependsOn: [],
        estimatedMinutes: 30,
        createdAt: 0,
        status: 'open',
      },
      {
        id: 'b',
        title: 'B',
        domain: 'career',
        priority: 'high',
        dependsOn: [],
        estimatedMinutes: 30,
        createdAt: 1,
        status: 'open',
      },
      {
        id: 'c',
        title: 'C',
        domain: 'career',
        priority: 'high',
        dependsOn: ['a'],
        estimatedMinutes: 30,
        stakeCents: 9_000_000,
        createdAt: 2,
        status: 'open',
      },
    ]
    const seq = nextHours(goals, 50, 1, [], 60)
    expect(seq[0]?.goalId).not.toBe('c')
    expect(seq.reduce((n, s) => n + s.estimatedMinutes, 0)).toBeLessThanOrEqual(60)
    expect(seq.length).toBeGreaterThan(0)
    const aIdx = seq.findIndex((s) => s.goalId === 'a')
    const cIdx = seq.findIndex((s) => s.goalId === 'c')
    if (cIdx >= 0) {
      expect(aIdx).toBeGreaterThanOrEqual(0)
      expect(aIdx).toBeLessThan(cIdx)
    }
  })
})

describe('skills', () => {
  it('upserts a rate and lets intel reprice it', async () => {
    const ts = 1_700_000_000_000
    let chain = [await genesis([], ts)]
    chain = [
      ...chain,
      await upsertSkill(chain, { id: 'dev', name: 'TypeScript', domain: 'career', rateCentsPerHour: 8000 }, ts + 1),
    ]
    chain = [
      ...chain,
      await recordIntel(chain, { id: 'offer', title: 'New rate', cents: 12000, skillId: 'dev' }, ts + 2),
    ]
    expect(fold(chain).skills.dev.rateCentsPerHour).toBe(12000)
  })
})

describe('demo book', () => {
  it('surfaces an English next action, not a quant slogan', async () => {
    const chain = await buildDemoLedger(1_700_000_000_000)
    const projection = fold(chain)
    const goals = Object.values(projection.goals)
    const skills = Object.values(projection.skills)
    const plan = allocate(goals, 1_700_000_000_000, 1, skills)
    expect(plan.next?.title).toBe('Ship the next-action ranker')
    expect(plan.next?.title).not.toMatch(/Thompson|Kelly|ħ|tape|fill/i)
  })
})
