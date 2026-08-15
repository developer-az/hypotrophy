/**
 * In-memory token bucket. On serverless this is per-isolate, not global —
 * still enough to stop a single client from lighting money on fire against
 * the model endpoint. A production deploy would sit this behind Redis or
 * the platform rate limiter; documented in TRADEOFFS.md.
 */

interface Bucket {
  tokens: number
  updatedAt: number
}

const buckets = new Map<string, Bucket>()

export function allowRequest(
  key: string,
  opts: { capacity: number; refillPerSec: number } = { capacity: 8, refillPerSec: 0.25 }
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now()
  const bucket = buckets.get(key) ?? { tokens: opts.capacity, updatedAt: now }
  const elapsed = (now - bucket.updatedAt) / 1000
  bucket.tokens = Math.min(opts.capacity, bucket.tokens + elapsed * opts.refillPerSec)
  bucket.updatedAt = now
  if (bucket.tokens < 1) {
    buckets.set(key, bucket)
    const retryAfterSec = Math.ceil((1 - bucket.tokens) / opts.refillPerSec)
    return { ok: false, retryAfterSec }
  }
  bucket.tokens -= 1
  buckets.set(key, bucket)
  return { ok: true }
}

export function clientKey(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return headers.get('x-real-ip') ?? 'local'
}
