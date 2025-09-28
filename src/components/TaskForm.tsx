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
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-red-600 bg-red-100'
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="relative">
      {/* Modern Task Input */}
      <div className="bg-gradient-to-br from-white to-neutral-50 rounded-3xl shadow-xl border border-neutral-200/50 hover:shadow-2xl transition-all duration-500 ease-out p-8 backdrop-blur-sm">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">🎯</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent">
              What would you like to accomplish?
            </h2>
            <p className="text-neutral-500 text-sm">Just describe it naturally - I'll figure out the details!</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Smart Input Field */}
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="E.g., 'I need to go for a 30-minute run today' or 'Call mom to catch up this weekend' or 'Finish the presentation for Monday's meeting'"
              className="w-full px-6 py-5 text-lg rounded-2xl border-2 border-neutral-200 bg-white/80 text-neutral-800 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 placeholder-neutral-400 resize-none shadow-sm"
              rows={3}
              disabled={isProcessing}
            />

            {/* Real-time Detection Preview */}
            {detectedCategory && input.length > 3 && (
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(detectedPriority)}`}>
                  {detectedPriority}
                </span>
                <span className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <span>{getCategoryIcon(detectedCategory)}</span>
                  <span className="capitalize">{detectedCategory}</span>
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-5 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <span className="flex items-center justify-center space-x-3">
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Add to My Goals</span>
                  <span>🚀</span>
                </>
              )}
            </span>
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 mt-0.5">💡</span>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Smart Detection Examples:</p>
              <ul className="space-y-1 text-blue-600">
                <li>• "Exercise for 30 minutes" → 💪 Health, Medium priority</li>
                <li>• "Urgent: Finish project deadline tomorrow" → 💼 Career, High priority</li>
                <li>• "Maybe read a book when I have time" → 📚 Learning, Low priority</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
