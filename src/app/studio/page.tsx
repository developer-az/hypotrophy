import type { Metadata } from 'next'
import Link from 'next/link'
import { BiscuitMark } from '@/components/BiscuitMark'

export const metadata: Metadata = {
  title: 'Studio — Hypotrophy',
  description: 'Paid CIO pack, signed receipts, and a book that survives a new laptop.',
}

export default function StudioPage() {
  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-12">
      <Link href="/" className="kicker">
        ← Back to the floor
      </Link>
      <div className="mt-6 flex items-center gap-3">
        <BiscuitMark size={44} />
        <div>
          <h1 className="font-display text-4xl text-[var(--paper)]">Studio</h1>
          <p className="text-[var(--mute)]">The desk that can charge — without owning your ledger.</p>
        </div>
      </div>

      <p className="mt-8 max-w-2xl text-lg text-[var(--mute)]">
        Free Hypotrophy is a single-life fund on this device: DAG constraint, Thompson + half-Kelly,
        a forward book of P(fill), ħ pricing, signed receipts. Studio sells the artifacts other
        people will pay you for — and the backup that keeps the book alive when the laptop dies.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Plan
          name="Floor"
          price="Free"
          items={[
            'Unlimited positions on this device',
            'Forward book · Kelly rose · critical path',
            'Deterministic CIO memo',
            'One receipt to try /verify',
          ]}
        />
        <Plan
          name="Studio"
          price="$29 / month"
          featured
          items={[
            'Weekly CIO pack: memo + 7/30/90 tape, still no titles leaked',
            'Receipt bundle for applications and boards',
            'Encrypted export + restore phrase',
            'Multi-device sync when it ships (Neon/Turso — not a public chain)',
          ]}
        />
      </div>

      <section className="panel mt-10 p-6">
        <div className="kicker">Why this is a business</div>
        <h2 className="mt-1 font-display text-2xl text-[var(--paper)]">People pay for proof and continuity</h2>
        <ul className="mt-4 space-y-2 text-[var(--mute)]">
          <li>— ICP: people who interview, ship, raise, or report and cannot afford a fake history.</li>
          <li>— Free loop: first claim → first fill → first receipt → a stranger verifies it.</li>
          <li>— Paid loop: weekly pack you can send, and a book that survives a new machine.</li>
          <li>— The allocator never leaves the device. We do not sell your titles. Billing is not wired yet — this page is the contract.</li>
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
