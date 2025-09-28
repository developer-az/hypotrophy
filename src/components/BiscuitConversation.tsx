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
}

export default function BiscuitConversation({
  aiResponse,
  onResponseComplete
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (aiResponse && !currentlyTyping) {
      setCurrentlyTyping(true)
      const newMessage: Message = {
        id: Date.now().toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
    }
  }, [aiResponse, currentlyTyping])

  const handleTypingComplete = () => {
    setCurrentlyTyping(false)
    onResponseComplete?.()
  }

  const getBiscuitExpression = () => {
    if (currentlyTyping) return '💭'
    const expressions = ['😊', '🤗', '😄', '🎉', '💪', '✨', '🌟', '🚀', '💝', '🐹']
    return expressions[Math.floor(Math.random() * expressions.length)]
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 max-h-96 overflow-hidden flex flex-col hover-lift">
      <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-neutral-200">
        <div className="relative">
          <Image
            src="/biscuit.png"
            alt="Biscuit the Hamster"
            width={48}
            height={48}
            className={`rounded-full border-2 border-primary-200 ${currentlyTyping ? 'animate-bounce-gentle' : 'animate-float'}`}
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${currentlyTyping ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'} rounded-full border-2 border-white`}></div>
        </div>
        <div>
          <h3 className="font-bold text-neutral-800 flex items-center">
            Biscuit {getBiscuitExpression()}
          </h3>
          <p className="text-xs text-neutral-500">
            {currentlyTyping ? 'Typing...' : 'Your AI Growth Assistant'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-64">
        {messages.map((message, index) => (
          <div key={message.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {!message.isUser && (
                <Image
                  src="/biscuit.png"
                  alt="Biscuit"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
            </div>
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.isUser
                  ? 'bg-primary-500 text-white ml-auto rounded-br-md'
                  : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
              }`}
            >
              {index === messages.length - 1 && !message.isUser && currentlyTyping ? (
                <TypingAnimation
                  text={message.text}
                  speed={25}
                  onComplete={handleTypingComplete}
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
