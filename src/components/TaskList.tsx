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
      case 'high': return 'border-red-400/50 bg-red-500/10'
      case 'medium': return 'border-yellow-400/50 bg-yellow-500/10'
      case 'low': return 'border-green-400/50 bg-green-500/10'
      default: return 'border-blue-400/50 bg-blue-500/10'
    }
  }

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-200 border-red-400/50'
      case 'medium': return 'bg-yellow-500/20 text-yellow-200 border-yellow-400/50'
      case 'low': return 'bg-green-500/20 text-green-200 border-green-400/50'
      default: return 'bg-blue-500/20 text-blue-200 border-blue-400/50'
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
      <div className="modern-card p-10 text-center">
        <div aria-hidden="true" className="text-4xl mb-3 animate-float">✳</div>
        <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--serif)' }}>A little room to begin.</h3>
        <p className="text-white/80 max-w-sm mx-auto text-sm">
          Your practice takes shape above, one small promise at a time.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        <div className="sr-only"><h2>Your practice</h2></div>
      <div className="space-y-4">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className={`group modern-card p-5 border-2 ${
              task.completed
                ? 'border-green-400/50 bg-green-500/10'
                : getPriorityColor(task.priority)
            }`}
          >
            <div className="flex items-start space-x-4">
              <button
                onClick={() => onToggleTask(task.id)}
                type="button"
                aria-label={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`}
                aria-pressed={task.completed}
                className={`mt-1 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                  task.completed
                    ? 'bg-green-500 border-green-400 text-white shadow-lg'
                    : 'border-white/40 hover:border-white/60 hover:bg-white/10 text-white'
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
                  <div className="mb-4 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-red-300">⚠️</span>
                      <p className="text-sm font-medium text-red-200">
                        Delete this goal?
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => confirmDelete(task.id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/30 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl drop-shadow-sm">{getCategoryIcon(task.category)}</span>
                    <h3 className={`text-lg font-semibold drop-shadow-sm ${task.completed ? 'line-through text-white/60' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-bold rounded-lg border backdrop-blur-sm ${getPriorityBadge(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    className="text-white/60 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-500/20"
                    title="Delete goal"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {task.description && (
                  <p className={`text-base mb-4 ${task.completed ? 'text-white/60' : 'text-white/90'}`}>
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize bg-white/10 backdrop-blur-sm text-white/90 px-3 py-1 rounded-xl font-medium border border-white/20">
                    {task.category}
                  </span>
                  <span className="text-white/70 font-medium bg-white/10 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/20">
                    {task.completed && task.completedAt
                      ? `✅ Completed ${new Date(task.completedAt).toLocaleDateString()}`
                      : `📅 Created ${new Date(task.createdAt).toLocaleDateString()}`
                    }
                  </span>
                </div>

                {task.aiInsight && (
                  <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <p className="text-sm text-white/90 font-medium">💡 {task.aiInsight}</p>
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
