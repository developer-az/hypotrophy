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
    <div className="premium-card p-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20">
            <span className="text-white text-2xl">✨</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Add New Task</h2>
            <p className="text-white/70 text-lg">Create your next growth milestone</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-lg font-semibold text-white mb-3">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="What do you want to accomplish?"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-lg font-semibold text-white mb-3">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-lg font-semibold text-white mb-3">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
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
              <label htmlFor="priority" className="block text-lg font-semibold text-white mb-3">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="form-select"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full text-lg py-4 mt-8"
          >
            <span className="flex items-center justify-center space-x-3">
              <span>✨</span>
              <span>Add Task</span>
              <span>🚀</span>
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}
