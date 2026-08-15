import { describe, expect, it } from 'vitest'
import { appendEntry, forkIndex, GENESIS_PREV, verifyChain, type ChainEntry } from '../crypto/chain'

async function chainOf(n: number): Promise<ChainEntry[]> {
  const chain: ChainEntry[] = []
  for (let i = 0; i < n; i++) {
    chain.push(await appendEntry(chain, i === 0 ? 'ledger.genesis' : 'goal.created', { i }, 1_700_000_000_000 + i))
  }
  return chain
}

describe('hash chain', () => {
  it('verifies an empty chain', async () => {
    const r = await verifyChain([])
    expect(r).toEqual({ ok: true, head: GENESIS_PREV, length: 0 })
  })

  it('links each entry to the previous hash', async () => {
    const chain = await chainOf(8)
    const r = await verifyChain(chain)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.length).toBe(8)
      expect(r.head).toBe(chain[7].hash)
    }
    expect(chain[0].prevHash).toBe(GENESIS_PREV)
    for (let i = 1; i < chain.length; i++) {
      expect(chain[i].prevHash).toBe(chain[i - 1].hash)
      expect(chain[i].seq).toBe(i)
    }
  })

  it('detects payload tampering', async () => {
    const chain = await chainOf(6)
    const dirty = chain.map((e, i) => (i === 2 ? { ...e, payload: { i: 999 } } : e))
    const r = await verifyChain(dirty)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.at).toBe(2)
      expect(r.reason).toMatch(/hash mismatch/)
    }
  })

  it('detects a broken prevHash link', async () => {
    const chain = await chainOf(5)
    const dirty = chain.map((e, i) => (i === 3 ? { ...e, prevHash: chain[0].hash } : e))
    const r = await verifyChain(dirty)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.at).toBe(3)
  })

  it('detects truncation-and-rehash of a middle event', async () => {
    const chain = await chainOf(5)
    const spliced = chain.slice(0, 3)
    const r = await verifyChain(spliced)
    expect(r.ok).toBe(true)
    expect(forkIndex(chain, spliced)).toBe(-1)
  })

  it('forkIndex finds the first divergent hash', async () => {
    const a = await chainOf(4)
    const b = a.slice()
    b[2] = { ...b[2], hash: 'ff'.repeat(32) }
    expect(forkIndex(a, b)).toBe(2)
  })
})
