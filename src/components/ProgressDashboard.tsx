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
      <div className="modern-card p-12 text-center hover-lift">
        <div className="text-8xl mb-6 animate-float">📊</div>
        <h2 className="text-4xl font-black bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent mb-6">Your Progress Dashboard</h2>
        <p className="text-neutral-600 text-xl mb-8">Add some tasks to see your amazing progress!</p>
        <div className="inline-flex items-center space-x-3 text-primary-600 font-bold text-lg bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-3 rounded-2xl shadow-soft">
          <span className="text-2xl">🚀</span>
          <span>Start your growth journey today</span>
        </div>
      </div>
    )
  }

  return (
    <div className="modern-card p-10 hover-lift">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-3xl flex items-center justify-center shadow-xl animate-pulse-rainbow">
            <span className="text-white text-2xl">📊</span>
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">Your Progress Dashboard</h2>
        </div>
        {onGenerateInsight && totalTasks > 0 && (
          <button
            onClick={isAnalyzing ? undefined : onGenerateInsight}
            disabled={isAnalyzing}
            className={`px-6 py-3 rounded-2xl font-bold shadow-xl transition-all duration-500 ease-out focus:outline-none focus:ring-4 ${
              isAnalyzing
                ? 'bg-neutral-400 text-neutral-600 cursor-not-allowed opacity-75'
                : 'bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white hover:shadow-2xl hover:scale-105 active:scale-95 focus:ring-primary-200/50 animate-glow'
            }`}
          >
            <span className="flex items-center space-x-3">
              <span className="text-xl">{isAnalyzing ? '💭' : '🐹'}</span>
              <span>{isAnalyzing ? 'Biscuit is thinking...' : 'Ask Biscuit for Analysis'}</span>
            </span>
          </button>
        )}
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="text-center p-6 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 rounded-3xl shadow-soft hover-scale">
          <div className="text-5xl font-black text-primary-600 mb-2">{completedTasks}</div>
          <div className="text-sm font-bold text-primary-700 uppercase tracking-wide">Completed</div>
        </div>
        <div className="text-center p-6 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 rounded-3xl shadow-soft hover-scale">
          <div className="text-5xl font-black text-neutral-700 mb-2">{totalTasks}</div>
          <div className="text-sm font-bold text-neutral-600 uppercase tracking-wide">Total Tasks</div>
        </div>
        <div className="text-center p-6 bg-gradient-to-br from-accent-50 via-accent-100 to-accent-200 rounded-3xl shadow-soft hover-scale">
          <div className="text-5xl font-black text-accent-600 mb-2">{completionRate}%</div>
          <div className="text-sm font-bold text-accent-700 uppercase tracking-wide">Success Rate</div>
        </div>
        <div className="text-center p-6 bg-gradient-to-br from-secondary-50 via-secondary-100 to-secondary-200 rounded-3xl shadow-soft hover-scale">
          <div className="text-5xl font-black text-secondary-600 mb-2">{streak}</div>
          <div className="text-sm font-bold text-secondary-700 uppercase tracking-wide">Active Days</div>
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
