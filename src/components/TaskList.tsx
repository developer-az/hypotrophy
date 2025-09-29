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
      <div className="modern-card p-16 text-center">
        <div className="relative mb-8">
          <div className="text-8xl animate-float">🌱</div>
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full"></div>
        </div>
        <h3 className="text-4xl font-black text-gray-800 mb-6">
          Ready to Transform Your Life?
        </h3>
        <p className="text-gray-600 text-xl mb-10 max-w-lg mx-auto leading-relaxed">
          Describe any goal naturally above, and watch as Biscuit helps you break it down and achieve it step by step!
        </p>
        <div className="inline-flex items-center space-x-4 bg-indigo-50 px-8 py-4 rounded-3xl text-indigo-700 font-bold text-lg border border-indigo-200">
          <span className="text-2xl">✨</span>
          <span>Your growth journey starts with one task</span>
          <span className="text-2xl">🚀</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
          <span className="text-white text-xl">📋</span>
        </div>
        <h2 className="text-3xl font-black text-gray-800">Your Tasks</h2>
        <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-2xl text-lg font-bold border border-indigo-200">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-6">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className={`group modern-card p-8 border-2 ${
              task.completed
                ? 'border-green-200 bg-green-50'
                : getPriorityColor(task.priority)
            }`}
          >
            <div className="flex items-start space-x-6">
              <button
                onClick={() => onToggleTask(task.id)}
                className={`mt-2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md ${
                  task.completed
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                }`}
              >
                {task.completed && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <div className="flex-1">
                {deleteConfirm === task.id && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200/50 rounded-3xl shadow-soft">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-red-500 text-2xl">⚠️</span>
                      <p className="text-lg font-bold text-red-800">
                        Are you sure you want to delete this task?
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => confirmDelete(task.id)}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-soft"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="px-6 py-3 bg-gradient-to-r from-neutral-200 to-neutral-300 text-neutral-700 font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl animate-bounce-gentle">{getCategoryIcon(task.category)}</span>
                    <h3 className={`text-2xl font-bold ${task.completed ? 'line-through text-neutral-500' : 'text-neutral-800'}`}>
                      {task.title}
                    </h3>
                    <span className={`px-4 py-2 text-sm font-black rounded-2xl shadow-soft ${getPriorityBadge(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    className="text-neutral-400 hover:text-red-500 transition-all duration-300 p-3 rounded-2xl hover:bg-red-50 hover:shadow-soft hover:scale-110"
                    title="Delete task"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
