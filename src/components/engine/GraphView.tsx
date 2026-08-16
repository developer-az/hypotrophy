'use client'

import { useMemo } from 'react'
import type { HypotrophyEngine } from '@/hooks/useEngine'
import { DOMAIN_META } from '@/lib/format'

export default function GraphView({ engine }: { engine: HypotrophyEngine }) {
  const { graph } = engine
  const layout = useMemo(() => layoutGraph(graph), [graph])

  if (Object.keys(graph.nodes).length === 0) {
    return (
      <div className="panel p-10 text-center text-[var(--mute)]">
        No nodes yet. Commit goals with dependencies to see the DAG.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="kicker">Dependency graph</div>
        <h2 className="font-display text-3xl text-[var(--paper)]">Critical path {graph.criticalPathMinutes}m</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          Layered by topological generation. Gold nodes sit on the longest remaining path. A blocked
          node cannot be the allocator&apos;s next action — the DAG is a hard constraint.
        </p>
      </section>
      <div className="panel overflow-x-auto p-4">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="h-auto w-full min-h-[420px]"
          role="img"
          aria-label="Goal dependency graph"
        >
          {layout.edges.map((e) => (
            <line
              key={e.key}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={e.critical ? '#d4a054' : 'rgba(239,230,210,0.18)'}
              strokeWidth={e.critical ? 2 : 1}
            />
          ))}
          {layout.nodes.map((n) => (
            <g key={n.id} transform={`translate(${n.x},${n.y})`}>
              <rect
                x={-86}
                y={-28}
                width={172}
                height={56}
                rx={10}
                fill={n.onCriticalPath ? 'rgba(212,160,84,0.16)' : '#161410'}
                stroke={n.onCriticalPath ? '#d4a054' : 'rgba(239,230,210,0.16)'}
              />
              <text
                textAnchor="middle"
                y={-4}
                fill="#efe6d2"
                fontSize="11"
                fontFamily="IBM Plex Sans, sans-serif"
              >
                {n.title.slice(0, 22)}
              </text>
              <text
                textAnchor="middle"
                y={14}
                fill="#9a8f7a"
                fontSize="9"
                fontFamily="IBM Plex Mono, monospace"
              >
                {DOMAIN_META[n.domain].label} · gen {n.generation}
                {n.blocked ? ' · blocked' : ''}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

function layoutGraph(graph: HypotrophyEngine['graph']) {
  const cols: Record<number, string[]> = {}
  for (const node of Object.values(graph.nodes)) {
    const g = node.generation
    cols[g] = cols[g] ?? []
    cols[g].push(node.id)
  }
  const generations = Object.keys(cols)
    .map(Number)
    .sort((a, b) => a - b)
  const colW = 220
  const rowH = 88
  const maxRows = Math.max(1, ...generations.map((g) => cols[g].length))
  const width = Math.max(640, generations.length * colW + 80)
  const height = Math.max(360, maxRows * rowH + 80)
  const pos: Record<string, { x: number; y: number }> = {}

  for (const gen of generations) {
    const ids = cols[gen]
    ids.forEach((id, i) => {
      const x = 110 + gen * colW
      const y = 50 + (height - 80) * ((i + 1) / (ids.length + 1))
      pos[id] = { x, y }
    })
  }

  const crit = new Set(graph.criticalPath)
  const edges: { key: string; x1: number; y1: number; x2: number; y2: number; critical: boolean }[] = []
  for (const node of Object.values(graph.nodes)) {
    for (const dep of node.dependsOn) {
      if (!pos[dep] || !pos[node.id]) continue
      edges.push({
        key: `${dep}->${node.id}`,
        x1: pos[dep].x,
        y1: pos[dep].y,
        x2: pos[node.id].x,
        y2: pos[node.id].y,
        critical: crit.has(dep) && crit.has(node.id),
      })
    }
  }

  return {
    width,
    height,
    edges,
    nodes: Object.values(graph.nodes).map((n) => ({
      ...n,
      x: pos[n.id]?.x ?? 0,
      y: pos[n.id]?.y ?? 0,
    })),
  }
}
