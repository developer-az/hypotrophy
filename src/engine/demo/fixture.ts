import { appendEntry, type ChainEntry } from '../crypto/chain'
import { mulberry32 } from '../quant/bandit'
import type { Domain, Priority } from '../domain/types'

const DAY = 86_400_000

interface DemoGoal {
  id: string
  title: string
  description: string
  domain: Domain
  priority: Priority
  dependsOn: string[]
  estimatedMinutes: number
  createdOffsetDays: number
  outcome: 'open' | 'completed' | 'abandoned'
  settleOffsetDays?: number
}

/**
 * Deterministic six-week human-capital history so a recruiter can click
 * "Load demo ledger" and immediately see the allocator, graph, survival
 * curve, and receipts working on non-trivial data — not an empty todo list.
 */
export function demoScript(): DemoGoal[] {
  return [
    {
      id: 'g-sys',
      title: 'Read a systems design primer end to end',
      description: 'Latency, consistency, and capacity — the vocabulary interviews actually use.',
      domain: 'learning',
      priority: 'high',
      dependsOn: [],
      estimatedMinutes: 180,
      createdOffsetDays: -42,
      outcome: 'completed',
      settleOffsetDays: -35,
    },
    {
      id: 'g-crypto',
      title: 'Implement SHA-256 hash chaining from first principles',
      description: 'Append-only log with prevHash, no framework.',
      domain: 'learning',
      priority: 'high',
      dependsOn: ['g-sys'],
      estimatedMinutes: 240,
      createdOffsetDays: -34,
      outcome: 'completed',
      settleOffsetDays: -28,
    },
    {
      id: 'g-merkle',
      title: 'Build RFC 6962 Merkle proofs',
      description: 'Inclusion proofs with leaf/node domain separation.',
      domain: 'learning',
      priority: 'high',
      dependsOn: ['g-crypto'],
      estimatedMinutes: 180,
      createdOffsetDays: -27,
      outcome: 'completed',
      settleOffsetDays: -22,
    },
    {
      id: 'g-receipts',
      title: 'Issue Ed25519 growth receipts',
      description: 'Sign a weekly Merkle root. No public chain.',
      domain: 'career',
      priority: 'high',
      dependsOn: ['g-merkle'],
      estimatedMinutes: 210,
      createdOffsetDays: -21,
      outcome: 'completed',
      settleOffsetDays: -16,
    },
    {
      id: 'g-tests',
      title: 'Property-test the ledger against tampering',
      description: 'Mutate payloads and assert verifyChain fails.',
      domain: 'career',
      priority: 'high',
      dependsOn: ['g-crypto'],
      estimatedMinutes: 150,
      createdOffsetDays: -26,
      outcome: 'completed',
      settleOffsetDays: -18,
    },
    {
      id: 'g-allocator',
      title: 'Ship Thompson + half-Kelly allocator',
      description: 'Feasible set from the DAG, ranking from the quant layer.',
      domain: 'career',
      priority: 'high',
      dependsOn: ['g-sys', 'g-tests'],
      estimatedMinutes: 240,
      createdOffsetDays: -17,
      outcome: 'open',
    },
    {
      id: 'g-resume',
      title: 'Publish a verifiable human-capital resume',
      description: 'The receipt is the resume. Titles stay private.',
      domain: 'career',
      priority: 'high',
      dependsOn: ['g-receipts', 'g-allocator'],
      estimatedMinutes: 120,
      createdOffsetDays: -8,
      outcome: 'open',
    },
    {
      id: 'g-run',
      title: 'Run 3x this week',
      description: 'Keep the body in the same ledger as the mind.',
      domain: 'health',
      priority: 'medium',
      dependsOn: [],
      estimatedMinutes: 90,
      createdOffsetDays: -14,
      outcome: 'completed',
      settleOffsetDays: -4,
    },
    {
      id: 'g-sleep',
      title: 'Lights out by 11 for seven nights',
      description: 'Sleep is a position, not a vibe.',
      domain: 'health',
      priority: 'medium',
      dependsOn: [],
      estimatedMinutes: 20,
      createdOffsetDays: -20,
      outcome: 'abandoned',
      settleOffsetDays: -12,
    },
    {
      id: 'g-budget',
      title: 'Reconcile last month of spending',
      description: 'Know the burn before talking about yield.',
      domain: 'finance',
      priority: 'medium',
      dependsOn: [],
      estimatedMinutes: 60,
      createdOffsetDays: -30,
      outcome: 'completed',
      settleOffsetDays: -25,
    },
    {
      id: 'g-invest',
      title: 'Write an investment policy statement',
      description: 'Rules beat moods.',
      domain: 'finance',
      priority: 'low',
      dependsOn: ['g-budget'],
      estimatedMinutes: 90,
      createdOffsetDays: -24,
      outcome: 'open',
    },
    {
      id: 'g-write',
      title: 'Draft architecture decision records',
      description: 'If you cannot explain the tradeoff, you did not make one.',
      domain: 'creativity',
      priority: 'medium',
      dependsOn: ['g-sys'],
      estimatedMinutes: 90,
      createdOffsetDays: -19,
      outcome: 'completed',
      settleOffsetDays: -11,
    },
    {
      id: 'g-call',
      title: 'Call someone who actually ships',
      description: 'One conversation > ten LinkedIn likes.',
      domain: 'relationships',
      priority: 'medium',
      dependsOn: [],
      estimatedMinutes: 45,
      createdOffsetDays: -9,
      outcome: 'open',
    },
    {
      id: 'g-desk',
      title: 'Clear the desk to one stack',
      description: 'Environment is a forcing function.',
      domain: 'home',
      priority: 'low',
      dependsOn: [],
      estimatedMinutes: 40,
      createdOffsetDays: -6,
      outcome: 'open',
    },
    {
      id: 'g-journal',
      title: 'Write a one-page weekly review',
      description: 'What compounded. What leaked. What gets cut.',
      domain: 'personal',
      priority: 'medium',
      dependsOn: [],
      estimatedMinutes: 35,
      createdOffsetDays: -5,
      outcome: 'open',
    },
  ]
}

