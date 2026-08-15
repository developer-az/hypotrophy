import { describe, expect, it } from 'vitest'
import { canonicalize } from '../crypto/canonical'
import { hashCanonical } from '../crypto/hash'

describe('canonical encoding', () => {
  it('sorts object keys', () => {
    expect(canonicalize({ b: 1, a: 2 })).toBe('{"a":2,"b":1}')
    expect(canonicalize({ a: 2, b: 1 })).toBe('{"a":2,"b":1}')
  })

  it('drops undefined object fields', () => {
    expect(canonicalize({ a: 1, b: undefined })).toBe('{"a":1}')
  })

  it('preserves array order and nested objects', () => {
    expect(canonicalize([{ z: 1, a: 2 }, null, 'x'])).toBe('[{"a":2,"z":1},null,"x"]')
  })

  it('rejects floats and non-finite numbers', () => {
    expect(() => canonicalize(1.5)).toThrow()
    expect(() => canonicalize(Number.NaN)).toThrow()
    expect(() => canonicalize(Number.POSITIVE_INFINITY)).toThrow()
  })

  it('is stable under hash', async () => {
    const a = await hashCanonical({ seq: 3, type: 'goal.created', payload: { id: 'x' } })
    const b = await hashCanonical({ payload: { id: 'x' }, type: 'goal.created', seq: 3 })
    expect(a).toBe(b)
    expect(a).toHaveLength(64)
  })
})
