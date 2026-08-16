import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  abandonGoal,
  allocate,
  buildDemoLedger,
  buildGraph,
  completeGoal,
  createGoal,
  deleteGoal,
  fold,
  generateIdentity,
  genesis,
  issueReceipt,
  linkGoal,
  migrateLegacyTasks,
  recordInsight,
  verifyChain,
  type ChainEntry,
  type ChainVerifyResult,
  type Domain,
  type GrowthReceipt,
  type Identity,
  type LegacyTask,
  type Priority,
} from '@/engine'
import {
  loadChain,
  loadIdentity,
  loadLegacyTasks,
  saveChain,
  saveIdentity,
  wipeEngineStorage,
} from '@/lib/storage'

export type ViewId = 'command' | 'ledger' | 'graph' | 'capital' | 'receipts' | 'biscuit'

export function useEngine() {
  const [chain, setChain] = useState<ChainEntry[]>([])
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<GrowthReceipt | null>(null)
  const [issuing, setIssuing] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const persist = useCallback((next: ChainEntry[]) => {
    setChain(next)
    saveChain(next)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        let id = loadIdentity()
        if (!id) {
          id = await generateIdentity()
          saveIdentity(id)
        }
        if (cancelled) return
        setIdentity(id)

        const existing = loadChain()
        if (existing && existing.length > 0) {
          persist(existing)
        } else {
          const legacy = loadLegacyTasks()
          if (legacy && legacy.length > 0) {
            const migrated = await migrateLegacyTasks(legacy as LegacyTask[], Date.now())
            persist(migrated)
          } else {
            persist([await genesis([], Date.now())])
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'failed to boot engine')
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [persist])

  const projection = useMemo(() => fold(chain), [chain])
  const goals = useMemo(() => Object.values(projection.goals), [projection])
  const graph = useMemo(() => buildGraph(goals), [goals])
  const plan = useMemo(
    () => allocate(goals, now, chain[0]?.ts ?? 1),
    [goals, now, chain]
  )
  const [integrity, setIntegrity] = useState<ChainVerifyResult>({
    ok: true,
    head: '',
    length: 0,
  })

  useEffect(() => {
    let cancelled = false
    verifyChain(chain).then((r) => {
      if (!cancelled) setIntegrity(r)
    })
    return () => {
      cancelled = true
    }
  }, [chain])

  const append = useCallback(
    async (factory: (current: ChainEntry[]) => Promise<ChainEntry>) => {
      setError(null)
      const entry = await factory(chain)
      persist([...chain, entry])
      setNow(Date.now())
      return entry
    },
    [chain, persist]
  )

  const create = useCallback(
    (input: {
      title: string
      description?: string
      domain: Domain
      priority: Priority
      dependsOn?: string[]
      estimatedMinutes?: number
    }) => append((c) => createGoal(c, input, Date.now())),
    [append]
  )

  const complete = useCallback((id: string) => append((c) => completeGoal(c, id, Date.now())), [append])
  const abandon = useCallback(
    (id: string, reason?: string) => append((c) => abandonGoal(c, id, Date.now(), reason)),
    [append]
  )
  const remove = useCallback((id: string) => append((c) => deleteGoal(c, id, Date.now())), [append])
  const link = useCallback(
    (id: string, dependsOn: string[]) => append((c) => linkGoal(c, id, dependsOn, Date.now())),
    [append]
  )
  const note = useCallback(
    (input: {
      id: string
      kind: 'suggestion' | 'analysis' | 'encouragement' | 'warning'
      title: string
      content: string
      domain?: Domain
      relevantGoalIds: string[]
    }) => append((c) => recordInsight(c, input, Date.now())),
    [append]
  )

  const loadDemo = useCallback(async () => {
    setError(null)
    const demo = await buildDemoLedger(Date.now())
    persist(demo)
    setReceipt(null)
    setNow(Date.now())
  }, [persist])

  const reset = useCallback(async () => {
    wipeEngineStorage()
    const id = await generateIdentity()
    saveIdentity(id)
    setIdentity(id)
    persist([await genesis([], Date.now())])
    setReceipt(null)
  }, [persist])

  const issue = useCallback(async () => {
    if (!identity) throw new Error('identity not ready')
    setIssuing(true)
    setError(null)
    try {
      const next = await issueReceipt({
        identity,
        chain,
        projection,
        now: Date.now(),
      })
      setReceipt(next)
      return next
    } catch (err) {
      const message = err instanceof Error ? err.message : 'failed to issue receipt'
      setError(message)
      throw err
    } finally {
      setIssuing(false)
    }
  }, [identity, chain, projection])

  return {
    ready,
    chain,
    projection,
    goals,
    graph,
    plan,
    integrity,
    identity,
    receipt,
    issuing,
    error,
    now,
    create,
    complete,
    abandon,
    remove,
    link,
    note,
    loadDemo,
    reset,
    issue,
  }
}

export type HypotrophyEngine = ReturnType<typeof useEngine>
