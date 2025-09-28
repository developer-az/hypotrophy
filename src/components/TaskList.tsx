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
      case 'high': return 'border-red-500'
      case 'medium': return 'border-yellow-500'
      case 'low': return 'border-green-500'
      default: return 'border-gray-500'
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
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl border border-blue-200/50 hover:shadow-2xl transition-all duration-500 ease-out p-12 text-center">
        <div className="relative mb-6">
          <div className="text-7xl animate-float">🌱</div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-neutral-800 to-blue-600 bg-clip-text text-transparent mb-4">
          Ready to Transform Your Life?
        </h3>
        <p className="text-neutral-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Describe any goal naturally above, and watch as Biscuit helps you break it down and achieve it step by step!
        </p>
        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-2xl text-blue-700 font-semibold">
          <span>✨</span>
          <span>Your growth journey starts with one task</span>
          <span>🚀</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">📋</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800">Your Tasks</h2>
        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-4">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className={`group bg-gradient-to-br from-white to-neutral-50/50 rounded-3xl shadow-lg border-2 hover:shadow-2xl transition-all duration-500 ease-out animate-slide-up p-6 hover:scale-[1.01] ${
              task.completed
                ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                : getPriorityColor(task.priority) === 'border-red-500'
                ? 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50'
                : getPriorityColor(task.priority) === 'border-yellow-500'
                ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50'
                : 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <button
                onClick={() => onToggleTask(task.id)}
                className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  task.completed
                    ? 'bg-accent-500 border-accent-500 text-white shadow-lg'
                    : 'border-neutral-300 hover:border-primary-500 hover:shadow-lg'
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
                        Are you sure you want to delete this task?
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => confirmDelete(task.id)}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="px-4 py-2 bg-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                    <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-neutral-500' : 'text-neutral-800'}`}>
                      {task.title}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    className="text-neutral-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                    title="Delete task"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {task.description && (
                  <p className={`text-sm mb-3 ${task.completed ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize bg-neutral-100 text-neutral-700 px-3 py-1 rounded-lg font-medium">
                    {task.category}
                  </span>
                  <span className="text-neutral-500 font-medium">
                    {task.completed && task.completedAt
                      ? `✅ Completed ${new Date(task.completedAt).toLocaleDateString()}`
                      : `📅 Created ${new Date(task.createdAt).toLocaleDateString()}`
                    }
                  </span>
                </div>

                {task.aiInsight && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
                    <p className="text-sm text-primary-800 font-medium">💡 {task.aiInsight}</p>
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
