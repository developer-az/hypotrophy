'use client'

import { useState } from 'react'
import { Goal } from '@/types'

interface GoalListProps {
  goals: Goal[]
  onUpdateProgress: (id: string, progress: number) => void
  onDeleteGoal: (id: string) => void
  onToggleComplete: (id: string) => void
}

export default function GoalList({ goals, onUpdateProgress, onDeleteGoal, onToggleComplete }: GoalListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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
    return icons[category] || '🎯'
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-gray-300'
  }

  const getDaysUntilTarget = (targetDate: Date) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatTargetDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleDeleteClick = (goalId: string) => {
    setDeleteConfirm(goalId)
  }

  const confirmDelete = (goalId: string) => {
    onDeleteGoal(goalId)
    setDeleteConfirm(null)
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  if (goals.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-8 text-center hover-lift">
        <div className="text-6xl mb-4 animate-float">🎯</div>
        <h3 className="text-2xl font-bold text-neutral-800 mb-4">Ready to Set Your Goals?</h3>
        <p className="text-neutral-600 text-lg mb-6">Create your first goal and start your journey towards achievement!</p>
        <div className="inline-flex items-center space-x-2 text-primary-600 font-medium">
          <span>🚀</span>
          <span>Dream big, start small, act now</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">🎯</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800">Your Goals</h2>
        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
          {goals.length}
        </span>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const daysLeft = getDaysUntilTarget(goal.targetDate)
          const isCompleted = goal.progress >= 100
          const isOverdue = daysLeft < 0 && !isCompleted

          return (
            <div
              key={goal.id}
              className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-l-4 hover:shadow-xl transition-all duration-300 ease-out p-6 ${
                isCompleted ? 'border-green-500 bg-green-50/50' :
                isOverdue ? 'border-red-500 bg-red-50/50' :
                'border-primary-500'
              }`}
            >
              {deleteConfirm === goal.id && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-red-500">⚠️</span>
                    <p className="text-sm font-medium text-red-800">
                      Are you sure you want to delete this goal?
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => confirmDelete(goal.id)}
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

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${isCompleted ? 'line-through text-neutral-500' : 'text-neutral-800'}`}>
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className={`text-sm mt-1 ${isCompleted ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {goal.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isCompleted && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                      ✅ Complete
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteClick(goal.id)}
                    className="text-neutral-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                    title="Delete goal"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700">Progress</span>
                  <span className="text-sm font-semibold text-neutral-800">{goal.progress}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(goal.progress)}`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Progress Control */}
              {!isCompleted && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Update Progress
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => onUpdateProgress(goal.id, parseInt(e.target.value))}
                      className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onUpdateProgress(goal.id, Math.min(goal.progress + 10, 100))}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors"
                      >
                        +10%
                      </button>
                      {goal.progress < 100 && (
                        <button
                          onClick={() => onToggleComplete(goal.id)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Goal Info */}
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize bg-neutral-100 text-neutral-700 px-3 py-1 rounded-lg font-medium">
                  {goal.category}
                </span>
                <div className={`font-medium ${
                  isOverdue ? 'text-red-600' :
                  daysLeft <= 7 ? 'text-orange-600' :
                  'text-neutral-500'
                }`}>
                  {isCompleted ? (
                    <span className="text-green-600">🎉 Goal achieved!</span>
                  ) : isOverdue ? (
                    <span>⚠️ {Math.abs(daysLeft)} days overdue</span>
                  ) : daysLeft === 0 ? (
                    <span>🔥 Due today!</span>
                  ) : daysLeft === 1 ? (
                    <span>⏰ Due tomorrow</span>
                  ) : (
                    <span>📅 {daysLeft} days left • {formatTargetDate(goal.targetDate)}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
