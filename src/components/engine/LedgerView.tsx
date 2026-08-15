'use client'

import type { HypotrophyEngine } from '@/hooks/useEngine'
import { shortHash } from '@/lib/format'

export default function LedgerView({ engine }: { engine: HypotrophyEngine }) {
  const { chain, integrity } = engine
  const reversed = [...chain].reverse()

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="kicker">Integrity</div>
            <h2 className="font-display text-3xl text-[var(--paper)]">
              {integrity.ok ? 'Chain verifies' : 'Chain broken'}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--mute)]">
              Each event hashes its payload plus the previous hash. Edit history in DevTools and this
              badge fails — the same sequential integrity guarantee a blockchain uses, without a public
              mempool of your life.
            </p>
          </div>
          <div className="font-mono text-xs text-[var(--mute)]">
            <div>entries {chain.length}</div>
            <div>head {shortHash(integrity.ok ? integrity.head : 'err', 12)}</div>
            {!integrity.ok && <div className="mt-2 text-[var(--gold)]">{integrity.reason} @ {integrity.at}</div>}
          </div>
        </div>
      </section>

      <div className="overflow-hidden panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mute)]">
            <tr>
              <th className="px-4 py-3">seq</th>
              <th className="px-4 py-3">type</th>
              <th className="px-4 py-3">hash</th>
              <th className="hidden px-4 py-3 md:table-cell">prev</th>
              <th className="hidden px-4 py-3 lg:table-cell">time</th>
            </tr>
          </thead>
          <tbody>
            {reversed.map((entry) => (
              <tr key={entry.hash} className="border-b border-[var(--line)]/60">
                <td className="px-4 py-3 font-mono text-[var(--gold)]">{entry.seq}</td>
                <td className="px-4 py-3 text-[var(--paper)]">{entry.type}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-[var(--mute)]">{shortHash(entry.hash, 10)}</td>
                <td className="hidden px-4 py-3 font-mono text-[11px] text-[var(--mute)] md:table-cell">
                  {shortHash(entry.prevHash, 8)}
                </td>
                <td className="hidden px-4 py-3 font-mono text-[11px] text-[var(--mute)] lg:table-cell">
                  {new Date(entry.ts).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
