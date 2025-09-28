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
      <div className="glass-card p-8 mb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">📊</span>
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-800">Your Progress</h2>
            <p className="text-gray-500">Track your growth journey</p>
          </div>
        </div>
        <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
          Add some tasks to see your progress dashboard come to life! 
          Track completion rates, streaks, and category insights.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-4 max-w-sm mx-auto">
          <div className="text-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs text-gray-500">Goals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-xs text-gray-500">Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-xs text-gray-500">Achievements</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 mb-8 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">📊</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Progress</h2>
            <p className="text-gray-500 text-sm">Keep up the great work!</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary-600">{completionRate}%</div>
          <div className="text-xs text-gray-500">Completion Rate</div>
        </div>
      </div>

      {/* Enhanced stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-lg border border-primary-200/50">
          <div className="text-2xl font-bold text-primary-600 mb-1">{completedTasks}</div>
          <div className="text-sm text-primary-700 font-medium">Tasks Completed</div>
          <div className="text-xs text-primary-600 mt-1">
            out of {totalTasks} total
          </div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-accent-50 to-accent-100/50 rounded-lg border border-accent-200/50">
          <div className="text-2xl font-bold text-accent-600 mb-1">{Object.keys(categoryStats).length}</div>
          <div className="text-sm text-accent-700 font-medium">Active Categories</div>
          <div className="text-xs text-accent-600 mt-1">
            areas of growth
          </div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100/50 rounded-lg border border-success-200/50">
          <div className="text-2xl font-bold text-success-600 mb-1">{streak}</div>
          <div className="text-sm text-success-700 font-medium">Day Streak</div>
          <div className="text-xs text-success-600 mt-1">
            keep it going! 🔥
          </div>
        </div>
      </div>

      {/* Enhanced progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-600">{completedTasks}/{totalTasks} completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className="progress-bar h-full transition-all duration-700 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Enhanced category breakdown */}
      {categoryCompletion.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <span>📈</span>
            <span>Progress by Category</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryCompletion.map(({ category, total, completed, rate }) => (
              <div key={category} className="flex items-center space-x-3 p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50 hover:bg-gray-100/80 transition-all duration-200">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-soft">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold capitalize text-gray-800">{category}</span>
                    <span className="text-xs text-gray-600 font-medium">{completed}/{total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{rate}% complete</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}