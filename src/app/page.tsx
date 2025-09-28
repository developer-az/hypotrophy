'use client'

import { useState, useEffect } from 'react'
import { Task, AIInsight } from '@/types'
import TaskList from '@/components/TaskList'
import TaskForm from '@/components/TaskForm'
import AIInsights from '@/components/AIInsights'
import ProgressDashboard from '@/components/ProgressDashboard'
import BiscuitConversation from '@/components/BiscuitConversation'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { aiService } from '@/lib/aiService'

export default function Home() {
  const [tasks, setTasks, isTasksClient] = useLocalStorage<Task[]>('hypotrophy-tasks', [])
  const [insights, setInsights, isInsightsClient] = useLocalStorage<AIInsight[]>('hypotrophy-insights', [])
  const [activeTab, setActiveTab] = useState<'tasks' | 'insights'>('tasks')
  const [latestInsight, setLatestInsight] = useState<string>('')
  const [isBiscuitTyping, setIsBiscuitTyping] = useState(false)

  // Generate welcome insight if no data exists (client-side only)
  useEffect(() => {
    if (!isInsightsClient) return

    if (tasks.length === 0 && insights.length === 0) {
      const welcomeInsight: AIInsight = {
        id: 'welcome',
        type: 'encouragement',
        title: 'Welcome to Hypotrophy! 🐹',
        content: 'Hi! I\'m Biscuit, and I\'m thrilled you\'re here! Start by adding your first task or goal, and I\'ll be right here to cheer you on, celebrate your wins, and help you stay motivated. Let\'s achieve amazing things together!',
        createdAt: new Date()
      }
      setInsights([welcomeInsight])
    }
  }, [isInsightsClient, tasks.length, insights.length, setInsights])

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
        `🎉 Yes! You just finished "${task.title}"! I'm doing happy hamster dances over here - you're absolutely crushing it!`,
        `✨ Woohoo! "${task.title}" is done! You know what I love about this? Every time you complete something, you're proving to yourself that you can trust your commitments!`,
        `🚀 "${task.title}" - DONE! I can practically see your confidence growing with each goal you complete. You're on fire!`,
        `💪 That's what I'm talking about! "${task.title}" is finished and I'm so proud of you! You're building some serious momentum here!`,
        `🌟 Amazing work on "${task.title}"! You know what this tells me? You're someone who follows through. That's such a powerful quality!`
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
      const deleteMessage = `Got it! I've removed "${taskToDelete.title}" from your goals. You know what? Sometimes clearing out things that aren't serving you is just as important as adding new ones. Your list, your rules! 🗑️✨`
      setLatestInsight(deleteMessage)
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
      // Use the enhanced AI service for better insights
      const fallbackInsight = await aiService.generateTaskInsight(task, tasks)
      // If that fails too, use a simple fallback
      if (!fallbackInsight) {
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
        return
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
  if (!isTasksClient || !isInsightsClient) {
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
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>🎯</span>
              <span>My Goals</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
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
        </div>
      </div>
    </div>
  )
}
