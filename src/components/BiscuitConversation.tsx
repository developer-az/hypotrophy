'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import TypingAnimation from './TypingAnimation'

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
  onTypingEnd
}: BiscuitConversationProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hi there! I'm Biscuit, your friendly hamster assistant! 🐹 I'm here to help you grow and achieve your goals. I'll cheer you on, give you insights, and celebrate every victory with you - no matter how small! Let's make some amazing progress together!",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [currentlyTyping, setCurrentlyTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const characterCount = useRef(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-scroll during typing animation (throttled for performance)
  const handleTypingProgress = () => {
    characterCount.current += 1
    // Scroll every 10 characters to follow the text smoothly
    if (characterCount.current % 10 === 0) {
      setTimeout(() => {
        scrollToBottom()
      }, 10)
    }
  }

  useEffect(() => {
    if (aiResponse && !currentlyTyping) {
      setCurrentlyTyping(true)
      characterCount.current = 0 // Reset character count for new message
      onTypingStart?.()
      const newMessage: Message = {
        id: Date.now().toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
    }
  }, [aiResponse, currentlyTyping, onTypingStart])

  const handleTypingComplete = () => {
    setCurrentlyTyping(false)
    onTypingEnd?.()
    onResponseComplete?.()
  }

  const getBiscuitExpression = () => {
    if (currentlyTyping) return '💭'
    const expressions = ['😊', '🤗', '😄', '🎉', '💪', '✨', '🌟', '🚀', '💝', '🐹']
    return expressions[Math.floor(Math.random() * expressions.length)]
  }

  return (
    <div className="modern-card p-8 max-h-[500px] overflow-hidden flex flex-col hover-lift">
      <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gradient-to-r from-primary-200 to-secondary-200">
        <div className="relative">
          <Image
            src="/biscuit.png"
            alt="Biscuit the Hamster"
            width={56}
            height={56}
            className={`rounded-full border-4 border-white/40 shadow-xl ${currentlyTyping ? 'animate-bounce-gentle' : 'animate-float'}`}
          />
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${currentlyTyping ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse' : 'bg-gradient-to-r from-green-400 to-emerald-500'} rounded-full border-3 border-white shadow-soft`}></div>
        </div>
        <div>
          <h3 className="font-black text-xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent flex items-center">
            Biscuit {getBiscuitExpression()}
          </h3>
          <p className="text-sm text-neutral-500 font-medium">
            {currentlyTyping ? 'Typing...' : 'Your AI Growth Assistant'}
          </p>
          <div className="text-xs text-neutral-400 mt-1">
            Biscuit is powered by AI and here to help you grow! 🌱
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 mb-6 max-h-80 pr-2">
        {messages.map((message, index) => (
          <div key={message.id} className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {!message.isUser && (
                <Image
                  src="/biscuit.png"
                  alt="Biscuit"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white/30 shadow-soft"
                />
              )}
            </div>
            <div
              className={`max-w-[85%] p-4 rounded-3xl shadow-soft ${
                message.isUser
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white ml-auto rounded-br-lg shadow-glow'
                  : 'bg-gradient-to-r from-neutral-50 to-neutral-100 text-neutral-800 rounded-bl-lg'
              }`}
            >
              {index === messages.length - 1 && !message.isUser && currentlyTyping ? (
                <TypingAnimation
                  text={message.text}
                  speed={25}
                  onComplete={handleTypingComplete}
                  onProgress={handleTypingProgress}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm">{message.text}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="text-xs text-neutral-400 text-center">
        Biscuit is powered by AI and here to help you grow! 🌱
      </div>
    </div>
  )
}
