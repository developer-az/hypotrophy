import type { Goal } from '../domain/types'

/**
 * Goal dependency graph.
 *
 * Edge A → B means "A must finish before B starts" (A is a prerequisite).
 * We store dependsOn on B, so the edge is dep → goal.
 *
 * Cycle detection: DFS coloring (white/gray/black). A gray back-edge is a cycle.
 * Topological generations: Kahn's algorithm, O(V+E).
 * Critical path: longest path by remaining estimated minutes among reachable
 * open goals — the classic DAG longest-path DP after a topo order.
 */

export interface GraphNode {
  id: string
  title: string
  domain: Goal['domain']
  status: Goal['status']
  estimatedMinutes: number
  remainingMinutes: number
  dependsOn: string[]
  dependents: string[]
  generation: number
  onCriticalPath: boolean
  blocked: boolean
}

export interface GoalGraph {
  nodes: Record<string, GraphNode>
  order: string[]
  cycles: string[][]
  criticalPath: string[]
  criticalPathMinutes: number
}

export function buildGraph(goals: Goal[]): GoalGraph {
  const byId: Record<string, Goal> = Object.fromEntries(goals.map((g) => [g.id, g]))
  const nodes: Record<string, GraphNode> = {}

  for (const goal of goals) {
    const dependsOn = goal.dependsOn.filter((id) => byId[id])
    nodes[goal.id] = {
      id: goal.id,
      title: goal.title,
      domain: goal.domain,
      status: goal.status,
      estimatedMinutes: goal.estimatedMinutes,
      remainingMinutes: goal.status === 'open' ? goal.estimatedMinutes : 0,
      dependsOn,
      dependents: [],
      generation: 0,
      onCriticalPath: false,
      blocked: false,
    }
  }

  for (const node of Object.values(nodes)) {
    for (const dep of node.dependsOn) {
      nodes[dep].dependents.push(node.id)
    }
  }

  const cycles = findCycles(nodes)
  const cyclic = new Set(cycles.flat())
  const order = kahn(nodes).filter((id) => !cyclic.has(id))

  for (const id of Object.keys(nodes)) {
    nodes[id].blocked = nodes[id].status === 'open' && nodes[id].dependsOn.some((d) => nodes[d].status === 'open')
  }

  assignGenerations(nodes, order)
  const { path, minutes } = longestPath(nodes, order)
  for (const id of path) nodes[id].onCriticalPath = true

  return {
    nodes,
    order,
    cycles,
    criticalPath: path,
    criticalPathMinutes: minutes,
  }
}

function findCycles(nodes: Record<string, GraphNode>): string[][] {
  const WHITE = 0
  const GRAY = 1
  const BLACK = 2
  const color: Record<string, number> = {}
  const stack: string[] = []
  const cycles: string[][] = []

  for (const id of Object.keys(nodes)) color[id] = WHITE

  const dfs = (id: string) => {
    color[id] = GRAY
    stack.push(id)
    for (const next of nodes[id].dependents) {
      if (color[next] === GRAY) {
        const start = stack.indexOf(next)
        cycles.push(stack.slice(start).concat(next))
      } else if (color[next] === WHITE) {
        dfs(next)
      }
    }
    stack.pop()
    color[id] = BLACK
  }

  for (const id of Object.keys(nodes)) {
    if (color[id] === WHITE) dfs(id)
  }
  return cycles
}

function kahn(nodes: Record<string, GraphNode>): string[] {
  const indeg: Record<string, number> = {}
  for (const id of Object.keys(nodes)) indeg[id] = 0
  for (const node of Object.values(nodes)) {
    for (const dep of node.dependents) indeg[dep] += 1
  }

  const queue = Object.keys(nodes).filter((id) => indeg[id] === 0)
  const order: string[] = []
  while (queue.length) {
    const id = queue.shift()!
    order.push(id)
    for (const dep of nodes[id].dependents) {
      indeg[dep] -= 1
      if (indeg[dep] === 0) queue.push(dep)
    }
  }
  return order
}

function assignGenerations(nodes: Record<string, GraphNode>, order: string[]) {
  for (const id of order) {
    const node = nodes[id]
    let gen = 0
    for (const dep of node.dependsOn) {
      gen = Math.max(gen, nodes[dep].generation + 1)
    }
    node.generation = gen
  }
}

function longestPath(
  nodes: Record<string, GraphNode>,
  order: string[]
): { path: string[]; minutes: number } {
  const dist: Record<string, number> = {}
  const prev: Record<string, string | null> = {}

  for (const id of order) {
    dist[id] = nodes[id].remainingMinutes
    prev[id] = null
  }

  for (const id of order) {
    for (const next of nodes[id].dependents) {
      const cand = dist[id] + nodes[next].remainingMinutes
      if (cand > (dist[next] ?? 0)) {
        dist[next] = cand
        prev[next] = id
      }
    }
  }

  let end: string | null = null
  let best = -1
  for (const id of order) {
    if ((dist[id] ?? 0) > best) {
      best = dist[id]
      end = id
    }
  }
  if (end === null || best <= 0) return { path: [], minutes: 0 }

  const path: string[] = []
  let cur: string | null = end
  while (cur) {
    path.push(cur)
    cur = prev[cur] ?? null
  }
  path.reverse()
  return { path, minutes: best }
}

/** Goals whose open prerequisites are all done. */
export function eligibleGoalIds(graph: GoalGraph): string[] {
  return Object.values(graph.nodes)
    .filter((n) => n.status === 'open' && !n.blocked)
    .map((n) => n.id)
}
