'use client'

import { useEngine } from '@/hooks/useEngine'
import AppShell from '@/components/engine/AppShell'
import { ToastProvider } from '@/components/Toast'

export default function Home() {
  const engine = useEngine()

  if (!engine.ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="kicker">booting</div>
          <p className="mt-2 font-display text-3xl text-[var(--paper)]">Checking the local book</p>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <AppShell engine={engine} />
    </ToastProvider>
  )
}
