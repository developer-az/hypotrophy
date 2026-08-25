'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type ToastFn = (message: string) => void

const ToastContext = createContext<ToastFn>(() => undefined)

export function useToast(): ToastFn {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<{ id: number; message: string }[]>([])

  const push = useCallback<ToastFn>((message) => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev.slice(-3), { id, message }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }, 2400)
  }, [])

  const value = useMemo(() => push, [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className="toast">
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
