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
      text: "Hey there! I'm Biscuit 🐹 Your personal growth companion. Ready to turn your dreams into achievements?",
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
    <div className="modern-card p-6 max-h-[450px] overflow-hidden flex flex-col">
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <Image
            src="/biscuit.png"
            alt="Biscuit the Hamster"
            width={52}
            height={52}
            className={`rounded-full border-2 border-white/30 shadow-lg drop-shadow-sm ${currentlyTyping ? 'animate-bounce-gentle' : 'animate-float'}`}
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${currentlyTyping ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'} rounded-full border-2 border-white shadow-sm`}></div>
        </div>
        <div>
          <h3 className="font-bold text-lg text-white drop-shadow-sm flex items-center">
            Biscuit {getBiscuitExpression()}
          </h3>
          <p className="text-xs text-white/80">
            {currentlyTyping ? 'Thinking...' : 'Growth Companion'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-72">
        {messages.map((message, index) => (
          <div key={message.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {!message.isUser && (
                <Image
                  src="/biscuit.png"
                  alt="Biscuit"
                  width={28}
                  height={28}
                  className="rounded-full border border-white/20 shadow-sm"
                />
              )}
            </div>
            <div
              className={`max-w-[90%] p-3 rounded-2xl backdrop-blur-sm ${
                message.isUser
                  ? 'bg-white/20 text-white ml-auto rounded-br-md border border-white/30'
                  : 'bg-white/15 text-white rounded-bl-md border border-white/20'
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
                <p className="text-sm leading-relaxed">{message.text}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
