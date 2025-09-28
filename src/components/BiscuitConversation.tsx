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
    <div className="card-luxury hover-lift-luxury max-h-96 overflow-hidden flex flex-col animate-fade-in-scale">
      <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-white/20">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full blur-lg opacity-50 animate-glow-luxury"></div>
          <Image
            src="/biscuit.png"
            alt="Biscuit the Hamster"
            width={56}
            height={56}
            className={`relative rounded-full border-4 border-white/50 shadow-luxury ${currentlyTyping ? 'animate-bounce-gentle' : 'animate-float-gentle'}`}
          />
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${currentlyTyping ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 animate-pulse-luxury' : 'bg-gradient-to-r from-green-400 to-green-500'} rounded-full border-3 border-white shadow-soft`}></div>
        </div>
        <div className="flex-1">
          <h3 className="font-black text-xl text-gradient-luxury flex items-center space-x-2">
            <span>Biscuit</span>
            <span className="text-2xl animate-bounce-gentle">{getBiscuitExpression()}</span>
          </h3>
          <p className="text-sm font-medium text-neutral-600">
            {currentlyTyping ? 'Typing...' : 'Your AI Growth Assistant'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 mb-6 max-h-64 scrollbar-hide">
        {messages.map((message, index) => (
          <div key={message.id} className="flex items-start space-x-4 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex-shrink-0">
              {!message.isUser && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-full blur-md opacity-30"></div>
                  <Image
                    src="/biscuit.png"
                    alt="Biscuit"
                    width={40}
                    height={40}
                    className="relative rounded-full border-2 border-white/50 shadow-elegant"
                  />
                </div>
              )}
            </div>
            <div
              className={`max-w-[80%] p-4 rounded-3xl shadow-soft ${
                message.isUser
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white ml-auto rounded-br-lg shadow-luxury'
                  : 'glass-card text-neutral-800 rounded-bl-lg border border-white/20'
              }`}
            >
              {index === messages.length - 1 && !message.isUser && currentlyTyping ? (
                <TypingAnimation
                  text={message.text}
                  speed={25}
                  onComplete={handleTypingComplete}
                  onProgress={handleTypingProgress}
                  className="text-base font-medium leading-relaxed"
                />
              ) : (
                <p className="text-base font-medium leading-relaxed">{message.text}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="text-sm font-medium text-neutral-500 text-center glass-card px-4 py-2 rounded-2xl">
        Biscuit is powered by AI and here to help you grow! 🌱
      </div>
    </div>
  )
}
