'use client'

import { useState } from 'react'
import type { HypotrophyEngine, ViewId } from '@/hooks/useEngine'
import { BiscuitMark } from '../BiscuitMark'
import { shortHash } from '@/lib/format'
import CommandDeck from './CommandDeck'
import LedgerView from './LedgerView'
import GraphView from './GraphView'
import CapitalView from './CapitalView'
import ReceiptsView from './ReceiptsView'
import BiscuitConversation from '../BiscuitConversation'
import AIInsights from '../AIInsights'
import { aiService } from '@/lib/aiService'

const NAV: { id: ViewId; label: string }[] = [
  { id: 'command', label: 'Command' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'graph', label: 'Graph' },
  { id: 'capital', label: 'Capital' },
  { id: 'receipts', label: 'Receipts' },
  { id: 'biscuit', label: 'Biscuit' },
]

export default function AppShell({ engine }: { engine: HypotrophyEngine }) {
  const [view, setView] = useState<ViewId>('command')
  const [latest, setLatest] = useState('')
  const [asking, setAsking] = useState(false)

  const ask = async () => {
    if (asking) return
    setAsking(true)
    try {
      const insight = await aiService.generateProgressInsight(engine.goals)
      setLatest(insight.content)
      await engine.note({
        id: insight.id,
        kind: insight.type,
        title: insight.title,
        content: insight.content,
        relevantGoalIds: insight.relevantTasks ?? [],
      })
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--ink)]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <BiscuitMark size={36} />
            <div>
              <div className="font-display text-xl leading-none text-[var(--paper)]">Hypotrophy</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--mute)]">
                Human Capital Engine
              </div>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1" aria-label="Primary">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] ${
                  view === item.id
                    ? 'bg-[var(--gold)] text-[var(--ink)]'
                    : 'text-[var(--mute)] hover:text-[var(--paper)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">
              {engine.integrity.ok ? 'verified' : 'broken'} · {shortHash(engine.integrity.ok ? engine.integrity.head : 'err')}
            </span>
            <button type="button" className="btn-quiet" onClick={() => engine.loadDemo()}>
              Demo ledger
            </button>
            <button type="button" className="btn-quiet" onClick={ask} disabled={asking}>
              {asking ? '…' : 'Ask Biscuit'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {engine.error && (
          <div className="mb-6 rounded-2xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--gold)]">
            {engine.error}
          </div>
        )}
        {view === 'command' && <CommandDeck engine={engine} />}
        {view === 'ledger' && <LedgerView engine={engine} />}
        {view === 'graph' && <GraphView engine={engine} />}
        {view === 'capital' && <CapitalView engine={engine} />}
        {view === 'receipts' && <ReceiptsView engine={engine} />}
        {view === 'biscuit' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <BiscuitConversation
              aiResponse={latest}
              onResponseComplete={() => setLatest('')}
            />
            <AIInsights
              insights={engine.projection.insights.map((i) => ({
                id: i.id,
                type: i.kind,
                title: i.title,
                content: i.content,
                category: i.domain,
                createdAt: new Date(i.createdAt),
                relevantTasks: i.relevantGoalIds,
              }))}
            />
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-12 pt-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--mute)]">
        Local-first · event-sourced · hash-chained · not a public blockchain
        {' · '}
        <button type="button" className="underline" onClick={() => engine.reset()}>
          reset book
        </button>
      </footer>
    </div>
  )
}
