'use client'

import { useState, useEffect } from 'react'
import { Task, Goal, AIInsight } from '@/types'
import TaskList from '@/components/TaskList'
import TaskForm from '@/components/TaskForm'
import AIInsights from '@/components/AIInsights'
import ProgressDashboard from '@/components/ProgressDashboard'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { aiService } from '@/lib/aiService'

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

  const generateTaskInsight = async (task: Task) => {
    try {
      const newInsight = await aiService.generateTaskInsight(task, tasks)
      setInsights(prev => [newInsight, ...prev])
    } catch (error) {
      console.error('Error generating AI insight:', error)
      // Fallback to a simple insight if AI fails
      const fallbackInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'suggestion',
        title: 'Task Added Successfully',
        content: `Great choice adding "${task.title}" to your ${task.category} goals! Breaking big objectives into small, actionable tasks is key to success.`,
        category: task.category,
        createdAt: new Date(),
        relevantTasks: [task.id]
      }
      setInsights(prev => [fallbackInsight, ...prev])
    }
  }

  const generateProgressInsight = async () => {
    if (tasks.length === 0) return

    try {
      console.log('Generating progress insight for tasks:', tasks.length)
      const newInsight = await aiService.generateProgressInsight(tasks)
      console.log('Generated insight:', newInsight)
      setInsights(prev => [newInsight, ...prev])
    } catch (error) {
      console.error('Error generating progress insight:', error)
      // Add fallback insight if AI fails
      const fallbackInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'encouragement',
        title: 'Progress Analysis',
        content: `You've completed ${tasks.filter(t => t.completed).length} out of ${tasks.length} tasks. Keep up the great work!`,
        createdAt: new Date(),
        relevantTasks: tasks.slice(0, 3).map(t => t.id)
      }
      setInsights(prev => [fallbackInsight, ...prev])
    }
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

      <ProgressDashboard tasks={tasks} onGenerateInsight={generateProgressInsight} />

      <div className="flex justify-center mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2 inline-flex hover:shadow-xl transition-all duration-300 ease-out hover:scale-105 hover:border-primary-200">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>📋</span>
              <span>Tasks</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
              activeTab === 'goals'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>🎯</span>
              <span>Goals</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
              activeTab === 'insights'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
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
                    <TaskForm onAddTask={addTask} userTasks={tasks} />
                  </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <TaskList tasks={tasks} onToggleTask={toggleTask} />
              </div>
            </>
          )}
          {activeTab === 'goals' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 ease-out hover:scale-105 hover:border-primary-200 p-8 text-center animate-fade-in">
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
