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
      return this.getFallbackInsight(task, userHistory)
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

  private getFallbackInsight(task: Task, userHistory: Task[]): AIInsight {
    // Analyze user patterns for intelligent suggestions
    const analysis = this.analyzeUserPatterns(userHistory)
    const specificInsight = this.generateSpecificInsight(task, analysis)

    return {
      id: Date.now().toString(),
      type: 'suggestion',
      title: 'Biscuit\'s Thoughts',
      content: specificInsight,
      category: task.category,
      createdAt: new Date(),
      relevantTasks: [task.id]
    }
  }

  private analyzeUserPatterns(tasks: Task[]) {
    const categoryCount = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const completionByCategory = tasks.reduce((acc, task) => {
      if (!acc[task.category]) acc[task.category] = { completed: 0, total: 0 }
      acc[task.category].total++
      if (task.completed) acc[task.category].completed++
      return acc
    }, {} as Record<string, { completed: number, total: number }>)

    const weakAreas = Object.entries(completionByCategory)
      .filter(([_, stats]) => stats.total >= 2 && (stats.completed / stats.total) < 0.6)
      .map(([category, _]) => category)

    const strongAreas = Object.entries(completionByCategory)
      .filter(([_, stats]) => stats.total >= 2 && (stats.completed / stats.total) >= 0.8)
      .map(([category, _]) => category)

    const neglectedAreas = ['personal', 'health', 'career', 'learning', 'relationships', 'finance', 'creativity', 'home']
      .filter(area => !categoryCount[area] || categoryCount[area] < 2)

    return { categoryCount, completionByCategory, weakAreas, strongAreas, neglectedAreas }
  }

  private generateSpecificInsight(task: Task, analysis: any): string {
    const { weakAreas, strongAreas, neglectedAreas, categoryCount } = analysis

    // Specific insights based on task category and user patterns
    if (task.category === 'health' && categoryCount.health >= 3) {
      return `I see you're building a strong health foundation with "${task.title}"! Since you're consistent with health tasks, have you considered tracking sleep quality or stress levels? These often impact everything else you're working on.`
    }

    if (task.category === 'career' && strongAreas.includes('learning')) {
      return `Excellent! "${task.title}" builds on your learning momentum. Since you're crushing your learning goals, this career focus will compound those gains. Consider connecting with someone in your industry who's already where you want to be.`
    }

    if (strongAreas.includes(task.category)) {
      const nextLevel = this.suggestIntensification(task.category)
      return `"${task.title}" is perfect! You're excelling in ${task.category}. ${nextLevel} What's one way you could challenge yourself more in this area?`
    }

    if (weakAreas.includes(task.category)) {
      return `I notice "${task.title}" is in an area where you've had some challenges before. That's exactly where growth happens! What's the smallest version of this task you could commit to daily? Consistency beats intensity here.`
    }

    if (neglectedAreas.length > 0 && !neglectedAreas.includes(task.category)) {
      const neglectedArea = neglectedAreas[0]
      return `Great work on "${task.title}"! I've noticed you haven't explored ${neglectedArea} much yet. Once you nail this current task, how do you think ${this.getCategoryConnection(task.category, neglectedArea)}?`
    }

    // Default pattern-based insight
    return `"${task.title}" is a smart addition! Based on your patterns, you seem to thrive when you ${this.getPersonalizedTip(task.category)}. What's one small change that could make this even more effective?`
  }

  private suggestIntensification(category: string): string {
    const intensifications: Record<string, string> = {
      health: "Since you're consistent with health habits, consider adding a weekly fitness challenge or experimenting with new nutritious recipes.",
      career: "Your career focus is paying off! Time to set bigger professional goals - maybe a skill that could lead to promotion or a side project.",
      learning: "You're a learning machine! Consider teaching someone else what you've learned or applying your knowledge to solve a real problem.",
      personal: "Your self-development is strong. Perhaps it's time to set a more ambitious personal challenge or help others with their growth.",
      relationships: "You value connections! Maybe organize regular meetups or take on a mentorship role.",
      finance: "Your financial discipline is impressive. Consider increasing your savings rate or exploring new investment opportunities.",
      creativity: "Your creative energy is flowing! Time to share your work publicly or collaborate with other creatives.",
      home: "Your living space improvements are great! Consider how your environment could better support your other goals."
    }
    return intensifications[category] || "You're building great momentum in this area!"
  }

  private getCategoryConnection(currentCategory: string, neglectedCategory: string): string {
    const connections: Record<string, Record<string, string>> = {
      health: {
        career: "improved energy and focus could boost your career performance",
        relationships: "feeling healthier might give you more energy for meaningful connections",
        finance: "healthcare costs are part of financial planning too"
      },
      career: {
        health: "career stress affects your wellbeing - what about stress management",
        relationships: "professional networking is relationship-building",
        finance: "career growth directly impacts your financial goals"
      },
      learning: {
        career: "new skills could accelerate your professional growth",
        creativity: "learning often sparks creative ideas",
        relationships: "shared learning experiences build deeper connections"
      }
    }

    return connections[currentCategory]?.[neglectedCategory] ||
           `your ${currentCategory} progress might naturally extend into ${neglectedCategory}`
  }

  private getPersonalizedTip(category: string): string {
    const tips: Record<string, string> = {
      health: "focus on building sustainable daily routines rather than intense bursts",
      career: "break professional goals into specific, measurable milestones",
      learning: "apply new knowledge immediately to real situations",
      personal: "connect personal growth to your deeper values and purpose",
      relationships: "prioritize quality time and meaningful conversations",
      finance: "automate good financial habits to reduce decision fatigue",
      creativity: "set aside regular creative time without pressure for perfection",
      home: "create spaces that support your other life goals"
    }
    return tips[category] || "focus on consistency over perfection"
  }

  private getFallbackProgressInsight(tasks: Task[]): AIInsight {
    const analysis = this.analyzeUserPatterns(tasks)
    const progressAnalysis = this.generateIntelligentProgressInsight(tasks, analysis)

    return {
      id: Date.now().toString(),
      type: 'analysis',
      title: 'What I\'ve Noticed About Your Progress',
      content: progressAnalysis,
      createdAt: new Date(),
      relevantTasks: tasks.slice(0, 3).map(t => t.id)
    }
  }

  private generateIntelligentProgressInsight(tasks: Task[], analysis: any): string {
    const { strongAreas, weakAreas, neglectedAreas, categoryCount, completionByCategory } = analysis
    const completedTasks = tasks.filter(t => t.completed).length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Identify the most interesting pattern to highlight
    if (strongAreas.length > 0 && neglectedAreas.length > 0) {
      const strongArea = strongAreas[0]
      const neglectedArea = neglectedAreas[0]
      return `🔍 Pattern Alert! You're absolutely crushing it in ${strongArea} (${Math.round((completionByCategory[strongArea]?.completed || 0) / (completionByCategory[strongArea]?.total || 1) * 100)}% completion rate), but I haven't seen much focus on ${neglectedArea} yet. Here's what's fascinating: your success in ${strongArea} has probably built skills that could accelerate your ${neglectedArea} goals. What if your next task connected these areas? For example, ${this.suggestCrossAreaConnection(strongArea, neglectedArea)}`
    }

    if (weakAreas.length > 0) {
      const weakArea = weakAreas[0]
      const completionInWeak = Math.round((completionByCategory[weakArea]?.completed || 0) / (completionByCategory[weakArea]?.total || 1) * 100)
      return `💡 Growth Opportunity Detected! I notice ${weakArea} tasks have a ${completionInWeak}% completion rate - this is actually where your biggest breakthroughs are waiting! The resistance you feel here often points to the most important growth. What's the smallest possible ${weakArea} task you could commit to daily? Success here could unlock progress everywhere else.`
    }

    if (strongAreas.length >= 2) {
      return `🚀 You're building incredible momentum across multiple areas: ${strongAreas.join(' and ')}! This cross-category success suggests you're developing meta-skills like consistency and follow-through. Time to level up: What's one ambitious goal that would combine your strengths in these areas? You're ready for something bigger!`
    }

    if (neglectedAreas.length >= 6) {
      return `🎯 I see you're focused and intentional - you've chosen specific areas to work on rather than spreading thin. That's smart! Your ${completionRate}% completion rate shows good follow-through. As you build confidence here, consider which neglected area might naturally support your current goals. Quality over quantity always wins.`
    }

    // Default intelligent insight
    const topCategory = Object.entries(categoryCount).sort(([,a], [,b]) => (b as number) - (a as number))[0]
    if (topCategory) {
      const [category, count] = topCategory
      return `📊 Your focus on ${category} is clear (${count} tasks created). ${this.getCompletionEncouragement(completionRate)} Based on this pattern, I'm curious: what drew you to prioritize ${category}? Understanding your 'why' here could help us identify what other areas might deserve attention next.`
    }

    return `🌱 You've taken ${totalTasks} steps toward growth and completed ${completedTasks} (${completionRate}%). Every single task matters because you're building the most important skill: the ability to follow through on commitments to yourself. What pattern do you notice in the tasks you complete vs. the ones you don't?`
  }

  private suggestCrossAreaConnection(strongArea: string, neglectedArea: string): string {
    const connections: Record<string, Record<string, string>> = {
      health: {
        career: "using your morning workout routine to also listen to industry podcasts",
        finance: "meal prepping to save money while eating healthier",
        relationships: "inviting friends to join your fitness activities"
      },
      career: {
        health: "using professional development time to learn about stress management",
        creativity: "applying creative problem-solving to work challenges",
        relationships: "building professional networks that become genuine friendships"
      },
      learning: {
        career: "teaching others what you've learned to build your professional reputation",
        creativity: "using new knowledge as inspiration for creative projects",
        home: "applying learning principles to organize your living space more effectively"
      }
    }

    return connections[strongArea]?.[neglectedArea] ||
           `applying your ${strongArea} discipline to start small ${neglectedArea} habits`
  }

  private getCompletionEncouragement(rate: number): string {
    if (rate >= 80) return "Your 80%+ completion rate is exceptional - you've mastered the art of follow-through!"
    if (rate >= 60) return "Your 60%+ completion rate shows real consistency - you're building unstoppable momentum!"
    if (rate >= 40) return "Your completion rate shows you're learning what works for you - that self-awareness is invaluable!"
    return "Every task you complete is proof that you can trust yourself with commitments - that's the foundation of all growth!"
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
