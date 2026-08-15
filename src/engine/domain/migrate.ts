import { appendEntry, type ChainEntry } from '../crypto/chain'
import { isDomain, isPriority, type Domain, type Priority } from './types'

/** Legacy hackathon Task shape (localStorage `hypotrophy-tasks`). */
export interface LegacyTask {
  id: string
  title: string
  description?: string
  completed: boolean
  category: string
  priority: 'low' | 'medium' | 'high'
  createdAt: string | number | Date
  completedAt?: string | number | Date
}

function tsOf(value: string | number | Date | undefined, fallback: number): number {
  if (value == null) return fallback
  if (typeof value === 'number' && Number.isFinite(value)) return Math.floor(value)
  const n = new Date(value).getTime()
  return Number.isFinite(n) ? n : fallback
}

/**
 * One-way migration: old task documents become an append-only event history.
 * The original localStorage key is left in place until the new ledger
 * verifies, so a failed migration cannot destroy user data.
 */
export async function migrateLegacyTasks(
  tasks: LegacyTask[],
  now: number
): Promise<ChainEntry[]> {
  const chain: ChainEntry[] = []
  const genesis = await appendEntry(
    chain,
    'ledger.genesis',
    { protocol: 'hypotrophy-hce', version: 1 },
    now
  )
  chain.push(genesis)

  const sorted = [...tasks].sort((a, b) => tsOf(a.createdAt, now) - tsOf(b.createdAt, now))
  for (const task of sorted) {
    const createdAt = tsOf(task.createdAt, now)
    const domain: Domain = isDomain(task.category) ? task.category : 'personal'
    const priority: Priority = isPriority(task.priority) ? task.priority : 'medium'
    const created = await appendEntry(
      chain,
      'goal.created',
      {
        id: String(task.id),
        title: task.title,
        description: task.description,
        domain,
        priority,
        dependsOn: [],
        estimatedMinutes: 30,
      },
      createdAt
    )
    chain.push(created)
    if (task.completed) {
      const done = await appendEntry(
        chain,
        'goal.completed',
        { id: String(task.id) },
        tsOf(task.completedAt, createdAt)
      )
      chain.push(done)
    }
  }
  return chain
}
