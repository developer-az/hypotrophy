export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  category: string
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  completedAt?: Date
  aiInsight?: string
  deleted?: boolean
  deletedAt?: Date
}


export interface UserProgress {
  totalTasks: number
  completedTasks: number
  streakDays: number
  categories: Record<string, number>
  weeklyProgress: number[]
}

export interface AIInsight {
  id: string
  type: 'suggestion' | 'analysis' | 'encouragement' | 'warning'
  title: string
  content: string
  category?: string
  createdAt: Date
  relevantTasks?: string[]
}
