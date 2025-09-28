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
      <div className="premium-card p-12 text-center mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg rounded-3xl flex items-center justify-center border border-white/20 animate-pulse-glow">
            <span className="text-5xl animate-float">📊</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">Your Progress Dashboard</h2>
          <p className="text-xl text-white/80 mb-8 max-w-md mx-auto leading-relaxed">Add some tasks to see your amazing progress!</p>
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <span className="text-2xl">🚀</span>
            <span className="text-white font-semibold">Start your growth journey today</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="premium-card p-10 mb-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20">
            <span className="text-white text-2xl">📊</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Progress Dashboard</h2>
            <p className="text-white/70 text-lg">Track your growth journey</p>
          </div>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-green-400/10 backdrop-blur-sm rounded-2xl border border-green-400/20">
            <div className="text-5xl font-black text-white mb-2">{completedTasks}</div>
            <div className="text-lg font-semibold text-white/80">Completed</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-5xl font-black text-white mb-2">{totalTasks}</div>
            <div className="text-lg font-semibold text-white/80">Total Tasks</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-blue-400/10 backdrop-blur-sm rounded-2xl border border-blue-400/20">
            <div className="text-5xl font-black text-white mb-2">{completionRate}%</div>
            <div className="text-lg font-semibold text-white/80">Success Rate</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-purple-400/10 backdrop-blur-sm rounded-2xl border border-purple-400/20">
            <div className="text-5xl font-black text-white mb-2">{streak}</div>
            <div className="text-lg font-semibold text-white/80">Active Days</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-white">Overall Progress</span>
            <span className="text-lg font-bold text-white">{completionRate}%</span>
          </div>
          <div className="w-full h-4 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Category breakdown */}
        {categoryCompletion.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Progress by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryCompletion.map(({ category, total, completed, rate }) => (
                <div key={category} className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <span className="font-semibold text-white capitalize">{category}</span>
                    </div>
                    <span className="text-sm font-bold text-white/90">{completed}/{total}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${rate}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium text-white/70 mt-2">{rate}% complete</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
