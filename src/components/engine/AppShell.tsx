'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { HypotrophyEngine, ViewId } from '@/hooks/useEngine'
import { BiscuitMark } from '../BiscuitMark'
import { shortHash } from '@/lib/format'
import { hasOnboarded, markOnboarded } from '@/lib/storage'
import { useToast } from '../Toast'
import CommandDeck from './CommandDeck'
import GraphView from './GraphView'
import CapitalView from './CapitalView'
import ProofView from './ProofView'
import Welcome from './Welcome'
import BiscuitConversation from '../BiscuitConversation'
import AIInsights from '../AIInsights'
import { aiService } from '@/lib/aiService'

const NAV: { id: ViewId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'map', label: 'Map' },
  { id: 'capital', label: 'Capital' },
  { id: 'proof', label: 'Proof' },
  { id: 'biscuit', label: 'Biscuit' },
]

export default function AppShell({ engine }: { engine: HypotrophyEngine }) {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [view, setView] = useState<ViewId>('today')
  const [latest, setLatest] = useState('')
  const [asking, setAsking] = useState(false)
  const [welcome, setWelcome] = useState<boolean | null>(null)

  useEffect(() => {
    setWelcome(!hasOnboarded() && engine.goals.length === 0)
  }, [engine.goals.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return
      const map: Record<string, ViewId> = {
        '1': 'today',
        '2': 'map',
        '3': 'capital',
        '4': 'proof',
        '5': 'biscuit',
      }
      const next = map[e.key]
      if (next) setView(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
      setView('biscuit')
      toast('Biscuit filed a note')
    } finally {
      setAsking(false)
    }
  }

  const startEmpty = () => {
    markOnboarded()
    setWelcome(false)
    setView('today')
  }

  const startDemo = async () => {
    markOnboarded()
    await engine.loadDemo()
    setWelcome(false)
    setView('today')
    toast('Demo week loaded')
  }

  const onImport = async (file: File) => {
    try {
      await engine.importLedger(await file.text())
      markOnboarded()
      setWelcome(false)
      toast('Ledger imported')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'import failed')
    }
  }

  const verified = engine.integrity.ok

  return (
    <div className="min-h-screen app-pad">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--ink)]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-3" onClick={() => setView('today')}>
            <BiscuitMark size={36} />
            <div>
              <div className="font-display text-xl leading-none text-[var(--paper)]">Hypotrophy</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--mute)]">
                Human capital
              </div>
            </div>
          </Link>
          <nav className="hidden flex-wrap gap-1 md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                className="nav-pill"
                aria-current={view === item.id ? 'page' : undefined}
                onClick={() => setView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`chip ${verified ? 'chip-ok' : 'chip-bad'}`}>
              {verified ? 'verified' : 'broken'} ·{' '}
              {shortHash(verified ? engine.integrity.head : 'err')}
            </span>
            <Link href="/studio" className="btn-quiet hidden sm:inline-flex">
              Studio
            </Link>
            <button type="button" className="btn-quiet" onClick={ask} disabled={asking}>
              {asking ? '…' : 'Ask Biscuit'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {engine.error && (
          <div
            className="mb-6 rounded-2xl border border-[var(--bad)]/40 bg-[var(--bad)]/10 px-4 py-3 text-sm"
            style={{ color: 'var(--bad)' }}
          >
            {engine.error}
          </div>
        )}
        {welcome === null ? (
          <div className="py-24 text-center">
            <div className="kicker">booting</div>
          </div>
        ) : welcome ? (
          <Welcome onStart={startEmpty} onDemo={startDemo} />
        ) : (
          <>
            {view === 'today' && <CommandDeck engine={engine} />}
            {view === 'map' && <GraphView engine={engine} />}
            {view === 'capital' && <CapitalView engine={engine} />}
            {view === 'proof' && <ProofView engine={engine} />}
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
          </>
        )}
      </main>

      <footer className="mx-auto hidden max-w-7xl flex-wrap items-center justify-center gap-3 px-4 pb-8 pt-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mute)] md:flex">
        <span>Local-first · not a public chain</span>
        <button type="button" className="underline" onClick={() => engine.exportLedger()}>
          Export
        </button>
        <button type="button" className="underline" onClick={() => fileRef.current?.click()}>
          Import
        </button>
        <button
          type="button"
          className="underline"
          onClick={() => {
            if (window.confirm('Reset this device book? The chain is local — this cannot be undone.')) {
              engine.reset()
              setWelcome(true)
              toast('Book reset')
            }
          }}
        >
          Reset
        </button>
        <span className="hidden lg:inline">Keys 1–5 switch desks</span>
      </footer>

      <nav className="dock" aria-label="Mobile">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className="nav-pill w-full px-1 text-[10px]"
              aria-current={view === item.id ? 'page' : undefined}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void onImport(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