export async function buildDemoLedger(now: number, seed = 20250814): Promise<ChainEntry[]> {
  const rng = mulberry32(seed)
  const chain: ChainEntry[] = []
  const genesisTs = now - 43 * DAY
  chain.push(
    await appendEntry(chain, 'ledger.genesis', { protocol: 'hypotrophy-hce', version: 1 }, genesisTs)
  )

  const script = demoScript()
  const jitter = () => Math.floor(rng() * 8 * 3_600_000)

  for (const goal of script) {
    const createdAt = now + goal.createdOffsetDays * DAY + jitter()
    chain.push(
      await appendEntry(
        chain,
        'goal.created',
        {
          id: goal.id,
          title: goal.title,
          description: goal.description,
          domain: goal.domain,
          priority: goal.priority,
          dependsOn: goal.dependsOn,
          estimatedMinutes: goal.estimatedMinutes,
        },
        createdAt
      )
    )
    if (goal.outcome === 'completed' && goal.settleOffsetDays != null) {
      chain.push(
        await appendEntry(
          chain,
          'goal.completed',
          { id: goal.id },
          now + goal.settleOffsetDays * DAY + jitter()
        )
      )
    }
    if (goal.outcome === 'abandoned' && goal.settleOffsetDays != null) {
      chain.push(
        await appendEntry(
          chain,
          'goal.abandoned',
          { id: goal.id, reason: 'did not compound' },
          now + goal.settleOffsetDays * DAY + jitter()
        )
      )
    }
  }

  chain.push(
    await appendEntry(
      chain,
      'insight.recorded',
      {
        id: 'ins-demo',
        kind: 'analysis',
        title: 'Demo ledger loaded',
        content:
          'This history is synthetic but internally consistent: a career/learning critical path, a health abandonment, and a finance dependency. Use it to exercise the allocator, then replace it with your own chain.',
        relevantGoalIds: ['g-allocator', 'g-resume'],
      },
      now - DAY
    )
  )

  return chain
}
