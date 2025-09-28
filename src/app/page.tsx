'use client'

import { useState, useEffect } from 'react'
import { Task, Goal, AIInsight } from '@/types'
import TaskList from '@/components/TaskList'
import TaskForm from '@/components/TaskForm'
import AIInsights from '@/components/AIInsights'
import ProgressDashboard from '@/components/ProgressDashboard'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function Home() {
  const [tasks, setTasks, isTasksClient] = useLocalStorage<Task[]>('hypotrophy-tasks', [])
  const [goals, setGoals, isGoalsClient] = useLocalStorage<Goal[]>('hypotrophy-goals', [])
  const [insights, setInsights, isInsightsClient] = useLocalStorage<AIInsight[]>('hypotrophy-insights', [])
  const [activeTab, setActiveTab] = useState<'tasks' | 'goals' | 'insights'>('tasks')

  // Generate welcome insight if no data exists (client-side only)
  useEffect(() => {
    if (!isInsightsClient) return

    if (tasks.length === 0 && goals.length === 0 && insights.length === 0) {
      const welcomeInsight: AIInsight = {
        id: 'welcome',
        type: 'encouragement',
        title: 'Welcome to Hypotrophy! 🚀',
        content: 'Start by adding your first task or goal. I\'ll analyze your patterns and provide personalized insights to help you grow. Remember, small consistent actions lead to big transformations!',
        createdAt: new Date()
      }
      setInsights([welcomeInsight])
    }
  }, [isInsightsClient, tasks.length, goals.length, insights.length, setInsights])

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      completed: false
    }
    setTasks(prev => [...prev, newTask])

    // Generate AI insight for new task
    setTimeout(() => {
      generateTaskInsight(newTask)
    }, 1000)
  }

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date() : undefined }
        : task
    ))
  }

  const generateTaskInsight = (task: Task) => {
    const insights = [
      `Great choice adding "${task.title}" to your ${task.category} goals! Breaking big objectives into small, actionable tasks is key to success.`,
      `I notice you're focusing on ${task.category}. Consider setting a specific time of day to work on this consistently.`,
      `"${task.title}" is a smart step forward. Once you complete this, I can suggest related tasks to build momentum.`,
      `Adding ${task.priority} priority tasks like "${task.title}" shows good planning. Remember to celebrate small wins!`
    ]

    const newInsight: AIInsight = {
      id: Date.now().toString(),
      type: 'suggestion',
      title: 'Task Added Successfully',
      content: insights[Math.floor(Math.random() * insights.length)],
      category: task.category,
      createdAt: new Date(),
      relevantTasks: [task.id]
    }

    setInsights(prev => [newInsight, ...prev])
  }

  // Show loading state during hydration
  if (!isTasksClient || !isGoalsClient || !isInsightsClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="glass-card p-8 max-w-md mx-auto">
            <h1 className="text-4xl font-bold hypotrophy-gradient bg-clip-text text-transparent mb-4">
              Hypotrophy
            </h1>
            <p className="text-gray-600 text-lg mb-6">Your AI-Powered Personal Growth Assistant</p>
            <div className="flex justify-center items-center">
              <div className="loading-spinner h-8 w-8"></div>
            </div>
            <p className="text-gray-500 text-sm mt-4">Loading your growth journey...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Modern header with enhanced typography */}
        <header className="text-center mb-12 animate-fade-in">
          <div className="inline-block">
            <h1 className="text-5xl lg:text-6xl font-bold hypotrophy-gradient bg-clip-text text-transparent mb-4 tracking-tight">
              Hypotrophy
            </h1>
            <div className="h-1 w-24 hypotrophy-gradient rounded-full mx-auto mb-4"></div>
          </div>
          <p className="text-gray-600 text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Your AI-Powered Personal Growth Assistant
          </p>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Transform daily tasks into meaningful growth journeys
          </p>
        </header>

        <div className="mb-8 animate-slide-up">
          <ProgressDashboard tasks={tasks} />
        </div>

        {/* Modern tab navigation */}
        <div className="flex justify-center mb-8 animate-slide-up">
          <div className="glass-card p-2 flex space-x-1">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`tab-button ${
                activeTab === 'tasks' ? 'active' : 'inactive'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>📋</span>
                <span>Tasks</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`tab-button ${
                activeTab === 'goals' ? 'active' : 'inactive'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>🎯</span>
                <span>Goals</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`tab-button ${
                activeTab === 'insights' ? 'active' : 'inactive'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>🤖</span>
                <span>AI Insights</span>
              </span>
            </button>
          </div>
        </div>

        {/* Enhanced grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'tasks' && (
              <>
                <TaskForm onAddTask={addTask} />
                <TaskList tasks={tasks} onToggleTask={toggleTask} />
              </>
            )}
            {activeTab === 'goals' && (
              <div className="glass-card p-8 text-center">
                <div className="text-6xl mb-4 animate-bounce-gentle">🎯</div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Goals (Coming Soon)</h2>
                <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                  Set and track long-term objectives with AI-powered milestone suggestions and progress insights.
                </p>
                <div className="mt-6">
                  <div className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                    🚀 In Development
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'insights' && (
              <AIInsights insights={insights} />
            )}
          </div>

          <div className="lg:col-span-1">
            {activeTab !== 'insights' && (
              <div className="sticky top-8">
                <AIInsights insights={insights.slice(0, 3)} compact />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
