import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  abandonGoal,
  allocate,
  buildDemoLedger,
  buildGraph,
  buildPnl,
  BILLS_INTEL_ID,
  cioPayload,
  completeGoal,
  createGoal,
  deleteGoal,
  dollarImpactFromNext,
  draftMemo,
  fold,
  forecast,
  generateIdentity,
  genesis,
  issueReceipt,
  linkGoal,
  migrateLegacyTasks,
  nextHours,
  openAccount,
  postMoney,
  recordInsight,
  recordIntel,
  setAccountBalance,
  TWO_HOUR_MINUTES,
  upsertSkill,
  verifyChain,
  type AccountKind,
  type ChainEntry,
  type ChainVerifyResult,
  type Domain,
  type GrowthReceipt,
  type Identity,
  type LegacyTask,
  type MoneyKind,
  type Priority,
} from '@/engine'
import {
  loadChain,
  loadIdentity,
  loadLegacyTasks,
  parseSnapshot,
  saveChain,
  saveIdentity,
  snapshotChain,
  wipeEngineStorage,
} from '@/lib/storage'

export type ViewId = 'home' | 'money' | 'skills' | 'work' | 'proof'

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
  const skills = useMemo(() => Object.values(projection.skills), [projection])
  const accounts = useMemo(() => Object.values(projection.accounts), [projection])
  const graph = useMemo(() => buildGraph(goals), [goals])
  const plan = useMemo(
    () => allocate(goals, now, chain[0]?.ts ?? 1, skills),
    [goals, now, chain, skills]
  )
  const forward = useMemo(
    () => forecast(goals, now, chain[0]?.ts ?? 1, { skills }),
    [goals, now, chain, skills]
  )
  const horizon = useMemo(
    () => nextHours(goals, now, chain[0]?.ts ?? 1, skills, TWO_HOUR_MINUTES),
    [goals, now, chain, skills]
  )
  const pnl = useMemo(() => buildPnl(projection, forward, now), [projection, forward, now])
  const impactCents = useMemo(
    () => dollarImpactFromNext(plan.next, goals, skills),
    [plan.next, goals, skills]
  )
  const memo = useMemo(
    () => draftMemo({ plan, pnl, forward, impactCents }),
    [plan, pnl, forward, impactCents]
  )
  const briefing = useMemo(
    () => cioPayload({ plan, pnl, forward, impactCents }),
    [plan, pnl, forward, impactCents]
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

  const commit = useCallback(
    (next: ChainEntry[]) => {
      persist(next)
      setNow(Date.now())
    },
    [persist]
  )

  const append = useCallback(
    async (factory: (current: ChainEntry[]) => Promise<ChainEntry>) => {
      setError(null)
      const entry = await factory(chain)
      commit([...chain, entry])
      return entry
    },
    [chain, commit]
  )

  const create = useCallback(
    (input: {
      title: string
      description?: string
      domain: Domain
      priority: Priority
      dependsOn?: string[]
      estimatedMinutes?: number
      stakeCents?: number
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
      kind: 'suggestion' | 'analysis' | 'encouragement' | 'warning' | 'memo'
      title: string
      content: string
      domain?: Domain
      relevantGoalIds: string[]
    }) => append((c) => recordInsight(c, input, Date.now())),
    [append]
  )

  const addAccount = useCallback(
    async (input: { name: string; kind: AccountKind; cents?: number }) => {
      setError(null)
      let c = chain
      const opened = await openAccount(c, { name: input.name, kind: input.kind }, Date.now())
      c = [...c, opened]
      const id = (opened.payload as { id: string }).id
      if (input.cents != null && Number.isInteger(input.cents)) {
        c = [...c, await setAccountBalance(c, id, input.cents, Date.now() + 1)]
      }
      commit(c)
      return id
    },
    [chain, commit]
  )

  const balanceAccount = useCallback(
    (id: string, cents: number) => append((c) => setAccountBalance(c, id, cents, Date.now())),
    [append]
  )

  const logMoney = useCallback(
    (input: { accountId: string; cents: number; kind: MoneyKind; memo?: string }) =>
      append((c) => postMoney(c, input, Date.now())),
    [append]
  )

  const saveSkill = useCallback(
    (input: { id?: string; name: string; domain: Domain; rateCentsPerHour: number }) =>
      append((c) => upsertSkill(c, input, Date.now())),
    [append]
  )

  const saveIntel = useCallback(
    (input: { id?: string; title: string; cents?: number; skillId?: string; note?: string }) =>
      append((c) => recordIntel(c, input, Date.now())),
    [append]
  )

  const onboard = useCallback(
    async (input: {
      cashCents: number
      billsCents: number
      rateCentsPerHour: number
      goalTitle?: string
    }) => {
      setError(null)
      let c = chain.length ? chain : [await genesis([], Date.now())]
      const t = Date.now()
      c = [...c, await openAccount(c, { id: 'acct-cash', name: 'Cash', kind: 'cash' }, t)]
      c = [...c, await setAccountBalance(c, 'acct-cash', input.cashCents, t + 1)]
      c = [
        ...c,
        await upsertSkill(
          c,
          {
            id: 'skill-core',
            name: 'Your rate',
            domain: 'career',
            rateCentsPerHour: input.rateCentsPerHour,
          },
          t + 2
        ),
      ]
      c = [
        ...c,
        await recordIntel(
          c,
          { id: BILLS_INTEL_ID, title: 'Monthly bills', cents: input.billsCents },
          t + 3
        ),
      ]
      const goal = input.goalTitle?.trim()
      if (goal && goal.length >= 2) {
        c = [
          ...c,
          await createGoal(
            c,
            {
              title: goal.slice(0, 200),
              domain: 'finance',
              priority: 'high',
              estimatedMinutes: 60,
              stakeCents: Math.min(input.cashCents, 50_000_000),
            },
            t + 4
          ),
        ]
      }
      commit(c)
    },
    [chain, commit]
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

  const exportLedger = useCallback(() => {
    const pack = snapshotChain(chain)
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hypotrophy-ledger-${pack.exportedAt}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [chain])

  const importLedger = useCallback(
    async (raw: string) => {
      setError(null)
      const pack = parseSnapshot(raw)
      const check = await verifyChain(pack.chain)
      if (!check.ok) {
        throw new Error(check.reason ?? 'imported chain does not verify')
      }
      persist(pack.chain)
      setReceipt(null)
      setNow(Date.now())
    },
    [persist]
  )

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
    skills,
    accounts,
    graph,
    plan,
    horizon,
    forward,
    pnl,
    impactCents,
    memo,
    briefing,
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
    addAccount,
    balanceAccount,
    logMoney,
    saveSkill,
    saveIntel,
    onboard,
    loadDemo,
    reset,
    issue,
    exportLedger,
    importLedger,
  }
}

export type HypotrophyEngine = ReturnType<typeof useEngine>
