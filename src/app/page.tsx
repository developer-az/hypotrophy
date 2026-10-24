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

  const completedCount = tasks.filter(task => task.completed).length
  const remainingCount = tasks.length - completedCount
  const today = new Intl.DateTimeFormat('en', {
    weekday: 'long', month: 'long', day: 'numeric'
  }).format(new Date())

  return (
    <main className="studio">
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="Hypotrophy home">
          <span className="wordmark-icon">h.</span>
          <span>the good practice</span>
        </a>
        <span className="topbar-note"><span className="status-dot" /> YOUR PRIVATE GROWTH SPACE</span>
      </header>

      <div className="workspace" id="home">
        <section className="page-intro" aria-label="Welcome">
          <div>
            <p className="eyebrow"><span className="eyebrow-rule" /> A LITTLE BETTER, EVERY DAY</p>
            <h1>A life, built <span>by showing up.</span></h1>
            <p className="intro-description">Small promises to yourself. Kept, one at a time.</p>
          </div>
          <div className="today-note"><span className="today-label">YOUR DAY, AT YOUR PACE</span><time>{isTasksClient ? today : 'Take a breath. Begin here.'}</time></div>
        </section>

        <nav className="workspace-nav" aria-label="Your workspace">
          <button aria-current={activeTab === 'tasks' ? 'page' : undefined} className={`nav-tab ${activeTab === 'tasks' ? 'nav-tab-active' : ''}`} onClick={() => setActiveTab('tasks')}>
            <span>01</span> The practice <span className="nav-count">{remainingCount}</span>
          </button>
          <button aria-current={activeTab === 'insights' ? 'page' : undefined} className={`nav-tab ${activeTab === 'insights' ? 'nav-tab-active' : ''}`} onClick={() => setActiveTab('insights')}>
            <span>02</span> Field notes <span className="nav-count">{insights.length}</span>
          </button>
          <span className="nav-caption">A QUIETER KIND OF PROGRESS</span>
        </nav>

        <div className="workspace-grid">
          <section className="main-column" aria-label={activeTab === 'tasks' ? 'Your goals' : 'Your insights'}>
            {activeTab === 'tasks' ? <>
              <TaskForm onAddTask={addTask} userTasks={tasks} />
              <div className="list-heading">
                <div><p className="eyebrow">THOUGHTS BECOME THINGS</p><h2>Your practice<span className="list-count">{isTasksClient ? String(tasks.length).padStart(2, '0') : '—'}</span></h2></div>
                <p className="list-summary">{remainingCount === 0 ? 'Room for something new.' : `${remainingCount} ${remainingCount === 1 ? 'promise' : 'promises'} still in motion`}</p>
              </div>
              <TaskList tasks={tasks} onToggleTask={toggleTask} onDeleteTask={deleteTask} />
            </> : <div className="insights-view"><p className="eyebrow">LOOKING BACK, TO MOVE FORWARD</p><h2>Field notes</h2><AIInsights insights={insights} /></div>}
          </section>

          <aside className="side-column" aria-label="Your progress and companion">
            <div className="side-heading"><p className="eyebrow">THE LONG VIEW</p><span>01 / 03</span></div>
            <ProgressDashboard tasks={tasks} onGenerateInsight={generateProgressInsight} isAnalyzing={isBiscuitTyping} />
            <div className="aside-divider"><span>✳</span> A NOTE FROM A FRIEND <span>✳</span></div>
            <BiscuitConversation aiResponse={latestInsight} onResponseComplete={() => setLatestInsight('')} onTypingStart={() => setIsBiscuitTyping(true)} onTypingEnd={() => setIsBiscuitTyping(false)} />
            <p className="privacy-note"><span>↗</span> Your reflections stay yours. Saved only on this device.</p>
          </aside>
        </div>

        <footer className="page-footer"><span>MADE FOR THE WORK THAT HAPPENS SLOWLY.</span><span>ONE SMALL PROMISE AT A TIME <span className="footer-star">✳</span></span></footer>
      </div>
    </main>
  )
}