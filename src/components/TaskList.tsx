'use client'

import { Task } from '@/types'

interface TaskListProps {
  tasks: Task[]
  onToggleTask: (id: string) => void
}

export default function TaskList({ tasks, onToggleTask }: TaskListProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by completed status first, then by priority, then by creation date
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const totalTasks = tasks.length
  const completedCount = tasks.filter(task => task.completed).length

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium' 
      case 'low': return 'priority-low'
      default: return 'priority-medium'
    }
  }

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': 
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">🔴 High</span>
      case 'medium': 
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">🟡 Medium</span>
      case 'low': 
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">🟢 Low</span>
      default: 
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 font-medium">📝 Normal</span>
    }
  }

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

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🌱</div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-3">Ready to Grow?</h3>
        <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
          Add your first task above and let AI help you achieve your goals! 
          Start small and build momentum with every completed task.
        </p>
        <div className="mt-6 flex justify-center space-x-4 text-sm text-gray-400">
          <span className="flex items-center space-x-1">
            <span>📊</span>
            <span>Smart Insights</span>
          </span>
          <span className="flex items-center space-x-1">
            <span>🎯</span>
            <span>Progress Tracking</span>
          </span>
          <span className="flex items-center space-x-1">
            <span>🏆</span>
            <span>Achievement Unlocks</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
          <span>📋</span>
          <span>Your Tasks</span>
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({completedCount}/{totalTasks} completed)
          </span>
        </h2>
        {totalTasks > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="progress-bar h-full"
                style={{ width: `${(completedCount / totalTasks) * 100}%` }}
              />
            </div>
            <span className="font-medium">{Math.round((completedCount / totalTasks) * 100)}%</span>
          </div>
        )}
      </div>
      
      {sortedTasks.map((task, index) => (
        <div
          key={task.id}
          className={`task-card ${task.completed ? 'completed' : ''} ${getPriorityColor(task.priority)} hover-lift`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start space-x-4">
            <button
              onClick={() => onToggleTask(task.id)}
              className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                task.completed
                  ? 'bg-success-500 border-success-500 text-white shadow-soft'
                  : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
              }`}
            >
              {task.completed && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getCategoryIcon(task.category)}</span>
                  <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                </div>
                {getPriorityBadge(task.priority)}
              </div>
              
              {task.description && (
                <p className={`text-sm mb-3 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="capitalize bg-gray-100 px-2 py-1 rounded-full font-medium">
                    {task.category}
                  </span>
                  <span>
                    Created {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                  {task.completedAt && (
                    <span className="text-success-600 font-medium">
                      ✅ Completed {new Date(task.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              {task.aiInsight && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">💡</span>
                    <p className="text-sm text-blue-800 font-medium leading-relaxed">
                      {task.aiInsight}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}