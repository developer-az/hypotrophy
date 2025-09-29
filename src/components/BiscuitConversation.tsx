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
      text: "Hi! I'm Biscuit 🐹 Ready to help you grow and achieve your goals!",
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
    <div className="modern-card p-6 max-h-[400px] overflow-hidden flex flex-col">
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <Image
            src="/biscuit.png"
            alt="Biscuit the Hamster"
            width={48}
            height={48}
            className={`rounded-full border-2 border-indigo-200 shadow-md ${currentlyTyping ? 'animate-bounce-gentle' : 'animate-float'}`}
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${currentlyTyping ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'} rounded-full border-2 border-white shadow-sm`}></div>
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800 flex items-center">
            Biscuit {getBiscuitExpression()}
          </h3>
          <p className="text-xs text-gray-500">
            {currentlyTyping ? 'Typing...' : 'AI Assistant'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-64">
        {messages.map((message, index) => (
          <div key={message.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {!message.isUser && (
                <Image
                  src="/biscuit.png"
                  alt="Biscuit"
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-200 shadow-sm"
                />
              )}
            </div>
            <div
              className={`max-w-[90%] p-3 rounded-2xl ${
                message.isUser
                  ? 'bg-indigo-600 text-white ml-auto rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
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
    </div>
  )
}
