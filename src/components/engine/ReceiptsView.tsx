'use client'

import { useState } from 'react'
import type { HypotrophyEngine } from '@/hooks/useEngine'
import { shortHash } from '@/lib/format'

export default function ReceiptsView({ engine }: { engine: HypotrophyEngine }) {
  const { identity, receipt, issue, issuing, chain } = engine
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!receipt) return
    await navigator.clipboard.writeText(JSON.stringify(receipt, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const download = () => {
    if (!receipt) return
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hypotrophy-receipt-${receipt.issuedAt}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="kicker">Verifiable human capital</div>
        <h2 className="font-display text-3xl text-[var(--paper)]">Growth receipts</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          A receipt is a signed commitment to a Merkle root of your event hashes. Titles never leave
          the device. Anyone with the JSON can verify the signature; anyone with the leaf hashes can
          recompute the root. This is the resume you cannot fake in an interview.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="btn-gold" disabled={issuing || chain.length < 2} onClick={() => issue()}>
            {issuing ? 'Signing…' : 'Issue receipt'}
          </button>
          <a className="btn-quiet inline-flex items-center" href="/verify">
            Open public verifier
          </a>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <div className="kicker">Device identity</div>
          <p className="mt-3 font-mono text-xs leading-relaxed break-all text-[var(--mute)]">
            {identity ? `${identity.alg} · ${shortHash(identity.publicKeyHex, 18)}` : 'generating…'}
          </p>
          <p className="mt-3 text-sm text-[var(--mute)]">
            Private key stays in localStorage for this demo. Production would keep a non-extractable
            CryptoKey in IndexedDB. Never export the JWK.
          </p>
        </section>
        <section className="panel p-6">
          <div className="kicker">What a verifier learns</div>
          <ul className="mt-3 space-y-2 text-sm text-[var(--mute)]">
            <li>— that this public key signed this root</li>
            <li>— event count and aggregate domain stats</li>
            <li>— not the titles, not the prose, not the dates of specific goals</li>
          </ul>
        </section>
      </div>

      {receipt && (
        <section className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="kicker">Issued receipt</div>
              <h3 className="font-display text-xl text-[var(--paper)]">
                {receipt.eventCount} events · root {shortHash(receipt.merkleRoot, 12)}
              </h3>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-quiet" onClick={copy}>
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
              <button type="button" className="btn-quiet" onClick={download}>
                Download
              </button>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Mini label="created" value={String(receipt.stats.created)} />
            <Mini label="completed" value={String(receipt.stats.completed)} />
            <Mini label="abandoned" value={String(receipt.stats.abandoned)} />
            <Mini label="proofs" value={String(receipt.sampleProofs.length)} />
          </dl>
          <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-[var(--ink)] p-4 font-mono text-[11px] text-[var(--mute)]">
            {JSON.stringify(receipt, null, 2)}
          </pre>
        </section>
      )}
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--ink)] px-3 py-2">
      <div className="kicker">{label}</div>
      <div className="font-mono text-lg text-[var(--paper)]">{value}</div>
    </div>
  )
}
