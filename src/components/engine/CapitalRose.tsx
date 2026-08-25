'use client'

import type { KellySlice } from '@/engine'
import { DOMAIN_META } from '@/lib/format'

export default function CapitalRose({ kelly }: { kelly: KellySlice[] }) {
  const n = kelly.length || 1
  const cx = 160
  const cy = 160
  const r = 118
  const max = Math.max(1, ...kelly.map((s) => s.bps))
  const pts = kelly.map((s, i) => {
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2
    const rr = 28 + (s.bps / max) * r
    return { s, x: cx + Math.cos(ang) * rr, y: cy + Math.sin(ang) * rr, lx: cx + Math.cos(ang) * (r + 28), ly: cy + Math.sin(ang) * (r + 28) }
  })
  const poly = pts.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox="0 0 320 320" className="mx-auto w-full max-w-[320px]" role="img" aria-label="Kelly capital rose">
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <circle key={t} cx={cx} cy={cy} r={28 + r * t} fill="none" stroke="rgba(239,230,210,0.08)" />
      ))}
      {pts.map((p) => (
        <line key={p.s.domain} x1={cx} y1={cy} x2={p.lx} y2={p.ly} stroke="rgba(239,230,210,0.08)" />
      ))}
      <polygon points={poly} fill="rgba(212,160,84,0.16)" stroke="#d4a054" strokeWidth="1.5" />
      {pts.map((p) => (
        <g key={p.s.domain}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#d4a054" />
          <text
            x={p.lx}
            y={p.ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#9a8f7a"
            fontSize="9"
            fontFamily="IBM Plex Mono, monospace"
          >
            {DOMAIN_META[p.s.domain].mark}
          </text>
        </g>
      ))}
    </svg>
  )
}
