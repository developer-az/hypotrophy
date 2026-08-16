import { ZERO_HASH_HEX } from './bytes'
import { hashCanonical } from './hash'

/**
 * Append-only hash chain. Same primitive a blockchain uses for sequential
 * integrity — without a public consensus network, because personal growth
 * data should not be globally replicated.
 *
 * Tamper any historical payload, timestamp, or type and every subsequent
 * hash diverges. Truncation is detected by checking seq continuity and
 * that entry[0].prevHash is the genesis sentinel.
 */

export interface ChainBody {
  seq: number
  ts: number
  type: string
  payload: unknown
  prevHash: string
}

export interface ChainEntry extends ChainBody {
  hash: string
}

export type ChainVerifyOk = { ok: true; head: string; length: number }
export type ChainVerifyFail = { ok: false; at: number; reason: string }
export type ChainVerifyResult = ChainVerifyOk | ChainVerifyFail

export const GENESIS_PREV = ZERO_HASH_HEX

export async function entryHash(body: ChainBody): Promise<string> {
  return hashCanonical({
    seq: body.seq,
    ts: body.ts,
    type: body.type,
    payload: body.payload,
    prevHash: body.prevHash,
  })
}

export async function appendEntry(
  chain: readonly ChainEntry[],
  type: string,
  payload: unknown,
  ts: number
): Promise<ChainEntry> {
  if (!Number.isInteger(ts) || ts < 0) {
    throw new Error('timestamp must be a non-negative integer')
  }
  const seq = chain.length
  const prevHash = seq === 0 ? GENESIS_PREV : chain[seq - 1].hash
  const body: ChainBody = { seq, ts, type, payload, prevHash }
  const hash = await entryHash(body)
  return { ...body, hash }
}

export async function verifyChain(chain: readonly ChainEntry[]): Promise<ChainVerifyResult> {
  if (chain.length === 0) {
    return { ok: true, head: GENESIS_PREV, length: 0 }
  }

  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i]
    if (entry.seq !== i) {
      return { ok: false, at: i, reason: `seq gap: expected ${i}, got ${entry.seq}` }
    }
    const expectedPrev = i === 0 ? GENESIS_PREV : chain[i - 1].hash
    if (entry.prevHash !== expectedPrev) {
      return { ok: false, at: i, reason: 'prevHash does not link to prior entry' }
    }
    const expectedHash = await entryHash({
      seq: entry.seq,
      ts: entry.ts,
      type: entry.type,
      payload: entry.payload,
      prevHash: entry.prevHash,
    })
    if (entry.hash !== expectedHash) {
      return { ok: false, at: i, reason: 'hash mismatch (payload or metadata was altered)' }
    }
  }

  return { ok: true, head: chain[chain.length - 1].hash, length: chain.length }
}

/** First index that diverges between two chains, or -1 if one is a prefix. */
export function forkIndex(a: readonly ChainEntry[], b: readonly ChainEntry[]): number {
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    if (a[i].hash !== b[i].hash) return i
  }
  return -1
}
