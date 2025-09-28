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

  const getPriorityBorderColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-400'
      case 'medium': return 'border-l-yellow-400'
      case 'low': return 'border-l-green-400'
      default: return 'border-l-gray-400'
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
      <div className="premium-card p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg rounded-3xl flex items-center justify-center border border-white/20 animate-pulse-glow">
            <span className="text-5xl animate-float">🌱</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-6">Ready to Grow?</h3>
          <p className="text-xl text-white/80 mb-8 max-w-md mx-auto leading-relaxed">Add your first task above and let AI help you achieve your goals!</p>
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <span className="text-2xl">✨</span>
            <span className="text-white font-semibold">Start your transformation journey</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20">
          <span className="text-white text-xl">📋</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Your Tasks</h2>
          <p className="text-white/70 text-lg">{tasks.length} task{tasks.length !== 1 ? 's' : ''} on your journey</p>
        </div>
      </div>
      <div className="space-y-6">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className={`premium-card p-6 relative overflow-hidden border-l-4 transition-all duration-300 ${
              task.completed 
                ? 'opacity-75 border-l-green-400' 
                : getPriorityBorderColor(task.priority)
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`mt-1 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                    task.completed
                      ? 'bg-green-500 border-green-500 text-white shadow-lg'
                      : 'border-white/30 hover:border-white/60 hover:bg-white/10'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-3xl">{getCategoryIcon(task.category)}</span>
                    <h3 className={`text-xl font-semibold ${task.completed ? 'line-through text-white/60' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                      task.priority === 'high' 
                        ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                        : task.priority === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                        : 'bg-green-500/20 text-green-300 border border-green-400/30'
                    }`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>

                  {task.description && (
                    <p className={`text-lg mb-4 ${task.completed ? 'text-white/50' : 'text-white/80'}`}>
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className={`capitalize px-3 py-1 rounded-lg font-medium ${task.completed ? 'bg-white/5 text-white/60' : 'bg-white/10 text-white/80'}`}>
                      {task.category}
                    </span>
                    <span className={`font-medium ${task.completed ? 'text-white/40' : 'text-white/60'}`}>
                      {task.completed && task.completedAt
                        ? `✅ Completed ${new Date(task.completedAt).toLocaleDateString()}`
                        : `📅 Created ${new Date(task.createdAt).toLocaleDateString()}`
                      }
                    </span>
                  </div>

                  {task.aiInsight && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-blue-400/20">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">💡</span>
                        <p className="text-white/90 font-medium">{task.aiInsight}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
