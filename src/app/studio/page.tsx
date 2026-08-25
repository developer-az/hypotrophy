import type { Metadata } from 'next'
import Link from 'next/link'
import { BiscuitMark } from '@/components/BiscuitMark'

export const metadata: Metadata = {
  title: 'Studio — Hypotrophy',
  description: 'Weekly net-worth pack and signed receipts. The ledger stays on your device.',
}

export default function StudioPage() {
  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-12">
      <Link href="/" className="kicker">
        ← Back to home
      </Link>
      <div className="mt-6 flex items-center gap-3">
        <BiscuitMark size={44} />
        <div>
          <h1 className="font-display text-4xl text-[var(--paper)]">Studio</h1>
          <p className="text-[var(--mute)]">The pack you can send. The book that survives a new laptop.</p>
        </div>
      </div>

      <p className="mt-8 max-w-2xl text-lg text-[var(--mute)]">
        Free Hypotrophy is cash, skills, and ranked work on this device. Proof already issues this
        week’s net-worth + receipt pack. Studio is continuity — encrypted backup when the machine
        dies — still no titles leaked.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Plan
          name="Book"
          price="Free"
          items={[
            'Net worth, bills, skill rates on this device',
            'Do this now — ranked feasible work',
            'Hash-chained ledger',
            'One receipt to try /verify',
          ]}
        />
        <Plan
          name="Studio"
          price="$29 / month"
          featured
          items={[
            'Weekly net-worth + receipt pack (no titles)',
            'Encrypted export + restore phrase',
            'Multi-device sync when it ships',
            'Same engine. Continuity is what you pay for.',
          ]}
        />
      </div>

      <section className="panel mt-10 p-6">
        <div className="kicker">Why this can charge</div>
        <h2 className="mt-1 font-display text-2xl text-[var(--paper)]">Proof and a book that lives</h2>
        <ul className="mt-4 space-y-2 text-[var(--mute)]">
          <li>— Free loop: cash + rate → first done → first receipt → a stranger verifies it.</li>
          <li>— Paid loop: a pack you can send, and history that survives a new machine.</li>
          <li>— Billing is not wired yet. This page is the contract.</li>
        </ul>
        <a className="btn-gold mt-6 inline-flex" href="mailto:hello@hypotrophy.app?subject=Studio%20desk">
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
