'use client'

import { useState } from 'react'
import type { HypotrophyEngine } from '@/hooks/useEngine'
import LedgerView from './LedgerView'
import ReceiptsView from './ReceiptsView'

export default function ProofView({ engine }: { engine: HypotrophyEngine }) {
  const [tab, setTab] = useState<'receipts' | 'ledger'>('receipts')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="kicker">Proof of work</div>
          <h2 className="font-display text-3xl text-[var(--paper)]">Receipts and chain</h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--mute)]">
            Issue a signed commitment to your Merkle root, or inspect the append-only log. Titles
            never leave the device.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="seg" role="group" aria-label="Proof surfaces">
            <button type="button" aria-pressed={tab === 'receipts'} onClick={() => setTab('receipts')}>
              Receipts
            </button>
            <button type="button" aria-pressed={tab === 'ledger'} onClick={() => setTab('ledger')}>
              Ledger
            </button>
          </div>
          <button type="button" className="btn-quiet" onClick={() => engine.exportLedger()}>
            Export
          </button>
        </div>
      </div>
      {tab === 'receipts' ? <ReceiptsView engine={engine} /> : <LedgerView engine={engine} />}
    </div>
  )
}
