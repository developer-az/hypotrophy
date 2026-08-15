import { Task, AIInsight } from '@/types'
import type { Goal } from '@/engine'

function goalsToTasks(goals: Goal[]): Task[] {
  return goals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    completed: g.status === 'completed',
    category: g.domain,
    priority: g.priority,
    createdAt: new Date(g.createdAt),
    completedAt: g.completedAt ? new Date(g.completedAt) : undefined,
  }))
}

export class AIService {
  async generateTaskInsight(goal: Goal, history: Goal[]): Promise<AIInsight> {
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'task',
          task: goalsToTasks([goal])[0],
          userHistory: goalsToTasks(history).slice(-12),
        }),
      })
      if (!response.ok) throw new Error(`API request failed: ${response.status}`)
      const insight = await response.json()
      return { ...insight, createdAt: new Date(insight.createdAt) }
    } catch {
      return {
        id: crypto.randomUUID(),
        type: 'suggestion',
        title: "Biscuit's read",
        content: `"${goal.title}" is now on the ledger. The allocator will only recommend it once its prerequisites clear — that's a feature, not a nag.`,
        category: goal.domain,
        createdAt: new Date(),
        relevantTasks: [goal.id],
      }
    }
  }

  async generateProgressInsight(goals: Goal[]): Promise<AIInsight> {
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'progress',
          tasks: goalsToTasks(goals),
        }),
      })
      if (!response.ok) throw new Error(`API request failed: ${response.status}`)
      const insight = await response.json()
      return { ...insight, createdAt: new Date(insight.createdAt) }
    } catch {
      const open = goals.filter((g) => g.status === 'open').length
      const done = goals.filter((g) => g.status === 'completed').length
      return {
        id: crypto.randomUUID(),
        type: 'analysis',
        title: 'Progress',
        content: `You've closed ${done} positions and still hold ${open} open. The interesting question isn't volume — it's whether the open set sits on the critical path.`,
        createdAt: new Date(),
        relevantTasks: goals.slice(0, 3).map((g) => g.id),
      }
    }
  }
}

export const aiService = new AIService()
