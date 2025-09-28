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
      <div className="premium-card p-8 text-center">
        <div className="text-6xl mb-4 animate-float">🌱</div>
        <h3 className="text-2xl font-bold text-neutral-800 mb-4">Ready to Grow?</h3>
        <p className="text-neutral-600 text-lg mb-6">Add your first task above and let AI help you achieve your goals!</p>
        <div className="inline-flex items-center space-x-2 text-primary-600 font-medium">
          <span>✨</span>
          <span>Start your transformation journey</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">📋</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800">Your Tasks</h2>
        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-4">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className={`task-card ${task.completed ? 'task-card-completed' : ''} ${getPriorityColor(task.priority)}`}
          >
            <div className="flex items-start space-x-4">
              <button
                onClick={() => onToggleTask(task.id)}
                className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  task.completed
                    ? 'bg-accent-500 border-accent-500 text-white shadow-glow'
                    : 'border-neutral-300 hover:border-primary-500 hover:shadow-glow'
                }`}
              >
                {task.completed && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                  <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-neutral-500' : 'text-neutral-800'}`}>
                    {task.title}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>

                {task.description && (
                  <p className={`text-sm mb-3 ${task.completed ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize bg-neutral-100 text-neutral-700 px-3 py-1 rounded-lg font-medium">
                    {task.category}
                  </span>
                  <span className="text-neutral-500 font-medium">
                    {task.completed && task.completedAt
                      ? `✅ Completed ${new Date(task.completedAt).toLocaleDateString()}`
                      : `📅 Created ${new Date(task.createdAt).toLocaleDateString()}`
                    }
                  </span>
                </div>

                {task.aiInsight && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
                    <p className="text-sm text-primary-800 font-medium">💡 {task.aiInsight}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
