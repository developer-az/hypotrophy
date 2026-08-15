import { describe, expect, it } from 'vitest'
import { fromHex, utf8 } from '../crypto/bytes'
import { merkleRootHex, proveInclusionHex, verifyInclusionHex, verifyProofPath } from '../crypto/merkle'
import { sha256Hex } from '../crypto/hash'

describe('RFC 6962 merkle tree', () => {
  it('hashes the empty set to SHA-256(empty)', async () => {
    const root = await merkleRootHex([])
    const empty = await sha256Hex(new Uint8Array(0))
    expect(root).toBe(empty)
  })

  it('proves inclusion for every leaf of an odd-sized tree', async () => {
    const leaves = []
    for (let i = 0; i < 7; i++) {
      leaves.push(await sha256Hex(utf8(`leaf-${i}`)))
    }
    const root = await merkleRootHex(leaves)
    for (let i = 0; i < leaves.length; i++) {
      const proof = await proveInclusionHex(leaves, i)
      expect(proof.root).toBe(root)
      expect(proof.leafCount).toBe(7)
      expect(await verifyInclusionHex(leaves[i], proof)).toBe(true)
    }
  })

  it('rejects a proof used against the wrong leaf', async () => {
    const leaves = [await sha256Hex(utf8('a')), await sha256Hex(utf8('b')), await sha256Hex(utf8('c'))]
    const proof = await proveInclusionHex(leaves, 0)
    expect(await verifyInclusionHex(leaves[1], proof)).toBe(false)
  })

  it('rejects a mutated sibling in the proof path', async () => {
    const leaves = []
    for (let i = 0; i < 8; i++) leaves.push(await sha256Hex(utf8(`x${i}`)))
    const proof = await proveInclusionHex(leaves, 3)
    const mutated = {
      ...proof,
      steps: proof.steps.map((s, i) => (i === 0 ? { ...s, sibling: 'aa'.repeat(32) } : s)),
    }
    expect(await verifyInclusionHex(leaves[3], mutated)).toBe(false)
  })

  it('is order-sensitive', async () => {
    const a = await sha256Hex(utf8('a'))
    const b = await sha256Hex(utf8('b'))
    expect(await merkleRootHex([a, b])).not.toBe(await merkleRootHex([b, a]))
  })

  it('builds a 2048-leaf tree in budget', async () => {
    const leaves: string[] = []
    for (let i = 0; i < 2048; i++) {
      leaves.push(await sha256Hex(utf8(`bench-${i}`)))
    }
    const t0 = performance.now()
    const root = await merkleRootHex(leaves)
    const proof = await proveInclusionHex(leaves, 1337)
    const ok = await verifyInclusionHex(leaves[1337], proof)
    const elapsed = performance.now() - t0
    expect(ok).toBe(true)
    expect(root).toHaveLength(64)
    expect(fromHex(root).length).toBe(32)
    expect(elapsed).toBeLessThan(8000)
  })

  it('verifyProofPath accepts a real proof and rejects a mutated one', async () => {
    const leaves = [await sha256Hex(utf8('p')), await sha256Hex(utf8('q')), await sha256Hex(utf8('r'))]
    const proof = await proveInclusionHex(leaves, 1)
    expect(await verifyProofPath(proof)).toBe(true)
    const bad = { ...proof, leafHash: leaves[0] }
    expect(await verifyProofPath(bad)).toBe(false)
  })
})
