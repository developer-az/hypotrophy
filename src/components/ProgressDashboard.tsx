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
      <div className="modern-card p-16 text-center mb-12">
        <div className="text-8xl mb-8 animate-float">📊</div>
        <h2 className="text-4xl font-black text-gray-800 mb-8">Your Progress Dashboard</h2>
        <p className="text-gray-600 text-xl mb-10 max-w-lg mx-auto">Add some tasks to see your amazing progress!</p>
        <div className="inline-flex items-center space-x-4 text-indigo-700 font-bold text-lg bg-indigo-50 px-8 py-4 rounded-2xl border border-indigo-200">
          <span className="text-2xl">🚀</span>
          <span>Start your growth journey today</span>
        </div>
      </div>
    )
  }

  return (
    <div className="modern-card p-10 mb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl">📊</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800">Your Progress Dashboard</h2>
        </div>
        {onGenerateInsight && totalTasks > 0 && (
          <button
            onClick={isAnalyzing ? undefined : onGenerateInsight}
            disabled={isAnalyzing}
            className={`px-6 py-3 rounded-2xl font-bold shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 ${
              isAnalyzing
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-75'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl focus:ring-indigo-200'
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
        <div className="text-center p-6 bg-green-50 rounded-3xl border border-green-200 hover:shadow-lg transition-shadow">
          <div className="text-5xl font-black text-green-700 mb-2">{completedTasks}</div>
          <div className="text-sm font-bold text-green-600 uppercase tracking-wide">Completed</div>
        </div>
        <div className="text-center p-6 bg-blue-50 rounded-3xl border border-blue-200 hover:shadow-lg transition-shadow">
          <div className="text-5xl font-black text-blue-700 mb-2">{totalTasks}</div>
          <div className="text-sm font-bold text-blue-600 uppercase tracking-wide">Total Tasks</div>
        </div>
        <div className="text-center p-6 bg-purple-50 rounded-3xl border border-purple-200 hover:shadow-lg transition-shadow">
          <div className="text-5xl font-black text-purple-700 mb-2">{completionRate}%</div>
          <div className="text-sm font-bold text-purple-600 uppercase tracking-wide">Success Rate</div>
        </div>
        <div className="text-center p-6 bg-orange-50 rounded-3xl border border-orange-200 hover:shadow-lg transition-shadow">
          <div className="text-5xl font-black text-orange-700 mb-2">{streak}</div>
          <div className="text-sm font-bold text-orange-600 uppercase tracking-wide">Active Days</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-gray-800">Overall Progress</span>
          <span className="text-2xl font-black text-indigo-600">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

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
