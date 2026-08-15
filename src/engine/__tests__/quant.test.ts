import { describe, expect, it } from 'vitest'
import { mulberry32, sampleGamma, thompsonSelect, type BanditArm } from '../quant/bandit'
import { kellyPlan } from '../quant/kelly'
import { kaplanMeier, medianSurvival } from '../quant/survival'
import { allocate } from '../quant/allocator'
import type { Goal } from '../domain/types'

describe('Thompson sampling', () => {
  it('is deterministic for a fixed seed', () => {
    const arms: BanditArm[] = [
      { id: 'career', alpha: 8, beta: 2 },
      { id: 'health', alpha: 2, beta: 8 },
    ]
    const a = thompsonSelect(arms, mulberry32(7))
    const b = thompsonSelect(arms, mulberry32(7))
    expect(a).toEqual(b)
    expect(a[0].id).toBe('career')
  })

  it('samples Gamma with mean near shape for large n', () => {
    const rng = mulberry32(99)
    let sum = 0
    const n = 4000
    for (let i = 0; i < n; i++) sum += sampleGamma(4, rng)
    const mean = sum / n
    expect(mean).toBeGreaterThan(3.5)
    expect(mean).toBeLessThan(4.5)
  })
})

describe('half-Kelly allocation', () => {
  it('over-weights a domain with completions and high-priority open work', () => {
    const goals: Goal[] = [
      {
        id: '1',
        title: 'done',
        domain: 'career',
        priority: 'high',
        dependsOn: [],
        estimatedMinutes: 30,
        createdAt: 0,
        status: 'completed',
        completedAt: 1,
      },
      {
        id: '2',
        title: 'next',
        domain: 'career',
        priority: 'high',
        dependsOn: [],
        estimatedMinutes: 30,
        createdAt: 2,
        status: 'open',
      },
      {
        id: '3',
        title: 'skipped',
        domain: 'health',
        priority: 'low',
        dependsOn: [],
        estimatedMinutes: 30,
        createdAt: 0,
        status: 'abandoned',
        abandonedAt: 3,
      },
    ]
    const plan = kellyPlan(goals)
    const career = plan.find((s) => s.domain === 'career')
    const health = plan.find((s) => s.domain === 'health')
    expect(career).toBeTruthy()
    expect(career!.bps).toBeGreaterThan(health?.bps ?? 0)
    expect(plan.reduce((n, s) => n + s.bps, 0)).toBeGreaterThanOrEqual(9900)
  })
})

describe('Kaplan-Meier', () => {
  it('drops survival at event times and treats open goals as censored', () => {
    const now = 100
    const goals: Goal[] = [
      {
        id: 'a',
        title: 'a',
        domain: 'personal',
        priority: 'low',
        dependsOn: [],
        estimatedMinutes: 10,
        createdAt: 0,
        status: 'completed',
        completedAt: 10,
      },
      {
        id: 'b',
        title: 'b',
        domain: 'personal',
        priority: 'low',
        dependsOn: [],
        estimatedMinutes: 10,
        createdAt: 0,
        status: 'completed',
        completedAt: 10,
      },
      {
        id: 'c',
        title: 'c',
        domain: 'personal',
        priority: 'low',
        dependsOn: [],
        estimatedMinutes: 10,
        createdAt: 0,
        status: 'open',
      },
    ]
    const curve = kaplanMeier(goals, now)
    expect(curve.n).toBe(3)
    expect(curve.events).toBe(2)
    expect(curve.censored).toBe(1)
    const at10 = curve.points.find((p) => p.t === 10)
    expect(at10?.survival).toBeCloseTo(1 - 2 / 3, 8)
    expect(medianSurvival(curve)).toBe(10)
  })
})

describe('allocator', () => {
  it('never recommends a blocked goal as next', () => {
    const now = 50
    const goals: Goal[] = [
      {
        id: 'root',
        title: 'Root',
        domain: 'career',
        priority: 'high',
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
        createdAt: 1,
        status: 'open',
      },
    ]
    const plan = allocate(goals, now, 1)
    expect(plan.next?.goalId).toBe('root')
    expect(plan.ranked.find((r) => r.goalId === 'child')?.blocked).toBe(true)
  })
})
