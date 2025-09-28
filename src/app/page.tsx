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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-12">
          <div className="animate-float">
            <h1 className="text-6xl font-black hypotrophy-gradient mb-4 tracking-tight">
              Hypotrophy
            </h1>
            <p className="text-xl text-neutral-600 font-medium">Your AI-Powered Personal Growth Assistant</p>
          </div>
        </header>
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="text-center mb-12">
        <div className="animate-fade-in">
          <h1 className="text-6xl font-black hypotrophy-gradient mb-4 tracking-tight">
            Hypotrophy
          </h1>
          <p className="text-xl text-neutral-600 font-medium mb-2">Your AI-Powered Personal Growth Assistant</p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
        </div>
      </header>

      <ProgressDashboard tasks={tasks} />

      <div className="flex justify-center mb-8">
        <div className="premium-card p-2 inline-flex">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`nav-tab ${
              activeTab === 'tasks'
                ? 'nav-tab-active'
                : 'nav-tab-inactive'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>📋</span>
              <span>Tasks</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`nav-tab ${
              activeTab === 'goals'
                ? 'nav-tab-active'
                : 'nav-tab-inactive'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>🎯</span>
              <span>Goals</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`nav-tab ${
              activeTab === 'insights'
                ? 'nav-tab-active'
                : 'nav-tab-inactive'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>🤖</span>
              <span>AI Insights</span>
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'tasks' && (
            <>
              <div className="animate-slide-up">
                <TaskForm onAddTask={addTask} />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <TaskList tasks={tasks} onToggleTask={toggleTask} />
              </div>
            </>
          )}
          {activeTab === 'goals' && (
            <div className="premium-card p-8 text-center animate-fade-in">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">Goals (Coming Soon)</h2>
              <p className="text-neutral-600 text-lg">Advanced goal tracking and management features will be available soon!</p>
              <div className="mt-6">
                <div className="inline-flex items-center space-x-2 text-primary-600 font-medium">
                  <span>✨</span>
                  <span>SMART Goals, Milestones & Dependencies</span>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'insights' && (
            <div className="animate-fade-in">
              <AIInsights insights={insights} />
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {activeTab !== 'insights' && (
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <AIInsights insights={insights.slice(0, 3)} compact />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
