'use client'

import { useState, useRef, useEffect } from 'react'
import TypingAnimation from './TypingAnimation'
import { BiscuitMark } from './BiscuitMark'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface BiscuitConversationProps {
  aiResponse?: string
  onResponseComplete?: () => void
  onTypingStart?: () => void
  onTypingEnd?: () => void
}

export default function BiscuitConversation({
  aiResponse,
  onResponseComplete,
  onTypingStart,
  onTypingEnd,
}: BiscuitConversationProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "I'm Biscuit. I don't cheer empty motion. Book a position, and I'll underwrite it.",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [currentlyTyping, setCurrentlyTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const characterCount = useRef(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleTypingProgress = () => {
    characterCount.current += 1
    if (characterCount.current % 10 === 0) {
      setTimeout(() => scrollToBottom(), 10)
    }
  }

  useEffect(() => {
    if (aiResponse && !currentlyTyping) {
      setCurrentlyTyping(true)
      characterCount.current = 0
      onTypingStart?.()
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: aiResponse,
          isUser: false,
          timestamp: new Date(),
        },
      ])
    }
  }, [aiResponse, currentlyTyping, onTypingStart])

  const handleTypingComplete = () => {
    setCurrentlyTyping(false)
    onTypingEnd?.()
    onResponseComplete?.()
  }

  return (
    <div className="panel flex max-h-[520px] flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-4">
        <div className="relative">
          <BiscuitMark size={44} className={currentlyTyping ? 'animate-pulse' : ''} />
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[var(--ink)] ${
              currentlyTyping ? 'bg-[var(--gold)]' : 'bg-emerald-400'
            }`}
          />
        </div>
        <div>
          <div className="font-display text-lg text-[var(--paper)]">Biscuit</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--mute)]">
            {currentlyTyping ? 'underwriting' : 'desk companion'}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((message, index) => (
          <div key={message.id} className="flex items-start gap-3">
            {!message.isUser && <BiscuitMark size={22} />}
            <div className="max-w-[92%] rounded-2xl border border-[var(--line)] bg-[var(--ink-2)] px-3.5 py-2.5 text-sm leading-relaxed text-[var(--paper)]">
              {index === messages.length - 1 && !message.isUser && currentlyTyping ? (
                <TypingAnimation
                  text={message.text}
                  speed={18}
                  onComplete={handleTypingComplete}
                  onProgress={handleTypingProgress}
                />
              ) : (
                <p>{message.text}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
