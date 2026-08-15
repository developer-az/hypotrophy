import { describe, expect, it } from 'vitest'
import { generateIdentity } from '../crypto/identity'
import { issueReceipt, verifyReceipt } from '../crypto/receipt'
import { verifyChain } from '../crypto/chain'
import { fold } from '../domain/reducer'
import { buildDemoLedger } from '../demo/fixture'
import { migrateLegacyTasks } from '../domain/migrate'

describe('growth receipts', () => {
  it('round-trips a signed receipt against the issuing ledger', async () => {
    const now = 1_724_000_000_000
    const chain = await buildDemoLedger(now)
    const integrity = await verifyChain(chain)
    expect(integrity.ok).toBe(true)

    const identity = await generateIdentity()
    const projection = fold(chain)
    const receipt = await issueReceipt({ identity, chain, projection, now })

    expect(receipt.eventCount).toBe(chain.length)
    expect(receipt.subject).toBe(identity.publicKeyHex)
    expect(receipt.stats.created).toBeGreaterThan(0)
    expect(receipt.sampleProofs.length).toBeGreaterThan(0)

    const ok = await verifyReceipt(
      receipt,
      chain.map((e) => e.hash)
    )
    expect(ok).toEqual({ ok: true })
  })

  it('fails if the signature is flipped', async () => {
    const now = 1_724_000_000_000
    const chain = await buildDemoLedger(now)
    const identity = await generateIdentity()
    const receipt = await issueReceipt({ identity, chain, projection: fold(chain), now })
    const flipped = { ...receipt, signature: receipt.signature.replace(/[0-9a-f]/, (c) => (c === '0' ? '1' : '0')) }
    const result = await verifyReceipt(flipped)
    expect(result.ok).toBe(false)
  })

  it('fails if leaves from a different chain are supplied', async () => {
    const now = 1_724_000_000_000
    const a = await buildDemoLedger(now)
    const b = await buildDemoLedger(now + 1, 99)
    const identity = await generateIdentity()
    const receipt = await issueReceipt({ identity, chain: a, projection: fold(a), now })
    const result = await verifyReceipt(
      receipt,
      b.map((e) => e.hash)
    )
    expect(result.ok).toBe(false)
  })
})

describe('legacy migration', () => {
  it('turns hackathon tasks into a verifiable chain', async () => {
    const now = 1_700_000_000_000
    const chain = await migrateLegacyTasks(
      [
        {
          id: 't1',
          title: 'Drink water',
          completed: true,
          category: 'health',
          priority: 'low',
          createdAt: now - 1000,
          completedAt: now - 500,
        },
        {
          id: 't2',
          title: 'Ship something real',
          completed: false,
          category: 'career',
          priority: 'high',
          createdAt: now - 100,
        },
      ],
      now
    )
    const r = await verifyChain(chain)
    expect(r.ok).toBe(true)
    const p = fold(chain)
    expect(p.goals.t1.status).toBe('completed')
    expect(p.goals.t2.status).toBe('open')
    expect(p.goals.t2.domain).toBe('career')
  })
})
