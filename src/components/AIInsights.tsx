'use client'

import { AIInsight } from '@/types'

interface AIInsightsProps {
  insights: AIInsight[]
}

export default function AIInsights({ insights }: AIInsightsProps) {
  if (insights.length === 0) {
    return (
      <div className="panel p-8 text-center">
        <div className="kicker">Insights</div>
        <p className="mt-3 text-[var(--mute)]">Ask Biscuit after the book has some history.</p>
      </div>
    )
  }

  return (
    <div className="panel p-6">
      <div className="kicker">Ledger notes</div>
      <h2 className="mb-4 font-display text-2xl text-[var(--paper)]">Biscuit&apos;s file</h2>
      <div className="space-y-3">
        {insights.map((insight) => (
          <article key={insight.id} className="rounded-2xl border border-[var(--line)] bg-[var(--ink)] p-4">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--gold)]">
              {insight.type}
            </div>
            <h3 className="font-display text-lg text-[var(--paper)]">{insight.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--mute)]">{insight.content}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
