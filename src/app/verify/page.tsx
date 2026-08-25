'use client'

import { useState } from 'react'
import Link from 'next/link'
import { verifyReceipt, type GrowthReceipt } from '@/engine'
import { BiscuitMark } from '@/components/BiscuitMark'
import { formatUsd } from '@/lib/format'

export default function VerifyPage() {
  const [raw, setRaw] = useState('')
  const [leaves, setLeaves] = useState('')
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState<boolean | null>(null)
  const [detail, setDetail] = useState('')

  const run = async () => {
    setBusy(true)
    setOk(null)
    setDetail('')
    try {
      const receipt = JSON.parse(raw) as GrowthReceipt
      const leafList = leaves
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      const local = await verifyReceipt(receipt, leafList.length ? leafList : undefined)
      const remote = await fetch('/api/receipts/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt, leaves: leafList.length ? leafList : undefined }),
      }).then((r) => r.json() as Promise<{ ok?: boolean; error?: string }>)
      const passed = Boolean(local.ok && remote.ok)
      setOk(passed)
      setDetail(
        JSON.stringify(
          {
            client: local,
            server: remote,
            events: receipt.eventCount,
            alg: receipt.alg,
          },
          null,
          2
        )
      )
    } catch (err) {
      setOk(false)
      setDetail(err instanceof Error ? err.message : 'invalid receipt')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-12">
      <Link href="/" className="kicker">
        ← Hypotrophy
      </Link>
      <div className="mt-6 flex items-center gap-3">
        <BiscuitMark size={40} />
        <div>
          <h1 className="font-display text-4xl text-[var(--paper)]">Verify a receipt</h1>
          <p className="text-sm text-[var(--mute)]">
            Independent check. No account. Titles are not required.
          </p>
        </div>
      </div>

      <label className="mt-8 block">
        <span className="kicker mb-2 block">Receipt JSON</span>
        <textarea
          className="field min-h-[220px] font-mono text-xs"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder='{"v":1,"alg":"Ed25519",...}'
        />
      </label>
      <label className="mt-4 block">
        <span className="kicker mb-2 block">Optional leaf hashes</span>
        <textarea
          className="field min-h-[90px] font-mono text-xs"
          value={leaves}
          onChange={(e) => setLeaves(e.target.value)}
          placeholder="Paste event hashes to recompute the Merkle root"
        />
      </label>
      <button type="button" className="btn-gold mt-5" disabled={busy || !raw.trim()} onClick={run}>
        {busy ? 'Verifying…' : 'Verify'}
      </button>
      {ok !== null && (
        <section className="panel mt-6 p-6">
          <div className={`chip ${ok ? 'chip-ok' : 'chip-bad'}`}>{ok ? 'holds' : 'does not hold'}</div>
          <p className="mt-3 font-display text-2xl text-[var(--paper)]">
            {ok ? 'Signature and root check out.' : 'This receipt failed verification.'}
          </p>
          {ok && (() => {
            try {
              const r = JSON.parse(raw) as GrowthReceipt
              if (r.stats?.netWorthCents == null) return null
              return (
                <p className="mt-3 text-sm text-[var(--mute)]">
                  Issuer declared net worth {formatUsd(r.stats.netWorthCents)}
                  {r.stats.runwayDays != null ? ` · ${r.stats.runwayDays} days of bills in cash` : ''}.
                  Declared, not a bank statement. No titles in this file.
                </p>
              )
            } catch {
              return null
            }
          })()}
          <details className="quant mt-4">
            <summary>Machine report</summary>
            <pre className="mt-3 overflow-auto font-mono text-xs text-[var(--mute)]">{detail}</pre>
          </details>
        </section>
      )}
    </div>
  )
}
