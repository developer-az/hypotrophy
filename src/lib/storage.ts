import type { ChainEntry } from '@/engine'
import type { Identity } from '@/engine'

const CHAIN_KEY = 'hypotrophy-hce-v1'
const IDENTITY_KEY = 'hypotrophy-hce-identity'
const LEGACY_TASKS_KEY = 'hypotrophy-tasks'
const LEGACY_INSIGHTS_KEY = 'hypotrophy-insights'

export function loadChain(): ChainEntry[] | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(CHAIN_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { version: number; chain: ChainEntry[] }
    if (parsed.version !== 1 || !Array.isArray(parsed.chain)) return null
    return parsed.chain
  } catch {
    return null
  }
}

export function saveChain(chain: ChainEntry[]) {
  window.localStorage.setItem(CHAIN_KEY, JSON.stringify({ version: 1, chain }))
}

export function loadIdentity(): Identity | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(IDENTITY_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Identity
  } catch {
    return null
  }
}

export function saveIdentity(identity: Identity) {
  window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity))
}

export function loadLegacyTasks(): unknown[] | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(LEGACY_TASKS_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function clearLegacyKeys() {
  window.localStorage.removeItem(LEGACY_TASKS_KEY)
  window.localStorage.removeItem(LEGACY_INSIGHTS_KEY)
}

export function wipeEngineStorage() {
  window.localStorage.removeItem(CHAIN_KEY)
  window.localStorage.removeItem(IDENTITY_KEY)
}
