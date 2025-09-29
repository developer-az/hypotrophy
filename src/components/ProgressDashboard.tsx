'use client'

import { Task } from '@/types'

interface ProgressDashboardProps {
  tasks: Task[]
  onGenerateInsight?: () => void
  isAnalyzing?: boolean
}

export default function ProgressDashboard({ tasks, onGenerateInsight, isAnalyzing = false }: ProgressDashboardProps) {
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
      <div className="modern-card p-12 text-center mb-8">
        <div className="text-6xl mb-6 animate-float">📊</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Progress Dashboard</h2>
        <p className="text-gray-600 mb-6">Add goals to track your progress!</p>
      </div>
    )
  }

  return (
    <div className="modern-card p-8 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white text-xl">📊</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Progress</h2>
        </div>
        {onGenerateInsight && totalTasks > 0 && (
          <button
            onClick={isAnalyzing ? undefined : onGenerateInsight}
            disabled={isAnalyzing}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
              isAnalyzing
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-75'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-200'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>{isAnalyzing ? '💭' : '🐹'}</span>
              <span>{isAnalyzing ? 'Analyzing...' : 'Ask Biscuit'}</span>
            </span>
          </button>
        )}
      </div>

      {/* Simplified stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-200">
          <div className="text-3xl font-bold text-green-700 mb-1">{completedTasks}</div>
          <div className="text-xs font-medium text-green-600 uppercase">Completed</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <div className="text-3xl font-bold text-blue-700 mb-1">{totalTasks}</div>
          <div className="text-xs font-medium text-blue-600 uppercase">Total</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-200">
          <div className="text-3xl font-bold text-purple-700 mb-1">{completionRate}%</div>
          <div className="text-xs font-medium text-purple-600 uppercase">Success</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-2xl border border-orange-200">
          <div className="text-3xl font-bold text-orange-700 mb-1">{streak}</div>
          <div className="text-xs font-medium text-orange-600 uppercase">Days</div>
        </div>
      </div>

      {/* Simplified progress bar */}
      {totalTasks > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-lg font-bold text-indigo-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {categoryCompletion.length > 0 && (
        <div>
          <h3 className="text-xl font-black text-gray-800 mb-6">Progress by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryCompletion.map(({ category, total, completed, rate }) => (
              <div key={category} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 ease-out hover:scale-105 hover:border-primary-200 p-4">
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
