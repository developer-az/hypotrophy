'use client'

import { useState } from 'react'
import Link from 'next/link'
import { verifyReceipt, type GrowthReceipt } from '@/engine'
import { BiscuitMark } from '@/components/BiscuitMark'

export default function VerifyPage() {
  const [raw, setRaw] = useState('')
  const [leaves, setLeaves] = useState('')
  const [result, setResult] = useState<string>('')
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    setResult('')
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
      }).then((r) => r.json())
      setResult(
        JSON.stringify(
          {
            client: local,
            server: remote,
            subject: receipt.subject?.slice(0, 18) + '…',
            events: receipt.eventCount,
            alg: receipt.alg,
          },
          null,
          2
        )
      )
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'invalid receipt')
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
          <h1 className="font-display text-4xl text-[var(--paper)]">Receipt verifier</h1>
          <p className="text-sm text-[var(--mute)]">Independent check. No account. No original titles required.</p>
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
      {result && (
        <pre className="panel mt-6 overflow-auto p-4 font-mono text-xs text-[var(--mute)]">{result}</pre>
      )}
    </div>
  )
}
