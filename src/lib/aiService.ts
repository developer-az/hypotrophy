import { Task, AIInsight } from '@/types'

export class AIService {

  async generateTaskInsight(task: Task, userHistory: Task[]): Promise<AIInsight> {
    try {
      console.log('AI Service: Generating task insight via API')

      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'task',
          task,
          userHistory
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const insight = await response.json()
      console.log('AI Service: Received task insight from API')

      return {
        ...insight,
        createdAt: new Date(insight.createdAt)
      }
    } catch (error) {
      console.error('Error generating AI insight:', error)
      return this.getFallbackInsight(task)
    }
  }

  async generateProgressInsight(tasks: Task[]): Promise<AIInsight> {
    try {
      console.log('AI Service: Generating progress insight via API for', tasks.length, 'tasks')

      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'progress',
          tasks
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const insight = await response.json()
      console.log('AI Service: Received progress insight from API')

      return {
        ...insight,
        createdAt: new Date(insight.createdAt)
      }
    } catch (error) {
      console.error('AI Service: Error generating progress insight:', error)
      console.error('AI Service: Falling back to hardcoded message')
      return this.getFallbackProgressInsight(tasks)
    }
  }

  async generateTaskSuggestions(category: string, userHistory: Task[]): Promise<string[]> {
    try {
      console.log('AI Service: Generating task suggestions via API for category:', category)

      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'suggestions',
          category,
          userHistory
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('AI Service: Received task suggestions from API')

      return data.suggestions.length > 0 ? data.suggestions : this.getFallbackSuggestions(category)
    } catch (error) {
      console.error('Error generating task suggestions:', error)
      return this.getFallbackSuggestions(category)
    }
  }

  private getFallbackInsight(task: Task): AIInsight {
    const insights = [
      `Great choice adding "${task.title}" to your ${task.category} goals! Breaking big objectives into small, actionable tasks is key to success.`,
      `I notice you're focusing on ${task.category}. Consider setting a specific time of day to work on this consistently.`,
      `"${task.title}" is a smart step forward. Once you complete this, I can suggest related tasks to build momentum.`,
      `Adding ${task.priority} priority tasks like "${task.title}" shows good planning. Remember to celebrate small wins!`
    ]

    return {
      id: Date.now().toString(),
      type: 'suggestion',
      title: 'Task Added Successfully',
      content: insights[Math.floor(Math.random() * insights.length)],
      category: task.category,
      createdAt: new Date(),
      relevantTasks: [task.id]
    }
  }

  private getFallbackProgressInsight(tasks: Task[]): AIInsight {
    const completedTasks = tasks.filter(t => t.completed).length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    let content = ''
    if (completionRate >= 80) {
      content = `Amazing progress! You've completed ${completedTasks} out of ${totalTasks} tasks (${completionRate}% completion rate). You're on fire! 🔥 Keep up this momentum and consider taking on more challenging goals.`
    } else if (completionRate >= 60) {
      content = `Great work! You've completed ${completedTasks} out of ${totalTasks} tasks (${completionRate}% completion rate). You're making solid progress. Try breaking down larger tasks into smaller, more manageable steps.`
    } else if (completionRate >= 40) {
      content = `You've completed ${completedTasks} out of ${totalTasks} tasks (${completionRate}% completion rate). Every step counts! Consider focusing on 2-3 high-priority tasks to build momentum.`
    } else {
      content = `You've started ${totalTasks} tasks and completed ${completedTasks} (${completionRate}% completion rate). Remember, progress over perfection! Start with one small task today to build momentum.`
    }

    return {
      id: Date.now().toString(),
      type: 'encouragement',
      title: 'Progress Analysis',
      content,
      createdAt: new Date(),
      relevantTasks: tasks.slice(0, 3).map(t => t.id)
    }
  }

  private getFallbackSuggestions(category: string): string[] {
    const suggestions: Record<string, string[]> = {
      personal: [
        'Spend 10 minutes journaling about your goals',
        'Practice gratitude by listing 3 things you\'re thankful for',
        'Take a 15-minute walk in nature'
      ],
      health: [
        'Drink 8 glasses of water today',
        'Do 20 minutes of stretching or yoga',
        'Get 7-8 hours of quality sleep tonight'
      ],
      career: [
        'Update your LinkedIn profile with recent achievements',
        'Research one new skill relevant to your field',
        'Reach out to a professional contact for networking'
      ],
      learning: [
        'Read for 30 minutes on a topic you\'re curious about',
        'Watch an educational video or tutorial',
        'Practice a new skill for 20 minutes'
      ],
      relationships: [
        'Send a thoughtful message to a friend or family member',
        'Plan a small gathering or coffee date',
        'Practice active listening in your next conversation'
      ],
      finance: [
        'Review your monthly budget and expenses',
        'Set up automatic savings for a specific goal',
        'Research one investment or financial planning topic'
      ],
      creativity: [
        'Spend 30 minutes on a creative hobby',
        'Try a new artistic technique or medium',
        'Share your creative work with others'
      ],
      home: [
        'Organize one small area of your living space',
        'Declutter 10 items you no longer need',
        'Add a small plant or decoration to brighten your space'
      ]
    }

    return suggestions[category] || [
      'Set a specific, achievable goal for today',
      'Break down a larger goal into smaller steps',
      'Reflect on what you learned this week'
    ]
  }
}

export const aiService = new AIService()
