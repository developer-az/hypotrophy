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
            Human capital engine
          </p>
        </div>
      </div>

      <h1 className="mt-8 font-display text-4xl leading-[1.1] text-[var(--paper)] sm:text-5xl">
        Your attention is capital. Keep a book you can prove.
      </h1>
      <p className="mt-4 max-w-xl text-base text-[var(--mute)] sm:text-lg">
        Not another to-do list. A local ledger of what you committed to, what you closed, and what
        you cut. The next action is ranked. A receipt can go on a résumé without leaking titles.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        <Pitch title="Do this next" body="Unblocked work, ranked — not a vibe." />
        <Pitch title="History that holds" body="Hash-chained events. Tamper and it fails." />
        <Pitch title="Proof, not claims" body="Signed Merkle receipts. Verify without an account." />
      </ul>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn-gold" onClick={onStart}>
          Start a book
        </button>
        <button type="button" className="btn-quiet" onClick={onDemo}>
          Load a demo week
        </button>
      </div>
      <p className="mt-4 text-sm text-[var(--mute)]">
        Stays on this device. No account.{' '}
        <Link href="/studio" className="text-[var(--gold)] underline-offset-2 hover:underline">
          How Studio makes money
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
