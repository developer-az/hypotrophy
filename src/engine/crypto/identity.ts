import { fromHex, toHex } from './bytes'

/**
 * Device-local identity for signing Growth Receipts.
 *
 * Prefer Ed25519 (small signatures, modern default). Fall back to ECDSA
 * P-256 because it is the Web Crypto baseline in older runtimes.
 *
 * Private keys are extractable only so a local-first demo can persist them.
 * A production hardening would generate non-extractable keys in IndexedDB
 * and never let the JWK hit localStorage. Documented in TRADEOFFS.md.
 */

export type SignatureAlg = 'Ed25519' | 'ECDSA-P256'

export interface Identity {
  alg: SignatureAlg
  publicKeyHex: string
  /** JWK of the private+public pair for persistence. Never send this off-device. */
  jwk: JsonWebKey
}

export interface PublicIdentity {
  alg: SignatureAlg
  publicKeyHex: string
}

function canEd25519(): boolean {
  return typeof globalThis.crypto?.subtle?.generateKey === 'function'
}

export async function generateIdentity(): Promise<Identity> {
  if (canEd25519()) {
    try {
      return await generateEd25519()
    } catch {
      return generateP256()
    }
  }
  return generateP256()
}

async function generateEd25519(): Promise<Identity> {
  const pair = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, [
    'sign',
    'verify',
  ])) as CryptoKeyPair
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey))
  const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey)
  return { alg: 'Ed25519', publicKeyHex: toHex(raw), jwk }
}

async function generateP256(): Promise<Identity> {
  const pair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  )
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey))
  const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey)
  return { alg: 'ECDSA-P256', publicKeyHex: toHex(raw), jwk }
}

export async function importIdentity(identity: Identity): Promise<CryptoKeyPair> {
  if (identity.alg === 'Ed25519') {
    const privateKey = await crypto.subtle.importKey('jwk', identity.jwk, { name: 'Ed25519' }, true, [
      'sign',
    ])
    const publicJwk: JsonWebKey = { ...identity.jwk, d: undefined, key_ops: ['verify'] }
    const publicKey = await crypto.subtle.importKey('jwk', publicJwk, { name: 'Ed25519' }, true, [
      'verify',
    ])
    return { privateKey, publicKey }
  }

  const privateKey = await crypto.subtle.importKey(
    'jwk',
    identity.jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign']
  )
  const publicJwk: JsonWebKey = { ...identity.jwk, d: undefined, key_ops: ['verify'] }
  const publicKey = await crypto.subtle.importKey(
    'jwk',
    publicJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['verify']
  )
  return { privateKey, publicKey }
}

export async function importPublicKey(alg: SignatureAlg, publicKeyHex: string): Promise<CryptoKey> {
  const raw = fromHex(publicKeyHex) as BufferSource
  if (alg === 'Ed25519') {
    return crypto.subtle.importKey('raw', raw, { name: 'Ed25519' }, true, ['verify'])
  }
  return crypto.subtle.importKey('raw', raw, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify'])
}

export async function signBytes(identity: Identity, data: Uint8Array): Promise<string> {
  const { privateKey } = await importIdentity(identity)
  const algo: AlgorithmIdentifier | EcdsaParams =
    identity.alg === 'Ed25519'
      ? { name: 'Ed25519' }
      : { name: 'ECDSA', hash: 'SHA-256' }
  const sig = await crypto.subtle.sign(algo, privateKey, data as BufferSource)
  return toHex(new Uint8Array(sig))
}

export async function verifyBytes(
  alg: SignatureAlg,
  publicKeyHex: string,
  data: Uint8Array,
  signatureHex: string
): Promise<boolean> {
  try {
    const key = await importPublicKey(alg, publicKeyHex)
    const algo: AlgorithmIdentifier | EcdsaParams =
      alg === 'Ed25519' ? { name: 'Ed25519' } : { name: 'ECDSA', hash: 'SHA-256' }
    return crypto.subtle.verify(algo, key, fromHex(signatureHex) as BufferSource, data as BufferSource)
  } catch {
    return false
  }
}

export function publicPart(identity: Identity): PublicIdentity {
  return { alg: identity.alg, publicKeyHex: identity.publicKeyHex }
}
