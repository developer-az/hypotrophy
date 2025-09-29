'use client'

import { useState } from 'react'
import { Task } from '@/types'

interface TaskListProps {
  tasks: Task[]
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
}

export default function TaskList({ tasks, onToggleTask, onDeleteTask }: TaskListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by completed status first, then by priority, then by creation date
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }

    const priorityOrder = { high: 3, medium: 2, low: 1 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-green-200 bg-green-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-600 text-white'
      case 'medium': return 'bg-yellow-600 text-white'
      case 'low': return 'bg-green-600 text-white'
      default: return 'bg-blue-600 text-white'
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
    return icons[category] || '📝'
  }

  const handleDeleteClick = (taskId: string) => {
    setDeleteConfirm(taskId)
  }

  const confirmDelete = (taskId: string) => {
    onDeleteTask(taskId)
    setDeleteConfirm(null)
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  if (tasks.length === 0) {
    return (
      <div className="modern-card p-12 text-center">
        <div className="text-6xl mb-6 animate-float">🌱</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Start Your Growth Journey
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Add your first goal above and let Biscuit help you achieve it!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
          <span className="text-white text-lg">📋</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Your Goals</h2>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-xl text-sm font-semibold">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-4">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className={`group modern-card p-6 border-2 ${
              task.completed
                ? 'border-green-200 bg-green-50'
                : getPriorityColor(task.priority)
            }`}
          >
            <div className="flex items-start space-x-4">
              <button
                onClick={() => onToggleTask(task.id)}
                className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  task.completed
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                }`}
              >
                {task.completed && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <div className="flex-1">
                {deleteConfirm === task.id && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-red-500">⚠️</span>
                      <p className="text-sm font-medium text-red-800">
                        Delete this goal?
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => confirmDelete(task.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getCategoryIcon(task.category)}</span>
                    <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-bold rounded-lg ${getPriorityBadge(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                    title="Delete goal"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {task.description && (
                  <p className={`text-lg mb-4 ${task.completed ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 px-4 py-2 rounded-2xl font-bold shadow-soft">
                    {task.category}
                  </span>
                  <span className="text-neutral-500 font-medium bg-neutral-50 px-3 py-1 rounded-xl">
                    {task.completed && task.completedAt
                      ? `✅ Completed ${new Date(task.completedAt).toLocaleDateString()}`
                      : `📅 Created ${new Date(task.createdAt).toLocaleDateString()}`
                    }
                  </span>
                </div>

                {task.aiInsight && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-primary-50 via-secondary-50 to-accent-50 rounded-3xl border-2 border-primary-200/50 shadow-soft">
                    <p className="text-lg text-primary-800 font-medium">💡 {task.aiInsight}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
