import { canonicalize } from './canonical'
import { utf8 } from './bytes'
import { merkleRootHex, proveInclusionHex, verifyProofPath, type MerkleProof } from './merkle'
import { signBytes, verifyBytes, type Identity, type SignatureAlg } from './identity'
import type { ChainEntry } from './chain'
import type { Projection } from '../domain/types'
import { domainStats } from '../domain/stats'
import { allocate } from '../quant/allocator'
import { kaplanMeier, medianSurvival } from '../quant/survival'

/**
 * A Growth Receipt is a privacy-preserving, independently verifiable
 * credential: "this key committed to this Merkle root over this period."
 *
 * It is intentionally NOT a token and NOT an on-chain NFT. The capital is
 * the cryptographic commitment to a real history — the thing an interviewer
 * or employer can verify without seeing task titles.
 */

export interface ReceiptStats {
  completed: number
  created: number
  abandoned: number
  domains: Record<string, { completed: number; created: number }>
  allocationBps: { domain: string; bps: number }[]
  medianCompletionMs: number | null
}

export interface GrowthReceipt {
  v: 1
  alg: SignatureAlg
  subject: string
  issuedAt: number
  periodStart: number
  periodEnd: number
  merkleRoot: string
  eventCount: number
  headHash: string
  stats: ReceiptStats
  /** Optional: prove a specific event hash is in the committed set. */
  sampleProofs: MerkleProof[]
  signature: string
}

function unsignedBody(receipt: Omit<GrowthReceipt, 'signature'>): unknown {
  return {
    v: receipt.v,
    alg: receipt.alg,
    subject: receipt.subject,
    issuedAt: receipt.issuedAt,
    periodStart: receipt.periodStart,
    periodEnd: receipt.periodEnd,
    merkleRoot: receipt.merkleRoot,
    eventCount: receipt.eventCount,
    headHash: receipt.headHash,
    stats: receipt.stats,
    sampleProofs: receipt.sampleProofs,
  }
}

export async function issueReceipt(args: {
  identity: Identity
  chain: readonly ChainEntry[]
  projection: Projection
  now: number
  sampleIndexes?: number[]
}): Promise<GrowthReceipt> {
  const { identity, chain, projection, now } = args
  if (chain.length === 0) {
    throw new Error('cannot issue a receipt over an empty ledger')
  }

  const leafHexes = chain.map((e) => e.hash)
  const merkleRoot = await merkleRootHex(leafHexes)
  const indexes = args.sampleIndexes ?? pickSampleIndexes(chain.length)
  const sampleProofs = await Promise.all(indexes.map((i) => proveInclusionHex(leafHexes, i)))

  const stats = buildStats(projection, now)
  const unsigned: Omit<GrowthReceipt, 'signature'> = {
    v: 1,
    alg: identity.alg,
    subject: identity.publicKeyHex,
    issuedAt: now,
    periodStart: chain[0].ts,
    periodEnd: chain[chain.length - 1].ts,
    merkleRoot,
    eventCount: chain.length,
    headHash: chain[chain.length - 1].hash,
    stats,
    sampleProofs,
  }

  const signature = await signBytes(identity, utf8(canonicalize(unsignedBody(unsigned))))
  return { ...unsigned, signature }
}

export async function verifyReceipt(
  receipt: GrowthReceipt,
  expectedLeaves?: string[]
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (receipt.v !== 1) return { ok: false, reason: 'unsupported receipt version' }

  const { signature, ...unsigned } = receipt
  const message = utf8(canonicalize(unsignedBody(unsigned)))
  const sigOk = await verifyBytes(receipt.alg, receipt.subject, message, signature)
  if (!sigOk) return { ok: false, reason: 'signature verification failed' }

  for (const proof of receipt.sampleProofs) {
    if (proof.root !== receipt.merkleRoot) {
      return { ok: false, reason: 'sample proof root does not match receipt merkleRoot' }
    }
    if (!(await verifyProofPath(proof))) {
      return { ok: false, reason: 'sample proof path does not hash to the claimed root' }
    }
  }

  if (expectedLeaves) {
    if (expectedLeaves.length !== receipt.eventCount) {
      return { ok: false, reason: 'leaf count does not match receipt eventCount' }
    }
    const root = await merkleRootHex(expectedLeaves)
    if (root !== receipt.merkleRoot) {
      return { ok: false, reason: 'recomputed merkle root does not match receipt' }
    }
    if (expectedLeaves[expectedLeaves.length - 1] !== receipt.headHash) {
      return { ok: false, reason: 'headHash is not the last leaf' }
    }
  }

  return { ok: true }
}

function pickSampleIndexes(n: number): number[] {
  if (n === 1) return [0]
  if (n === 2) return [0, 1]
  return [0, Math.floor((n - 1) / 2), n - 1]
}

function buildStats(projection: Projection, now: number): ReceiptStats {
  const goals = Object.values(projection.goals)
  const domains = domainStats(goals)
  const km = kaplanMeier(goals, now)
  const plan = allocate(goals, now)

  return {
    completed: goals.filter((g) => g.status === 'completed').length,
    created: goals.length,
    abandoned: goals.filter((g) => g.status === 'abandoned').length,
    domains,
    allocationBps: plan.kelly.map((k) => ({ domain: k.domain, bps: k.bps })),
    medianCompletionMs: medianSurvival(km),
  }
}
