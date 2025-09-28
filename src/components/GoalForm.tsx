'use client'

import { useState } from 'react'
import { Goal } from '@/types'

interface GoalFormProps {
  onAddGoal: (goal: Omit<Goal, 'id' | 'progress' | 'tasks'>) => void
}

export default function GoalForm({ onAddGoal }: GoalFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('personal')
  const [targetDate, setTargetDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onAddGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      targetDate: new Date(targetDate || Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days from now
    })

    setTitle('')
    setDescription('')
    setCategory('personal')
    setTargetDate('')
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 hover-lift">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-lg">🎯</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800">Create New Goal</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="goal-title" className="block text-sm font-semibold text-neutral-700 mb-2">
            Goal Title *
          </label>
          <input
            type="text"
            id="goal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 placeholder-gray-400"
            placeholder="What do you want to achieve?"
            required
          />
        </div>

        <div>
          <label htmlFor="goal-description" className="block text-sm font-semibold text-neutral-700 mb-2">
            Description
          </label>
          <textarea
            id="goal-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 placeholder-gray-400 resize-none"
            placeholder="Describe your goal..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="goal-category" className="block text-sm font-semibold text-neutral-700 mb-2">
              Category
            </label>
            <select
              id="goal-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none cursor-pointer"
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
            <label htmlFor="goal-target-date" className="block text-sm font-semibold text-neutral-700 mb-2">
              Target Date
            </label>
            <input
              type="date"
              id="goal-target-date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary-200"
        >
          <span className="flex items-center justify-center space-x-2">
            <span>🎯</span>
            <span>Create Goal</span>
          </span>
        </button>
      </form>
    </div>
  )
}
