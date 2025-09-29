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
        <div className="text-6xl mb-6 animate-float drop-shadow-sm">📊</div>
        <h2 className="text-2xl font-bold text-white drop-shadow-sm mb-4">Your Progress Hub</h2>
        <p className="text-white/80 mb-6">Create your first goal to start tracking progress!</p>
      </div>
    )
  }

  return (
    <div className="modern-card p-8 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-lg border border-white/20">
            <span className="text-white text-2xl drop-shadow-sm">📊</span>
          </div>
          <h2 className="text-3xl font-bold text-white drop-shadow-sm">Progress Hub</h2>
        </div>
        {onGenerateInsight && totalTasks > 0 && (
          <button
            onClick={isAnalyzing ? undefined : onGenerateInsight}
            disabled={isAnalyzing}
            className={`premium-button text-sm px-6 py-3 ${
              isAnalyzing
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>{isAnalyzing ? '💭' : '🐹'}</span>
              <span>{isAnalyzing ? 'Analyzing...' : 'Ask Biscuit'}</span>
            </span>
          </button>
        )}
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stats-card">
          <div className="text-4xl font-bold text-white mb-2 drop-shadow-sm">{completedTasks}</div>
          <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Completed</div>
        </div>
        <div className="stats-card">
          <div className="text-4xl font-bold text-white mb-2 drop-shadow-sm">{totalTasks}</div>
          <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Total</div>
        </div>
        <div className="stats-card">
          <div className="text-4xl font-bold text-white mb-2 drop-shadow-sm">{completionRate}%</div>
          <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Success</div>
        </div>
        <div className="stats-card">
          <div className="text-4xl font-bold text-white mb-2 drop-shadow-sm">{streak}</div>
          <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Streak</div>
        </div>
      </div>

      {/* Premium Progress Bar */}
      {totalTasks > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-white drop-shadow-sm">Overall Progress</span>
            <span className="text-2xl font-bold text-white drop-shadow-sm">{completionRate}%</span>
          </div>
          <div className="relative w-full h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
            <div
              className="h-full bg-gradient-to-r from-white/80 to-white/60 rounded-full transition-all duration-500 shadow-inner"
              style={{ width: `${completionRate}%` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Compact Category Progress - Made Smaller */}
      {categoryCompletion.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white/90 mb-3 drop-shadow-sm">Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryCompletion.map(({ category, total, completed, rate }) => (
              <div key={category} className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-3 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <span className="text-sm font-medium text-white/90 capitalize truncate">{category}</span>
                  </div>
                  <span className="text-xs font-bold text-white/80">{completed}/{total}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-white/60 to-white/40 rounded-full transition-all duration-300"
                    style={{ width: `${rate}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white/70 mt-1">{rate}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
