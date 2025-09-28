'use client'

import { useState } from 'react'
import { Task } from '@/types'

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void
}

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('personal')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

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
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 ease-out hover:scale-105 hover:border-primary-200 p-8">
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
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-400 transition-all duration-200 ease-out placeholder-neutral-400 focus:shadow-lg"
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
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-400 transition-all duration-200 ease-out placeholder-neutral-400 focus:shadow-lg resize-none"
            placeholder="Add more details..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-neutral-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-400 transition-all duration-200 ease-out placeholder-neutral-400 focus:shadow-lg appearance-none cursor-pointer"
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
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-400 transition-all duration-200 ease-out placeholder-neutral-400 focus:shadow-lg appearance-none cursor-pointer"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 ease-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary-200 w-full text-lg"
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
