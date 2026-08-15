import { describe, expect, it } from 'vitest'
import { buildGraph, eligibleGoalIds } from '../graph/dag'
import type { Goal } from '../domain/types'

function g(partial: Partial<Goal> & Pick<Goal, 'id' | 'title'>): Goal {
  return {
    domain: 'career',
    priority: 'medium',
    dependsOn: [],
    estimatedMinutes: 10,
    createdAt: 0,
    status: 'open',
    ...partial,
  }
}

describe('goal DAG', () => {
  it('computes topological generations and the critical path', () => {
    const goals: Goal[] = [
      g({ id: 'a', title: 'A', estimatedMinutes: 10 }),
      g({ id: 'b', title: 'B', estimatedMinutes: 50, dependsOn: ['a'] }),
      g({ id: 'c', title: 'C', estimatedMinutes: 5, dependsOn: ['a'] }),
      g({ id: 'd', title: 'D', estimatedMinutes: 20, dependsOn: ['b'] }),
    ]
    const graph = buildGraph(goals)
    expect(graph.order[0]).toBe('a')
    expect(graph.nodes.a.generation).toBe(0)
    expect(graph.nodes.d.generation).toBe(2)
    expect(graph.criticalPath).toEqual(['a', 'b', 'd'])
    expect(graph.criticalPathMinutes).toBe(80)
    expect(eligibleGoalIds(graph)).toEqual(['a'])
  })

  it('does not treat completed work as remaining on the critical path', () => {
    const goals: Goal[] = [
      g({ id: 'a', title: 'A', estimatedMinutes: 100, status: 'completed', completedAt: 1 }),
      g({ id: 'b', title: 'B', estimatedMinutes: 7, dependsOn: ['a'] }),
    ]
    const graph = buildGraph(goals)
    expect(graph.nodes.a.remainingMinutes).toBe(0)
    expect(eligibleGoalIds(graph)).toEqual(['b'])
    expect(graph.criticalPath).toEqual(['b'])
    expect(graph.criticalPathMinutes).toBe(7)
  })

  it('reports cycles instead of pretending to sort them', () => {
    const goals: Goal[] = [
      g({ id: 'a', title: 'A', dependsOn: ['c'] }),
      g({ id: 'b', title: 'B', dependsOn: ['a'] }),
      g({ id: 'c', title: 'C', dependsOn: ['b'] }),
    ]
    const graph = buildGraph(goals)
    expect(graph.cycles.length).toBeGreaterThan(0)
    expect(graph.cycles.some((c) => c.includes('a') && c.includes('b'))).toBe(true)
  })
})
