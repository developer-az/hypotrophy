import type { Metadata } from 'next'
import Link from 'next/link'
import { BiscuitMark } from '@/components/BiscuitMark'

export const metadata: Metadata = {
  title: 'Studio — Hypotrophy',
  description: 'Paid receipts, export packs, and sync when you outgrow a single device.',
}

export default function StudioPage() {
  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-12">
      <Link href="/" className="kicker">
        ← Back to the book
      </Link>
      <div className="mt-6 flex items-center gap-3">
        <BiscuitMark size={44} />
        <div>
          <h1 className="font-display text-4xl text-[var(--paper)]">Studio</h1>
          <p className="text-[var(--mute)]">The product that can actually charge.</p>
        </div>
      </div>

      <p className="mt-8 max-w-2xl text-lg text-[var(--mute)]">
        Free Hypotrophy is a local engine: next action, graph, capital weights, a chain on this
        device. Studio is the layer people pay for — artifacts you can send, and a book that
        survives a new laptop.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Plan
          name="Book"
          price="Free"
          items={[
            'Unlimited goals on this device',
            'Allocator, map, and capital desk',
            'Hash-chained ledger',
            'One receipt to try /verify',
          ]}
        />
        <Plan
          name="Studio"
          price="$12 / month"
          featured
          items={[
            'Weekly signed receipt pack',
            'PDF for applications — still no titles leaked',
            'Encrypted export + restore',
            'Multi-device sync when it ships (Neon/Turso, not a public chain)',
          ]}
        />
      </div>

      <section className="panel mt-10 p-6">
        <div className="kicker">Why this can make money</div>
        <h2 className="mt-1 font-display text-2xl text-[var(--paper)]">ICP, not another habit app</h2>
        <ul className="mt-4 space-y-2 text-[var(--mute)]">
          <li>— People who interview, ship, or report to a board and need proof, not streaks.</li>
          <li>— The free loop is: first goal → first close → first receipt → send /verify.</li>
          <li>— Paid is the artifact and the backup. The engine stays local-first.</li>
          <li>— Billing is not wired yet. This page is the contract with the user.</li>
        </ul>
        <a className="btn-gold mt-6 inline-flex" href="mailto:hello@hypotrophy.app?subject=Studio%20waitlist">
          Join the waitlist
        </a>
      </section>
    </div>
  )
}

function Plan({
  name,
  price,
  items,
  featured,
}: {
  name: string
  price: string
  items: string[]
  featured?: boolean
}) {
  return (
    <article className="panel p-6" style={featured ? { borderColor: 'rgba(212,160,84,0.45)' } : undefined}>
      <div className="kicker">{featured ? 'Paid' : 'Now'}</div>
      <h3 className="mt-1 font-display text-2xl text-[var(--paper)]">{name}</h3>
      <p className="mt-1 font-mono text-[var(--gold)]">{price}</p>
      <ul className="mt-4 space-y-2 text-sm text-[var(--mute)]">
        {items.map((item) => (
          <li key={item}>— {item}</li>
        ))}
      </ul>
    </article>
  )
}
