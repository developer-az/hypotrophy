'use client'

import { useState, useEffect } from 'react'
import { Task, Goal, AIInsight } from '@/types'
import TaskList from '@/components/TaskList'
import TaskForm from '@/components/TaskForm'
import GoalList from '@/components/GoalList'
import GoalForm from '@/components/GoalForm'
import AIInsights from '@/components/AIInsights'
import ProgressDashboard from '@/components/ProgressDashboard'
import BiscuitConversation from '@/components/BiscuitConversation'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { aiService } from '@/lib/aiService'

export default function Home() {
  const [tasks, setTasks, isTasksClient] = useLocalStorage<Task[]>('hypotrophy-tasks', [])
  const [goals, setGoals, isGoalsClient] = useLocalStorage<Goal[]>('hypotrophy-goals', [])
  const [insights, setInsights, isInsightsClient] = useLocalStorage<AIInsight[]>('hypotrophy-insights', [])
  const [activeTab, setActiveTab] = useState<'tasks' | 'goals' | 'insights'>('tasks')
  const [latestInsight, setLatestInsight] = useState<string>('')
  const [isBiscuitTyping, setIsBiscuitTyping] = useState(false)

  // Generate welcome insight if no data exists (client-side only)
  useEffect(() => {
    if (!isInsightsClient) return

    if (tasks.length === 0 && goals.length === 0 && insights.length === 0) {
      const welcomeInsight: AIInsight = {
        id: 'welcome',
        type: 'encouragement',
        title: 'Welcome to Hypotrophy! 🐹',
        content: 'Hi! I\'m Biscuit, and I\'m thrilled you\'re here! Start by adding your first task or goal, and I\'ll be right here to cheer you on, celebrate your wins, and help you stay motivated. Let\'s achieve amazing things together!',
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
    const task = tasks.find(t => t.id === id)
    if (task && !task.completed) {
      // Task is being completed
      const completionMessages = [
        `🎉 Fantastic work completing "${task.title}"! I'm so proud of your progress!`,
        `✨ Way to go! You've just completed "${task.title}". Every small step counts towards your growth!`,
        `🚀 Amazing! "${task.title}" is done! You're building such great momentum!`,
        `💪 Yes! "${task.title}" is complete! I love seeing you crushing your goals!`,
        `🌟 Wonderful! You've finished "${task.title}". Keep up this incredible energy!`
      ]
      const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)]
      setLatestInsight(randomMessage)
    }

    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date() : undefined }
        : task
    ))
  }

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id)
    setTasks(prev => prev.filter(task => task.id !== id))

    // Add a personalized message from Biscuit
    if (taskToDelete) {
      const deleteMessage = `I've removed "${taskToDelete.title}" from your list. Sometimes letting go of tasks is just as important as completing them! 🗑️✨`
      setLatestInsight(deleteMessage)
    }
  }

  const addGoal = (goalData: Omit<Goal, 'id' | 'progress' | 'createdAt' | 'tasks'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      progress: 0,
      createdAt: new Date(),
      tasks: []
    }
    setGoals(prev => [...prev, newGoal])

    // Generate encouraging message from Biscuit
    const goalMessages = [
      `🎯 Amazing! You've set a new goal: "${newGoal.title}". Having clear goals is the first step to achieving them!`,
      `✨ I love your ambition! "${newGoal.title}" is a fantastic goal. Let's break it down and make it happen!`,
      `🚀 Incredible! You're taking charge of your future with "${newGoal.title}". I'm excited to support you on this journey!`,
      `💪 Yes! Setting "${newGoal.title}" as your goal shows real commitment. Every big achievement starts with a clear target!`
    ]
    const randomMessage = goalMessages[Math.floor(Math.random() * goalMessages.length)]
    setLatestInsight(randomMessage)
  }

  const updateGoalProgress = (id: string, progress: number) => {
    setGoals(prev => prev.map(goal =>
      goal.id === id
        ? { ...goal, progress, completedAt: progress >= 100 ? new Date() : undefined }
        : goal
    ))

    const goal = goals.find(g => g.id === id)
    if (goal && progress >= 100) {
      const completionMessage = `🎉🎯 INCREDIBLE! You've completed your goal "${goal.title}"! This is a huge achievement - you should be so proud of yourself! Time to celebrate! 🥳✨`
      setLatestInsight(completionMessage)
    } else if (goal && progress > goal.progress) {
      const progressMessages = [
        `🌟 Great progress on "${goal.title}"! You're at ${progress}% - keep up the momentum!`,
        `💪 Nice work! You've pushed "${goal.title}" to ${progress}%. Every step forward counts!`,
        `🚀 Awesome! "${goal.title}" is now at ${progress}%. You're getting closer to your target!`
      ]
      const randomMessage = progressMessages[Math.floor(Math.random() * progressMessages.length)]
      setLatestInsight(randomMessage)
    }
  }

  const deleteGoal = (id: string) => {
    const goalToDelete = goals.find(g => g.id === id)
    setGoals(prev => prev.filter(goal => goal.id !== id))

    if (goalToDelete) {
      const deleteMessage = `I've removed "${goalToDelete.title}" from your goals. Sometimes priorities change, and that's perfectly okay! 🎯✨`
      setLatestInsight(deleteMessage)
    }
  }

  const toggleGoalComplete = (id: string) => {
    const goal = goals.find(g => g.id === id)
    if (goal) {
      updateGoalProgress(id, 100)
    }
  }

  const generateTaskInsight = async (task: Task) => {
    try {
      const newInsight = await aiService.generateTaskInsight(task, tasks)
      setInsights(prev => [newInsight, ...prev])
      setLatestInsight(newInsight.content)
    } catch (error) {
      console.error('Error generating AI insight:', error)
      // Fallback to a simple insight if AI fails
      const fallbackInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'suggestion',
        title: 'Task Added Successfully',
        content: `Great choice adding "${task.title}" to your ${task.category} goals! Breaking big objectives into small, actionable tasks is key to success. I'm excited to see you tackle this!`,
        category: task.category,
        createdAt: new Date(),
        relevantTasks: [task.id]
      }
      setInsights(prev => [fallbackInsight, ...prev])
      setLatestInsight(fallbackInsight.content)
    }
  }

  const generateProgressInsight = async () => {
    if (tasks.length === 0) return
    if (isBiscuitTyping) return // Don't generate insight if Biscuit is currently typing

    try {
      console.log('Generating progress insight for tasks:', tasks.length)
      const newInsight = await aiService.generateProgressInsight(tasks)
      console.log('Generated insight:', newInsight)
      setInsights(prev => [newInsight, ...prev])
      setLatestInsight(newInsight.content)
    } catch (error) {
      console.error('Error generating progress insight:', error)
      // Add fallback insight if AI fails
      const completedCount = tasks.filter(t => t.completed).length
      const totalCount = tasks.length
      const progressPercentage = Math.round((completedCount / totalCount) * 100)

      let motivationalMessage = ''
      if (progressPercentage >= 80) {
        motivationalMessage = `🎉 Wow! You've completed ${completedCount} out of ${totalCount} tasks (${progressPercentage}%)! You're absolutely crushing it! I'm so proud of your dedication and progress!`
      } else if (progressPercentage >= 50) {
        motivationalMessage = `💪 Great progress! You've completed ${completedCount} out of ${totalCount} tasks (${progressPercentage}%). You're over halfway there - keep up this amazing momentum!`
      } else if (progressPercentage >= 25) {
        motivationalMessage = `🌱 You've completed ${completedCount} out of ${totalCount} tasks (${progressPercentage}%). Every step counts! You're building great habits and making real progress!`
      } else {
        motivationalMessage = `✨ You've got ${totalCount} tasks to work with! Remember, every journey starts with a single step. I believe in you - let's tackle these goals together!`
      }

      const fallbackInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'encouragement',
        title: 'Progress Analysis',
        content: motivationalMessage,
        createdAt: new Date(),
        relevantTasks: tasks.slice(0, 3).map(t => t.id)
      }
      setInsights(prev => [fallbackInsight, ...prev])
      setLatestInsight(motivationalMessage)
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
          <div className="flex items-center justify-center space-x-4 mb-4">
            <img
              src="/biscuit.png"
              alt="Biscuit the Hamster"
              className="w-16 h-16 rounded-full border-4 border-primary-200 animate-float"
            />
            <h1 className="text-6xl font-black hypotrophy-gradient tracking-tight">
              Hypotrophy
            </h1>
          </div>
          <p className="text-xl text-neutral-600 font-medium mb-2">
            Meet Biscuit 🐹 - Your AI-Powered Personal Growth Assistant
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
        </div>
      </header>

      <ProgressDashboard tasks={tasks} onGenerateInsight={generateProgressInsight} isAnalyzing={isBiscuitTyping} />

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
              <span>🐹</span>
              <span>Biscuit's Insights</span>
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
                <TaskList tasks={tasks} onToggleTask={toggleTask} onDeleteTask={deleteTask} />
              </div>
            </>
          )}
          {activeTab === 'goals' && (
            <>
              <div className="animate-slide-up">
                <GoalForm onAddGoal={addGoal} />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <GoalList
                  goals={goals}
                  onUpdateProgress={updateGoalProgress}
                  onDeleteGoal={deleteGoal}
                  onToggleComplete={toggleGoalComplete}
                />
              </div>
            </>
          )}
          {activeTab === 'insights' && (
            <div className="animate-fade-in">
              <AIInsights insights={insights} />
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <BiscuitConversation
              aiResponse={latestInsight}
              onResponseComplete={() => setLatestInsight('')}
              onTypingStart={() => setIsBiscuitTyping(true)}
              onTypingEnd={() => setIsBiscuitTyping(false)}
            />
          </div>
          {activeTab !== 'insights' && (
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <AIInsights insights={insights.slice(0, 2)} compact />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
