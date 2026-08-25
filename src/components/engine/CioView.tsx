'use client'

import { useState } from 'react'
import type { HypotrophyEngine } from '@/hooks/useEngine'
import { BiscuitMark } from '../BiscuitMark'
import { aiService } from '@/lib/aiService'
import { useToast } from '../Toast'
import { formatHbar, formatUsd } from '@/lib/format'

export default function CioView({ engine }: { engine: HypotrophyEngine }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [modelText, setModelText] = useState<string | null>(null)
  const memos = engine.projection.insights.filter((i) => i.kind === 'memo' || i.kind === 'analysis')

  const runModel = async () => {
    if (busy) return
    setBusy(true)
    try {
      const insight = await aiService.generateCioMemo(engine.briefing, engine.memo)
      setModelText(insight.content)
      await engine.note({
        id: insight.id,
        kind: 'memo',
        title: insight.title,
        content: insight.content,
        relevantGoalIds: insight.relevantTasks ?? [],
      })
      toast('CIO memo written to the chain')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <section className="panel overflow-hidden lg:col-span-7">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-6 py-5">
          <BiscuitMark size={40} />
          <div>
            <div className="kicker">Chief investment officer</div>
            <h2 className="font-display text-2xl text-[var(--paper)]">Memo on this book</h2>
          </div>
        </div>
        <div className="space-y-5 px-6 py-6">
          <article>
            <div className="kicker">Desk — deterministic</div>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--paper)]">{engine.memo}</p>
          </article>
          {modelText && (
            <article>
              <div className="kicker">Model — grounded rewrite</div>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--mute)]">{modelText}</p>
            </article>
          )}
          <p className="text-sm text-[var(--mute)]">
            The model is not allowed to invent probabilities. It receives NAV {formatHbar(engine.book.navHbar)},
            claimed {formatUsd(engine.book.claimedCents)}, and the forward book. If Gemini is down, the
            deterministic memo still stands.
          </p>
          <button type="button" className="btn-gold" onClick={() => void runModel()} disabled={busy}>
            {busy ? 'Underwriting…' : 'Ask the model to underwrite'}
          </button>
        </div>
      </section>
      <aside className="space-y-4 lg:col-span-5">
        <section className="panel p-5">
          <div className="kicker">What the model is given</div>
          <pre className="mt-3 max-h-80 overflow-auto font-mono text-[10px] leading-relaxed text-[var(--mute)]">
            {JSON.stringify(engine.briefing, null, 2)}
          </pre>
        </section>
        <section className="panel p-5">
          <div className="kicker">Memos on chain</div>
          {memos.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--mute)]">None yet. The deterministic memo is live above; writing it to the chain is optional.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {memos.slice(0, 6).map((m) => (
                <li key={m.id}>
                  <div className="font-display text-[var(--paper)]">{m.title}</div>
                  <p className="mt-1 line-clamp-4 text-sm text-[var(--mute)]">{m.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  )
}
