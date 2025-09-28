'use client'

import { Task } from '@/types'

interface ProgressDashboardProps {
  tasks: Task[]
}

export default function ProgressDashboard({ tasks }: ProgressDashboardProps) {
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Calculate category distribution
  const categoryStats = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate completion by category
  const categoryCompletion = Object.keys(categoryStats).map(category => {
    const categoryTasks = tasks.filter(task => task.category === category)
    const completedInCategory = categoryTasks.filter(task => task.completed).length
    return {
      category,
      total: categoryTasks.length,
      completed: completedInCategory,
      rate: categoryTasks.length > 0 ? Math.round((completedInCategory / categoryTasks.length) * 100) : 0
    }
  })

  // Get streak (simplified - consecutive days with completed tasks)
  const today = new Date()
  const completedDates = tasks
    .filter(task => task.completed && task.completedAt)
    .map(task => {
      const date = new Date(task.completedAt!)
      return date.toDateString()
    })

  const uniqueCompletedDates = [...new Set(completedDates)]
  const streak = uniqueCompletedDates.length

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

  if (totalTasks === 0) {
    return (
      <div className="premium-card p-8 text-center">
        <div className="text-6xl mb-4 animate-float">📊</div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Your Progress Dashboard</h2>
        <p className="text-neutral-600 text-lg">Add some tasks to see your amazing progress!</p>
        <div className="mt-6">
          <div className="inline-flex items-center space-x-2 text-primary-600 font-medium">
            <span>🚀</span>
            <span>Start your growth journey today</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="premium-card p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-lg">📊</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800">Your Progress Dashboard</h2>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl">
          <div className="text-4xl font-black text-primary-600 mb-1">{completedTasks}</div>
          <div className="text-sm font-semibold text-primary-700">Completed</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl">
          <div className="text-4xl font-black text-neutral-700 mb-1">{totalTasks}</div>
          <div className="text-sm font-semibold text-neutral-600">Total Tasks</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl">
          <div className="text-4xl font-black text-accent-600 mb-1">{completionRate}%</div>
          <div className="text-sm font-semibold text-accent-700">Success Rate</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl">
          <div className="text-4xl font-black text-secondary-600 mb-1">{streak}</div>
          <div className="text-sm font-semibold text-secondary-700">Active Days</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-neutral-700">Overall Progress</span>
          <span className="text-lg font-bold text-primary-600">{completionRate}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Category breakdown */}
      {categoryCompletion.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">Progress by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryCompletion.map(({ category, total, completed, rate }) => (
              <div key={category} className="premium-card p-4 hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                    <span className="font-semibold text-neutral-700 capitalize">{category}</span>
                  </div>
                  <span className="text-sm font-bold text-primary-600">{completed}/{total}</span>
                </div>
                <div className="progress-bar h-2">
                  <div
                    className="progress-fill h-2"
                    style={{ width: `${rate}%` }}
                  ></div>
                </div>
                <div className="text-xs font-medium text-neutral-500 mt-2">{rate}% complete</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
