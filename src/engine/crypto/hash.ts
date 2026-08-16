import { canonicalize } from './canonical'
import { toHex, utf8 } from './bytes'

/** SHA-256 via Web Crypto — available in browsers and Node 19+. */
export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    throw new Error('Web Crypto SubtleCrypto is required (Node 19+ or modern browser)')
  }
  const digest = await subtle.digest('SHA-256', data as BufferSource)
  return new Uint8Array(digest)
}

export async function sha256Hex(data: Uint8Array): Promise<string> {
  return toHex(await sha256(data))
}

export async function hashCanonical(value: unknown): Promise<string> {
  return sha256Hex(utf8(canonicalize(value)))
}
