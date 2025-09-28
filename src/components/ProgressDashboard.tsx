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
      <div className="bg-white rounded-lg p-6 shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
        <div className="text-center py-4">
          <p className="text-gray-500">Add some tasks to see your progress!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
      
      {/* Main stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600">{completedTasks}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-700">{totalTasks}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{streak}</div>
          <div className="text-sm text-gray-600">Active Days</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Category breakdown */}
      {categoryCompletion.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Progress by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryCompletion.map(({ category, total, completed, rate }) => (
              <div key={category} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <span className="text-xl">{getCategoryIcon(category)}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{category}</span>
                    <span className="text-xs text-gray-600">{completed}/{total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${rate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}