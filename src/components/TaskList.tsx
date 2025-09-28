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
      <div className="card-luxury hover-lift-luxury text-center animate-fade-in-scale">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-primary-500/20 rounded-full blur-3xl scale-150 animate-pulse-luxury"></div>
          <div className="relative text-8xl animate-float-gentle">🌱</div>
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-pulse-luxury flex items-center justify-center">
            <span className="text-white text-sm">✨</span>
          </div>
        </div>
        <h3 className="text-4xl font-black text-gradient-luxury mb-6">
          Ready to Transform Your Life?
        </h3>
        <p className="text-xl text-neutral-600 font-medium mb-8 max-w-lg mx-auto leading-relaxed">
          Describe any goal naturally above, and watch as Biscuit helps you break it down and achieve it step by step!
        </p>
        <div className="inline-flex items-center space-x-4 glass-card px-8 py-4 rounded-2xl hover-lift-gentle">
          <span className="text-2xl animate-bounce-gentle">✨</span>
          <span className="text-lg font-bold text-gradient-luxury">Your growth journey starts with one task</span>
          <span className="text-2xl animate-bounce-gentle" style={{ animationDelay: '0.3s' }}>🚀</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-scale">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur-lg opacity-50"></div>
          <div className="relative w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-luxury">
            <span className="text-white text-lg animate-float-gentle">📋</span>
          </div>
        </div>
        <h2 className="text-3xl font-black text-gradient-luxury">Your Tasks</h2>
        <div className="glass-card px-4 py-2 rounded-2xl shadow-soft">
          <span className="text-lg font-bold text-gradient-luxury">
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="space-y-6">
        {sortedTasks.map((task, index) => (
          <div
            key={task.id}
            className={`group card-luxury hover-lift-luxury animate-slide-up relative overflow-hidden ${
              task.completed
                ? 'border-green-300/50 bg-gradient-to-br from-green-50/80 to-emerald-50/80'
                : getPriorityColor(task.priority) === 'border-red-500'
                ? 'border-red-300/50 bg-gradient-to-br from-red-50/80 to-pink-50/80'
                : getPriorityColor(task.priority) === 'border-yellow-500'
                ? 'border-yellow-300/50 bg-gradient-to-br from-yellow-50/80 to-amber-50/80'
                : 'border-primary-300/50 bg-gradient-to-br from-primary-50/80 to-indigo-50/80'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Priority indicator */}
            <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 ${
              task.completed
                ? 'bg-green-500'
                : getPriorityColor(task.priority) === 'border-red-500'
                ? 'bg-red-500'
                : getPriorityColor(task.priority) === 'border-yellow-500'
                ? 'bg-yellow-500'
                : 'bg-primary-500'
            } rounded-full blur-2xl`}></div>
            
            <div className="relative flex items-start space-x-6">
              <button
                onClick={() => onToggleTask(task.id)}
                className={`mt-2 w-8 h-8 rounded-2xl border-3 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-soft hover:shadow-elegant ${
                  task.completed
                    ? 'bg-gradient-to-br from-accent-500 to-accent-600 border-accent-500 text-white shadow-luxury'
                    : 'border-neutral-300 hover:border-primary-500 bg-white/80 backdrop-blur-sm hover:bg-primary-100'
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
                  <div className="mb-6 glass-card p-6 border border-red-300/50 rounded-2xl animate-fade-in-scale">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">⚠️</span>
                      <p className="text-lg font-semibold text-red-800">
                        Are you sure you want to delete this task?
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => confirmDelete(task.id)}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-2xl hover:shadow-luxury transition-all duration-300 hover:scale-105"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="px-6 py-3 glass-card text-neutral-700 font-semibold rounded-2xl hover:shadow-elegant transition-all duration-300 hover:scale-105"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-2xl flex items-center justify-center shadow-soft">
                      <span className="text-lg">{getCategoryIcon(task.category)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${task.completed ? 'line-through text-neutral-500' : 'text-neutral-800'}`}>
                        {task.title}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-2xl mt-1 ${
                        task.priority === 'high' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 shadow-soft' :
                        task.priority === 'medium' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 shadow-soft' :
                        'bg-gradient-to-r from-green-100 to-green-200 text-green-700 shadow-soft'
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    className="text-neutral-400 hover:text-red-500 transition-all duration-300 p-3 rounded-2xl hover:bg-red-50 hover:shadow-elegant group"
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
