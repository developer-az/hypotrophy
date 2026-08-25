'use client'

import Link from 'next/link'
import { BiscuitMark } from '../BiscuitMark'

interface WelcomeProps {
  onStart: () => void
  onDemo: () => void
}

export default function Welcome({ onStart, onDemo }: WelcomeProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl flex-col justify-center px-1 py-8">
      <div className="flex items-center gap-3">
        <BiscuitMark size={52} />
        <div>
          <p className="kicker">Hypotrophy</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--mute)]">
            A fund with one LP — you
          </p>
        </div>
      </div>

      <h1 className="mt-8 font-display text-4xl leading-[1.1] text-[var(--paper)] sm:text-5xl">
        Attention is capital. Price it. Compound it. Prove it.
      </h1>
      <p className="mt-4 max-w-xl text-base text-[var(--mute)] sm:text-lg">
        Not a to-do list and not a market crystal ball. A local ledger of claims, a DAG that forbids
        illegal fills, a posterior that predicts whether <em>you</em> finish, and a receipt a stranger
        can verify. The cheat code is concentration — half-Kelly on the feasible set.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        <Pitch title="The stake" body="Next fill is unblocked, ranked, and priced in ħ." />
        <Pitch title="Forward book" body="P(done in 7/30/90d) from your DAG and domain posteriors." />
        <Pitch title="Proof" body="Signed Merkle receipts. Titles never leave the device." />
      </ul>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn-gold" onClick={onStart}>
          Open an empty book
        </button>
        <button type="button" className="btn-quiet" onClick={onDemo}>
          Load a demo week
        </button>
      </div>
      <p className="mt-4 text-sm text-[var(--mute)]">
        Stays on this device. No account.{' '}
        <Link href="/studio" className="text-[var(--gold)] underline-offset-2 hover:underline">
          Studio — the product that charges
        </Link>
      </p>
    </div>
  )
}

function Pitch({ title, body }: { title: string; body: string }) {
  return (
    <li className="panel p-4">
      <div className="font-display text-lg text-[var(--paper)]">{title}</div>
      <p className="mt-1 text-sm text-[var(--mute)]">{body}</p>
    </li>
  )
}
