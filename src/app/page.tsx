'use client'

import { useEngine } from '@/hooks/useEngine'
import AppShell from '@/components/engine/AppShell'

export default function Home() {
  const engine = useEngine()

  if (!engine.ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="kicker">booting</div>
          <p className="mt-2 font-display text-3xl text-[var(--paper)]">Verifying local ledger</p>
        </div>
      </div>
    )
  }

  return <AppShell engine={engine} />
}
