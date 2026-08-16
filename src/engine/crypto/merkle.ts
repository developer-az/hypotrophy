import { concatBytes, fromHex, toHex } from './bytes'
import { sha256 } from './hash'

/**
 * RFC 6962 Certificate Transparency Merkle tree.
 *
 * leaf  = SHA-256(0x00 || data)
 * node  = SHA-256(0x01 || left || right)
 *
 * Odd nodes at a level are promoted unchanged (not hashed with themselves).
 * Self-hashing would let an attacker present a forged interior node as a leaf
 * in some constructions; the 0x00/0x01 domain separation prevents that mix-up.
 *
 * Proofs are O(log n). Verifying a weekly receipt does not require the rest
 * of the user's history — only the leaf and the sibling path.
 */

const LEAF_PREFIX = new Uint8Array([0x00])
const NODE_PREFIX = new Uint8Array([0x01])

export interface MerkleProofStep {
  sibling: string
  /** Where the sibling sits relative to the current hash. */
  side: 'left' | 'right'
}

export interface MerkleProof {
  leafIndex: number
  leafHash: string
  steps: MerkleProofStep[]
  root: string
  leafCount: number
}

export async function hashLeaf(data: Uint8Array): Promise<Uint8Array> {
  return sha256(concatBytes(LEAF_PREFIX, data))
}

export async function hashNode(left: Uint8Array, right: Uint8Array): Promise<Uint8Array> {
  return sha256(concatBytes(NODE_PREFIX, left, right))
}

export async function merkleRoot(leaves: Uint8Array[]): Promise<Uint8Array> {
  if (leaves.length === 0) {
    return sha256(new Uint8Array(0))
  }
  const hashed = await Promise.all(leaves.map(hashLeaf))
  return foldRoot(hashed)
}

export async function merkleRootHex(leafHexes: string[]): Promise<string> {
  const leaves = leafHexes.map((h) => fromHex(h))
  return toHex(await merkleRoot(leaves))
}

async function foldRoot(level: Uint8Array[]): Promise<Uint8Array> {
  while (level.length > 1) {
    const next: Uint8Array[] = []
    for (let i = 0; i < level.length; i += 2) {
      if (i + 1 === level.length) {
        next.push(level[i])
      } else {
        next.push(await hashNode(level[i], level[i + 1]))
      }
    }
    level = next
  }
  return level[0]
}

export async function proveInclusion(leaves: Uint8Array[], index: number): Promise<MerkleProof> {
  if (index < 0 || index >= leaves.length) {
    throw new Error('leaf index out of range')
  }
  const hashed = await Promise.all(leaves.map(hashLeaf))
  const steps: MerkleProofStep[] = []
  let level = hashed
  let idx = index

  while (level.length > 1) {
    const next: Uint8Array[] = []
    for (let i = 0; i < level.length; i += 2) {
      if (i + 1 === level.length) {
        next.push(level[i])
      } else {
        const left = level[i]
        const right = level[i + 1]
        next.push(await hashNode(left, right))
        if (idx === i) {
          steps.push({ sibling: toHex(right), side: 'right' })
        } else if (idx === i + 1) {
          steps.push({ sibling: toHex(left), side: 'left' })
        }
      }
    }
    idx = Math.floor(idx / 2)
    level = next
  }

  return {
    leafIndex: index,
    leafHash: toHex(hashed[index]),
    steps,
    root: toHex(level[0]),
    leafCount: leaves.length,
  }
}

export async function verifyInclusion(data: Uint8Array, proof: MerkleProof): Promise<boolean> {
  const leaf = await hashLeaf(data)
  if (toHex(leaf) !== proof.leafHash) return false

  let current = leaf
  for (const step of proof.steps) {
    const sibling = fromHex(step.sibling)
    current =
      step.side === 'left'
        ? await hashNode(sibling, current)
        : await hashNode(current, sibling)
  }
  return toHex(current) === proof.root
}

export async function proveInclusionHex(leafHexes: string[], index: number): Promise<MerkleProof> {
  return proveInclusion(leafHexes.map(fromHex), index)
}

export async function verifyInclusionHex(leafHex: string, proof: MerkleProof): Promise<boolean> {
  return verifyInclusion(fromHex(leafHex), proof)
}

/** Check that a proof path hashes to its claimed root (no original leaf data required). */
export async function verifyProofPath(proof: MerkleProof): Promise<boolean> {
  let current = fromHex(proof.leafHash)
  for (const step of proof.steps) {
    const sibling = fromHex(step.sibling)
    current =
      step.side === 'left'
        ? await hashNode(sibling, current)
        : await hashNode(current, sibling)
  }
  return toHex(current) === proof.root
}
