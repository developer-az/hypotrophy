'use client'

import { useState } from 'react'
import { Task } from '@/types'
import { aiService } from '@/lib/aiService'

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void
  userTasks?: Task[]
}

export default function TaskForm({ onAddTask, userTasks = [] }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('personal')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority
    })

    setTitle('')
    setDescription('')
    setCategory('personal')
    setPriority('medium')
    setSuggestions([])
  }

  const generateSuggestions = async () => {
    if (!category) return

    setLoadingSuggestions(true)
    try {
      const newSuggestions = await aiService.generateTaskSuggestions(category, userTasks)
      setSuggestions(newSuggestions)
    } catch (error) {
      console.error('Error generating suggestions:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const useSuggestion = (suggestion: string) => {
    setTitle(suggestion)
    setSuggestions([])
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ease-out p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-lg">✨</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800">Add New Task</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-neutral-700 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
            placeholder="What do you want to accomplish?"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-neutral-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 resize-none"
            placeholder="Add more details..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="category" className="block text-sm font-semibold text-neutral-700">
                  Category
                </label>
                <button
                  type="button"
                  onClick={generateSuggestions}
                  disabled={loadingSuggestions}
                  className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-lg font-medium hover:bg-primary-200 transition-colors duration-200 disabled:opacity-50"
                >
                  {loadingSuggestions ? '🤖 Generating...' : '🤖 Get AI Suggestions'}
                </button>
              </div>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 appearance-none cursor-pointer"
              >
              <option value="personal">👤 Personal</option>
              <option value="health">💪 Health & Fitness</option>
              <option value="career">💼 Career</option>
              <option value="learning">📚 Learning</option>
              <option value="relationships">❤️ Relationships</option>
              <option value="finance">💰 Finance</option>
              <option value="creativity">🎨 Creativity</option>
              <option value="home">🏠 Home & Environment</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-semibold text-neutral-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm text-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-400 transition-all duration-200 ease-out placeholder-neutral-400 focus:shadow-lg appearance-none cursor-pointer"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
            <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              AI Task Suggestions for {category}
            </h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => useSuggestion(suggestion)}
                  className="w-full text-left p-3 bg-white/80 rounded-lg border border-primary-100 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-sm text-neutral-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-lg"
        >
          <span className="flex items-center justify-center space-x-2">
            <span>✨</span>
            <span>Add Task</span>
          </span>
        </button>
      </form>
    </div>
  )
}
