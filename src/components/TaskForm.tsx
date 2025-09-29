'use client'

import { useState } from 'react'
import { Task } from '@/types'
import { aiService } from '@/lib/aiService'

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void
  userTasks?: Task[]
}

export default function TaskForm({ onAddTask, userTasks = [] }: TaskFormProps) {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectedCategory, setDetectedCategory] = useState<string>('')
  const [detectedPriority, setDetectedPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsProcessing(true)

    try {
      // Intelligent parsing of the input
      const parsed = parseTaskInput(input.trim())

      onAddTask({
        title: parsed.title,
        description: parsed.description,
        category: parsed.category,
        priority: parsed.priority
      })

      setInput('')
      setDetectedCategory('')
      setDetectedPriority('medium')
      setSuggestions([])
    } catch (error) {
      console.error('Error processing task:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const parseTaskInput = (input: string) => {
    // Intelligent categorization based on keywords
    const category = detectCategory(input)
    const priority = detectPriority(input)
    const { title, description } = extractTitleAndDescription(input)

    return { title, description, category, priority }
  }

  const detectCategory = (text: string): string => {
    const lowerText = text.toLowerCase()

    // Health & Fitness keywords
    if (lowerText.match(/\b(exercise|workout|gym|run|walk|diet|nutrition|sleep|health|fitness|yoga|stretch|meditate|water|vitamins|doctor|checkup)\b/)) {
      return 'health'
    }

    // Career keywords
    if (lowerText.match(/\b(work|job|career|resume|interview|meeting|presentation|deadline|project|client|boss|promotion|skill|professional|linkedin|networking)\b/)) {
      return 'career'
    }

    // Learning keywords
    if (lowerText.match(/\b(learn|study|read|course|book|tutorial|practice|research|skill|knowledge|education|training)\b/)) {
      return 'learning'
    }

    // Finance keywords
    if (lowerText.match(/\b(money|budget|save|invest|bank|pay|bill|expense|income|tax|insurance|loan|debt|financial)\b/)) {
      return 'finance'
    }

    // Relationships keywords
    if (lowerText.match(/\b(friend|family|call|text|visit|date|social|party|gather|connect|relationship|love|partner)\b/)) {
      return 'relationships'
    }

    // Home keywords
    if (lowerText.match(/\b(clean|organize|decorate|repair|garden|cook|laundry|dishes|home|house|room)\b/)) {
      return 'home'
    }

    // Creativity keywords
    if (lowerText.match(/\b(create|art|draw|paint|write|music|design|craft|creative|photo|video|blog)\b/)) {
      return 'creativity'
    }

    return 'personal'
  }

  const detectPriority = (text: string): 'low' | 'medium' | 'high' => {
    const lowerText = text.toLowerCase()

    // High priority indicators
    if (lowerText.match(/\b(urgent|asap|important|critical|deadline|emergency|today|now|immediately)\b/)) {
      return 'high'
    }

    // Low priority indicators
    if (lowerText.match(/\b(someday|eventually|maybe|when i have time|low priority|optional)\b/)) {
      return 'low'
    }

    return 'medium'
  }

  const extractTitleAndDescription = (input: string) => {
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0)

    if (sentences.length === 1) {
      return { title: sentences[0].trim(), description: undefined }
    }

    // First sentence is title, rest is description
    return {
      title: sentences[0].trim(),
      description: sentences.slice(1).join('. ').trim() || undefined
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)

    // Real-time category and priority detection for preview
    if (value.trim().length > 3) {
      const category = detectCategory(value)
      const priority = detectPriority(value)
      setDetectedCategory(category)
      setDetectedPriority(priority)
    } else {
      setDetectedCategory('')
      setDetectedPriority('medium')
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      personal: '👤',
      health: '💪',
      career: '💼',
      learning: '📚',
      relationships: '❤️',
      finance: '💰',
      creativity: '🎨',
      home: '🏠'
    }
    return icons[category] || '✨'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-500/20 border-green-400/50',
      medium: 'bg-yellow-500/20 border-yellow-400/50',
      high: 'bg-red-500/20 border-red-400/50'
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="relative">
      {/* Premium Task Input */}
      <div className="modern-card p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-lg border border-white/20">
            <span className="text-white text-2xl drop-shadow-sm">🎯</span>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white drop-shadow-sm">Create Your Goal</h2>
            <p className="text-white/80 text-lg">Transform your dreams into achievements</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Premium Input Field */}
          <div className="relative">
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="I want to master a new skill, build a healthy habit, or achieve something meaningful..."
                className="glass-input w-full px-6 py-4 text-lg rounded-2xl resize-none min-h-[120px] leading-relaxed"
                disabled={isProcessing}
              />
              
              {/* Premium Detection Badges */}
              {detectedCategory && input.length > 3 && (
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <div className="flex items-center space-x-1 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-xl text-sm font-medium border border-white/30">
                    <span>{getCategoryIcon(detectedCategory)}</span>
                    <span className="capitalize">{detectedCategory}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-sm font-bold text-white backdrop-blur-sm border ${getPriorityColor(detectedPriority)}`}>
                    {detectedPriority.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Animated border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/30 via-white/10 to-white/30 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>
          </div>

          {/* Premium Submit Button */}
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="premium-button w-full relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
          >
            <span className="relative z-10 flex items-center justify-center space-x-3 text-lg">
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating your goal...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">✨</span>
                  <span>Create Goal</span>
                  <span className="text-xl group-hover:animate-bounce">🚀</span>
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}
