'use client'

import { useState, useEffect } from 'react'
import { Task, Goal, AIInsight } from '@/types'
import TaskList from '@/components/TaskList'
import TaskForm from '@/components/TaskForm'
import AIInsights from '@/components/AIInsights'
import ProgressDashboard from '@/components/ProgressDashboard'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [activeTab, setActiveTab] = useState<'tasks' | 'goals' | 'insights'>('tasks')

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('hypotrophy-tasks')
    const savedGoals = localStorage.getItem('hypotrophy-goals') 
    const savedInsights = localStorage.getItem('hypotrophy-insights')

    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedGoals) setGoals(JSON.parse(savedGoals))
    if (savedInsights) setInsights(JSON.parse(savedInsights))

    // Generate welcome insight if no data exists
    if (!savedTasks && !savedGoals && !savedInsights) {
      const welcomeInsight: AIInsight = {
        id: 'welcome',
        type: 'encouragement',
        title: 'Welcome to Hypotrophy! 🚀',
        content: 'Start by adding your first task or goal. I\'ll analyze your patterns and provide personalized insights to help you grow. Remember, small consistent actions lead to big transformations!',
        createdAt: new Date()
      }
      setInsights([welcomeInsight])
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('hypotrophy-tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('hypotrophy-goals', JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    localStorage.setItem('hypotrophy-insights', JSON.stringify(insights))
  }, [insights])

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

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold hypotrophy-gradient bg-clip-text text-transparent mb-2">
          Hypotrophy
        </h1>
        <p className="text-gray-600 text-lg">Your AI-Powered Personal Growth Assistant</p>
      </header>

      <ProgressDashboard tasks={tasks} />

      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg p-1 shadow-md">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'tasks' 
                ? 'bg-primary-500 text-white' 
                : 'text-gray-600 hover:text-primary-500'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'goals' 
                ? 'bg-primary-500 text-white' 
                : 'text-gray-600 hover:text-primary-500'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'insights' 
                ? 'bg-primary-500 text-white' 
                : 'text-gray-600 hover:text-primary-500'
            }`}
          >
            AI Insights
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'tasks' && (
            <>
              <TaskForm onAddTask={addTask} />
              <TaskList tasks={tasks} onToggleTask={toggleTask} />
            </>
          )}
          {activeTab === 'goals' && (
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Goals (Coming Soon)</h2>
              <p className="text-gray-600">Goal tracking and management features will be available soon!</p>
            </div>
          )}
          {activeTab === 'insights' && (
            <AIInsights insights={insights} />
          )}
        </div>

        <div className="lg:col-span-1">
          {activeTab !== 'insights' && (
            <AIInsights insights={insights.slice(0, 3)} compact />
          )}
        </div>
      </div>
    </div>
  )
}