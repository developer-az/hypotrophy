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
      low: 'text-green-800 bg-green-100 border-green-300',
      medium: 'text-yellow-800 bg-yellow-100 border-yellow-300',
      high: 'text-red-800 bg-red-100 border-red-300'
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="relative">
      {/* Simplified Task Input */}
      <div className="modern-card p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">🎯</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">Add a Goal</h2>
            <p className="text-gray-500 text-sm">Describe what you want to accomplish</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Simplified Input Field */}
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="I want to exercise for 30 minutes today..."
              className="w-full px-4 py-3 text-base rounded-xl border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 placeholder-gray-400 resize-none shadow-sm"
              rows={3}
              disabled={isProcessing}
            />

            {/* Minimal Detection Preview */}
            {detectedCategory && input.length > 3 && (
              <div className="absolute top-3 right-3 flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(detectedPriority)}`}>
                  {detectedPriority.toUpperCase()}
                </span>
                <span className="flex items-center space-x-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
                  <span>{getCategoryIcon(detectedCategory)}</span>
                  <span className="capitalize">{detectedCategory}</span>
                </span>
              </div>
            )}
          </div>

          {/* Simplified Submit Button */}
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Adding...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>Add Goal</span>
                <span>✨</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
