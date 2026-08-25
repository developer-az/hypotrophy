'use client'

import { useState, type FormEvent } from 'react'
import type { HypotrophyEngine } from '@/hooks/useEngine'
import { DOMAINS, type Domain } from '@/engine'
import { DOMAIN_META, formatUsdRate } from '@/lib/format'
import { useToast } from '../Toast'

export default function SkillsView({ engine }: { engine: HypotrophyEngine }) {
  const toast = useToast()
  const { skills, saveSkill, saveIntel, pnl } = engine
  const [name, setName] = useState('')
  const [domain, setDomain] = useState<Domain>('career')
  const [rate, setRate] = useState('50')
  const [editId, setEditId] = useState<string | undefined>()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const cents = Math.round(Number(rate) * 100)
    if (!name.trim() || !Number.isInteger(cents) || cents < 0) return
    await saveSkill({ id: editId, name: name.trim(), domain, rateCentsPerHour: cents })
    toast(editId ? 'Rate updated' : 'Skill added')
    setName('')
    setRate('50')
    setEditId(undefined)
  }

  const bump = async (id: string, nextRate: number) => {
    const skill = skills.find((s) => s.id === id)
    if (!skill) return
    await saveIntel({
      title: `Rate check: ${skill.name}`,
      cents: nextRate,
      skillId: id,
      note: 'Explicit reprice — not inferred from finishing work.',
    })
    toast('Rate updated from a fact you captured')
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="kicker">Skills</div>
        <h1 className="font-display text-3xl text-[var(--paper)]">What an hour of you is worth</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          Blended rate {formatUsdRate(pnl.blendedRateCentsPerHour)}. Completing work does not magically
          raise this — you bump a rate when you have a real offer or invoice.
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        {skills.length === 0 && (
          <p className="panel p-6 text-sm text-[var(--mute)] md:col-span-2">
            Add the rate you can actually bill or earn.
          </p>
        )}
        {skills.map((s) => (
          <article key={s.id} className="panel p-5">
            <div className="kicker">{DOMAIN_META[s.domain].label}</div>
            <h2 className="mt-1 font-display text-xl text-[var(--paper)]">{s.name}</h2>
            <p className="mt-2 font-mono text-lg text-[var(--gold)]">{formatUsdRate(s.rateCentsPerHour)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-quiet"
                onClick={() => {
                  setEditId(s.id)
                  setName(s.name)
                  setDomain(s.domain)
                  setRate(String(s.rateCentsPerHour / 100))
                }}
              >
                Edit
              </button>
              <button type="button" className="btn-quiet" onClick={() => void bump(s.id, s.rateCentsPerHour + 1000)}>
                +$10/hr
              </button>
            </div>
          </article>
        ))}
      </div>

      <form onSubmit={submit} className="panel p-6">
        <div className="kicker">{editId ? 'Update skill' : 'Add skill'}</div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="block md:col-span-1">
            <span className="kicker mb-1 block">Name</span>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="block">
            <span className="kicker mb-1 block">Area</span>
            <select className="field" value={domain} onChange={(e) => setDomain(e.target.value as Domain)}>
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {DOMAIN_META[d].label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="kicker mb-1 block">$/hour</span>
            <input className="field" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
          </label>
        </div>
        <button type="submit" className="btn-gold mt-4">
          {editId ? 'Save rate' : 'Add to rate card'}
        </button>
      </form>
    </div>
  )
}
