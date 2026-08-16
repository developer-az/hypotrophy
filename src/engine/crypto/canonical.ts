/**
 * Deterministic JSON encoding for hashing.
 *
 * Why not JSON.stringify? Key order is insertion-order in modern engines, but
 * that is a language accident, not a protocol. Recruits who hash objects
 * without canonicalization will silently break verification across clients.
 *
 * Rules:
 * - Objects: keys sorted lexicographically, no undefined values
 * - Arrays: order preserved
 * - Numbers: finite integers only (timestamps, counters). Floats are banned
 *   because IEEE-754 is not a stable cross-language encoding.
 * - No undefined, no NaN, no Infinity, no bigint
 */
export function canonicalize(value: unknown): string {
  return encode(value)
}

function encode(value: unknown): string {
  if (value === null) return 'null'
  const t = typeof value
  if (t === 'boolean') return value ? 'true' : 'false'
  if (t === 'string') return jsonString(value as string)
  if (t === 'number') {
    if (!Number.isInteger(value) || !Number.isSafeInteger(value)) {
      throw new Error(`canonical encoding rejects non-integer number: ${String(value)}`)
    }
    return String(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map(encode).join(',')}]`
  }
  if (t === 'object') {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort()
    const body = keys.map((k) => `${jsonString(k)}:${encode(obj[k])}`).join(',')
    return `{${body}}`
  }
  throw new Error(`canonical encoding rejects ${t}`)
}

function jsonString(s: string): string {
  return JSON.stringify(s)
}
