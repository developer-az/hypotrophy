import { describe, expect, it } from 'vitest'
import { appendEntry } from '../crypto/chain'
import { fold } from '../domain/reducer'
import { createGoal, completeGoal, abandonGoal, genesis, linkGoal } from '../commands'

describe('event reducer', () => {
  it('replays a history into a deterministic projection', async () => {
    const ts = 1_700_000_000_000
    let chain = [await genesis([], ts)]
    chain = [...chain, await createGoal(chain, { id: 'a', title: 'Ship the ledger', domain: 'career', priority: 'high', estimatedMinutes: 60 }, ts + 1)]
    chain = [...chain, await createGoal(chain, { id: 'b', title: 'Write proofs', domain: 'learning', priority: 'medium', dependsOn: ['a'], estimatedMinutes: 45 }, ts + 2)]
    chain = [...chain, await completeGoal(chain, 'a', ts + 3)]
    chain = [...chain, await abandonGoal(chain, 'b', ts + 4, 'scope cut')]

    const once = fold(chain)
    const twice = fold(chain)
    expect(once).toEqual(twice)
    expect(once.createdCount).toBe(2)
    expect(once.completedCount).toBe(1)
    expect(once.abandonedCount).toBe(1)
    expect(once.goals.a.status).toBe('completed')
    expect(once.goals.b.status).toBe('abandoned')
    expect(once.goals.b.dependsOn).toEqual(['a'])
  })

  it('ignores duplicate creates and completing an unknown id', async () => {
    const ts = 1_700_000_000_000
    let chain = [await genesis([], ts)]
    chain = [...chain, await createGoal(chain, { id: 'a', title: 'One', domain: 'health', priority: 'low' }, ts + 1)]
    chain = [...chain, await createGoal(chain, { id: 'a', title: 'Two', domain: 'health', priority: 'high' }, ts + 2)]
    chain = [...chain, await completeGoal(chain, 'missing', ts + 3)]
    const p = fold(chain)
    expect(Object.keys(p.goals)).toEqual(['a'])
    expect(p.goals.a.title).toBe('One')
    expect(p.goals.a.status).toBe('open')
    expect(p.completedCount).toBe(0)
  })

  it('drops deleted nodes from other dependency lists', async () => {
    const ts = 1_700_000_000_000
    let chain = [await genesis([], ts)]
    chain = [...chain, await createGoal(chain, { id: 'a', title: 'Alpha', domain: 'personal', priority: 'low' }, ts + 1)]
    chain = [...chain, await createGoal(chain, { id: 'b', title: 'Beta', domain: 'personal', priority: 'low', dependsOn: ['a'] }, ts + 2)]
    chain = [...chain, await appendEntry(chain, 'goal.deleted', { id: 'a' }, ts + 3)]
    const p = fold(chain)
    expect(p.goals.a).toBeUndefined()
    expect(p.goals.b.dependsOn).toEqual([])
  })

  it('linkGoal is additive', async () => {
    const ts = 1_700_000_000_000
    let chain = [await genesis([], ts)]
    chain = [...chain, await createGoal(chain, { id: 'a', title: 'Alpha', domain: 'career', priority: 'high' }, ts + 1)]
    chain = [...chain, await createGoal(chain, { id: 'b', title: 'Beta', domain: 'career', priority: 'high' }, ts + 2)]
    chain = [...chain, await linkGoal(chain, 'b', ['a'], ts + 3)]
    expect(fold(chain).goals.b.dependsOn).toEqual(['a'])
  })
})
