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

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-500'
      case 'medium': return 'border-yellow-500' 
      case 'low': return 'border-green-500'
      default: return 'border-gray-500'
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
      <div className="bg-white rounded-lg p-8 shadow-md text-center">
        <div className="text-6xl mb-4">🌱</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Grow?</h3>
        <p className="text-gray-500">Add your first task above and let AI help you achieve your goals!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
      {sortedTasks.map((task) => (
        <div
          key={task.id}
          className={`task-card ${task.completed ? 'opacity-60' : ''} ${getPriorityColor(task.priority)}`}
        >
          <div className="flex items-start space-x-3">
            <button
              onClick={() => onToggleTask(task.id)}
              className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                task.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-primary-500'
              }`}
            >
              {task.completed && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{getCategoryIcon(task.category)}</span>
                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>

              {task.description && (
                <p className={`text-sm mb-2 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                  {task.category}
                </span>
                <span>
                  {task.completed && task.completedAt 
                    ? `Completed ${new Date(task.completedAt).toLocaleDateString()}`
                    : `Created ${new Date(task.createdAt).toLocaleDateString()}`
                  }
                </span>
              </div>

              {task.aiInsight && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">💡 {task.aiInsight}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}