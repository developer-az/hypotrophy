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
      <div className="card-luxury hover-lift-luxury text-center mb-12 animate-fade-in-scale">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl scale-150 animate-pulse-luxury"></div>
          <div className="relative text-8xl animate-float-gentle">📊</div>
        </div>
        <h2 className="text-4xl font-black text-gradient-luxury mb-6">Your Progress Dashboard</h2>
        <p className="text-xl text-neutral-600 font-medium mb-8 max-w-md mx-auto leading-relaxed">
          Add some tasks to see your amazing progress!
        </p>
        <div className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-2xl shadow-soft">
          <span className="text-2xl animate-bounce-gentle">🚀</span>
          <span className="text-lg font-semibold text-primary-700">Start your growth journey today</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card-luxury hover-lift-luxury mb-12 animate-fade-in-scale">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-600 rounded-2xl blur-lg opacity-50"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-luxury">
              <span className="text-white text-2xl animate-float-gentle">📊</span>
            </div>
          </div>
          <h2 className="text-3xl font-black text-gradient-luxury">Your Progress Dashboard</h2>
        </div>
        {onGenerateInsight && totalTasks > 0 && (
          <button
            onClick={isAnalyzing ? undefined : onGenerateInsight}
            disabled={isAnalyzing}
            className={`px-6 py-3 rounded-2xl font-bold text-lg shadow-luxury transition-all duration-300 ease-out focus:outline-none focus:ring-4 ${
              isAnalyzing
                ? 'bg-neutral-400 text-neutral-600 cursor-not-allowed opacity-75'
                : 'btn-luxury hover-lift-gentle focus:ring-primary-200/50'
            }`}
          >
            <span className="flex items-center space-x-3">
              <span className="text-xl">{isAnalyzing ? '💭' : '🐹'}</span>
              <span>{isAnalyzing ? 'Biscuit is thinking...' : 'Ask Biscuit for Analysis'}</span>
            </span>
          </button>
        )}
      </div>

      {/* Luxury Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="glass-card text-center p-6 hover-lift-gentle group">
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-5xl font-black text-gradient-gold mb-2">{completedTasks}</div>
          </div>
          <div className="text-sm font-bold text-primary-700 uppercase tracking-wider">Completed</div>
        </div>
        <div className="glass-card text-center p-6 hover-lift-gentle group">
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-500/20 to-neutral-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-5xl font-black text-gradient-platinum mb-2">{totalTasks}</div>
          </div>
          <div className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Total Tasks</div>
        </div>
        <div className="glass-card text-center p-6 hover-lift-gentle group">
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-accent-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-5xl font-black text-gradient-luxury mb-2">{completionRate}%</div>
          </div>
          <div className="text-sm font-bold text-accent-700 uppercase tracking-wider">Success Rate</div>
        </div>
        <div className="glass-card text-center p-6 hover-lift-gentle group">
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-500/20 to-secondary-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-5xl font-black text-gradient-luxury mb-2">{streak}</div>
          </div>
          <div className="text-sm font-bold text-secondary-700 uppercase tracking-wider">Active Days</div>
        </div>
      </div>

      {/* Luxury Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-neutral-800">Overall Progress</span>
          <span className="text-2xl font-black text-gradient-luxury">{completionRate}%</span>
        </div>
        <div className="progress-bar-luxury">
          <div
            className="progress-fill-luxury animate-gradient-shift"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Luxury Category Breakdown */}
      {categoryCompletion.length > 0 && (
        <div>
          <h3 className="text-2xl font-black text-gradient-luxury mb-6">Progress by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryCompletion.map(({ category, total, completed, rate }) => (
              <div key={category} className="glass-card hover-lift-gentle group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-2xl flex items-center justify-center shadow-elegant group-hover:shadow-luxury transition-shadow duration-300">
                      <span className="text-xl">{getCategoryIcon(category)}</span>
                    </div>
                    <span className="font-bold text-neutral-800 capitalize text-lg">{category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-gradient-luxury">{completed}/{total}</div>
                    <div className="text-sm font-medium text-neutral-600">tasks</div>
                  </div>
                </div>
                <div className="progress-bar-luxury mb-3">
                  <div
                    className="progress-fill-luxury"
                    style={{ width: `${rate}%` }}
                  ></div>
                </div>
                <div className="text-sm font-bold text-primary-600">{rate}% complete</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
