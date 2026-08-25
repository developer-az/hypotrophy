'use client'

import { useState, type FormEvent } from 'react'
import type { HypotrophyEngine } from '@/hooks/useEngine'
import { ACCOUNT_KINDS, type AccountKind, type MoneyKind } from '@/engine'
import { formatUsd } from '@/lib/format'
import { useToast } from '../Toast'

export default function MoneyView({ engine }: { engine: HypotrophyEngine }) {
  const toast = useToast()
  const { accounts, projection, pnl, addAccount, logMoney, balanceAccount } = engine
  const [name, setName] = useState('Cash')
  const [kind, setKind] = useState<AccountKind>('cash')
  const [openBal, setOpenBal] = useState('0')
  const [postAcct, setPostAcct] = useState(accounts[0]?.id ?? '')
  const [postAmt, setPostAmt] = useState('')
  const [postKind, setPostKind] = useState<MoneyKind>('income')
  const [memo, setMemo] = useState('')
  const [snapId, setSnapId] = useState(accounts[0]?.id ?? '')
  const [snapAmt, setSnapAmt] = useState('')

  const open = async (e: FormEvent) => {
    e.preventDefault()
    const cents = Math.round(Number(openBal || '0') * 100)
    if (!Number.isInteger(cents)) return
    await addAccount({ name, kind, cents: kind === 'credit' ? Math.abs(cents) : cents })
    toast('Account opened')
    setName('')
    setOpenBal('0')
  }

  const post = async (e: FormEvent) => {
    e.preventDefault()
    const id = postAcct || accounts[0]?.id
    if (!id) return
    const cents = Math.round(Number(postAmt) * 100)
    if (!Number.isInteger(cents) || cents <= 0) return
    await logMoney({ accountId: id, cents, kind: postKind, memo: memo || undefined })
    toast(postKind === 'income' ? 'Income logged' : 'Spend logged')
    setPostAmt('')
    setMemo('')
  }

  const snap = async (e: FormEvent) => {
    e.preventDefault()
    const id = snapId || accounts[0]?.id
    if (!id) return
    const cents = Math.round(Number(snapAmt) * 100)
    if (!Number.isInteger(cents)) return
    await balanceAccount(id, cents)
    toast('Balance updated')
    setSnapAmt('')
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="kicker">Money</div>
        <h1 className="font-display text-3xl text-[var(--paper)]">Cash, debt, and a running P&L</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          Declared on this device. Credit is what you owe. Net worth {formatUsd(pnl.netWorthCents)}.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {accounts.length === 0 && (
          <p className="panel p-6 text-sm text-[var(--mute)] sm:col-span-3">No accounts yet. Open cash below.</p>
        )}
        {accounts.map((a) => (
          <article key={a.id} className="panel p-5">
            <div className="kicker">{a.kind}</div>
            <h2 className="mt-1 font-display text-xl text-[var(--paper)]">{a.name}</h2>
            <p className="mt-2 font-mono text-lg text-[var(--gold)]">
              {a.kind === 'credit' ? `−${formatUsd(Math.abs(a.cents))}` : formatUsd(a.cents)}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={open} className="panel p-5">
          <div className="kicker">Open account</div>
          <label className="mt-3 block">
            <span className="kicker mb-1 block">Name</span>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="mt-3 block">
            <span className="kicker mb-1 block">Kind</span>
            <select className="field" value={kind} onChange={(e) => setKind(e.target.value as AccountKind)}>
              {ACCOUNT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block">
            <span className="kicker mb-1 block">Balance $</span>
            <input className="field" inputMode="decimal" value={openBal} onChange={(e) => setOpenBal(e.target.value)} />
          </label>
          <button type="submit" className="btn-gold mt-4 w-full">
            Open
          </button>
        </form>

        <form onSubmit={post} className="panel p-5">
          <div className="kicker">Log income or spend</div>
          <label className="mt-3 block">
            <span className="kicker mb-1 block">Account</span>
            <select className="field" value={postAcct} onChange={(e) => setPostAcct(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block">
            <span className="kicker mb-1 block">Amount $</span>
            <input className="field" inputMode="decimal" value={postAmt} onChange={(e) => setPostAmt(e.target.value)} required />
          </label>
          <label className="mt-3 block">
            <span className="kicker mb-1 block">Type</span>
            <select className="field" value={postKind} onChange={(e) => setPostKind(e.target.value as MoneyKind)}>
              <option value="income">income</option>
              <option value="expense">expense</option>
            </select>
          </label>
          <label className="mt-3 block">
            <span className="kicker mb-1 block">Memo</span>
            <input className="field" value={memo} onChange={(e) => setMemo(e.target.value)} />
          </label>
          <button type="submit" className="btn-gold mt-4 w-full" disabled={accounts.length === 0}>
            Post
          </button>
        </form>

        <form onSubmit={snap} className="panel p-5">
          <div className="kicker">Snapshot balance</div>
          <label className="mt-3 block">
            <span className="kicker mb-1 block">Account</span>
            <select className="field" value={snapId} onChange={(e) => setSnapId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block">
            <span className="kicker mb-1 block">New balance $</span>
            <input className="field" inputMode="decimal" value={snapAmt} onChange={(e) => setSnapAmt(e.target.value)} required />
          </label>
          <button type="submit" className="btn-quiet mt-4 w-full" disabled={accounts.length === 0}>
            Set
          </button>
        </form>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--line)] px-5 py-4">
          <div className="kicker">Recent posts</div>
        </div>
        {projection.money.length === 0 ? (
          <p className="p-5 text-sm text-[var(--mute)]">No income or spend yet.</p>
        ) : (
          <ul>
            {projection.money.slice(0, 20).map((m) => (
              <li key={m.id} className="flex justify-between gap-3 border-t border-[var(--line)] px-5 py-3 text-sm">
                <span>
                  {m.kind} {m.memo ? `· ${m.memo}` : ''}
                </span>
                <span className="font-mono text-[var(--gold)]">
                  {m.kind === 'expense' ? '−' : '+'}
                  {formatUsd(m.cents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
