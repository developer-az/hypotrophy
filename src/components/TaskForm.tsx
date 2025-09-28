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
    <div className="relative animate-fade-in-scale">
      {/* Luxury Task Input */}
      <div className="card-luxury hover-lift-luxury group">
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-3xl flex items-center justify-center shadow-luxury">
              <span className="text-white text-2xl animate-float-gentle">🎯</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-black text-gradient-luxury mb-2">
              What would you like to accomplish?
            </h2>
            <p className="text-neutral-600 text-lg font-medium">Just describe it naturally - I'll figure out the details!</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Luxury Input Field */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="E.g., 'I need to go for a 30-minute run today' or 'Call mom to catch up this weekend' or 'Finish the presentation for Monday's meeting'"
              className="relative w-full px-8 py-6 text-lg rounded-3xl border-2 border-white/20 bg-white/60 backdrop-blur-sm text-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary-200/50 focus:border-primary-400/50 transition-all duration-500 placeholder-neutral-500 resize-none shadow-soft hover:shadow-elegant font-medium leading-relaxed"
              rows={4}
              disabled={isProcessing}
            />

            {/* Real-time Detection Preview */}
            {detectedCategory && input.length > 3 && (
              <div className="absolute top-6 right-6 flex items-center space-x-3 animate-slide-in-right">
                <span className={`px-4 py-2 rounded-2xl text-sm font-semibold shadow-soft ${getPriorityColor(detectedPriority)}`}>
                  {detectedPriority}
                </span>
                <span className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 rounded-2xl text-sm font-semibold shadow-soft">
                  <span>{getCategoryIcon(detectedCategory)}</span>
                  <span className="capitalize">{detectedCategory}</span>
                </span>
              </div>
            )}
          </div>

          {/* Luxury Submit Button */}
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="w-full btn-luxury text-xl py-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center space-x-4">
              {isProcessing ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="font-semibold">Processing magic...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl animate-bounce-gentle">✨</span>
                  <span className="font-bold">Add to My Goals</span>
                  <span className="text-2xl animate-bounce-gentle" style={{ animationDelay: '0.2s' }}>🚀</span>
                </>
              )}
            </span>
          </button>
        </form>

        {/* Luxury Help Text */}
        <div className="mt-8 glass-card rounded-3xl p-6 border border-primary-200/30 hover-lift-gentle">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-2xl flex items-center justify-center shadow-elegant">
              <span className="text-white text-xl">💡</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg text-neutral-800 mb-3">Smart Detection Examples:</p>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-center space-x-3 group">
                  <span className="w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                  <span className="font-medium">"Exercise for 30 minutes" → 💪 Health, Medium priority</span>
                </li>
                <li className="flex items-center space-x-3 group">
                  <span className="w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                  <span className="font-medium">"Urgent: Finish project deadline tomorrow" → 💼 Career, High priority</span>
                </li>
                <li className="flex items-center space-x-3 group">
                  <span className="w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                  <span className="font-medium">"Maybe read a book when I have time" → 📚 Learning, Low priority</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
