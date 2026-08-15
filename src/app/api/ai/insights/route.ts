import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Task } from '@/types'
import { allowRequest, clientKey } from '@/lib/rateLimit'
import { logger } from '@/lib/logger'

const API_KEY = process.env.GEMINI_API_KEY
const MAX_BODY = 32_768

function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status })
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    apiConfigured: Boolean(API_KEY),
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  const gated = allowRequest(`ai:${clientKey(request.headers)}`)
  if (!gated.ok) {
    return jsonError('rate limited', 429, { retryAfterSec: gated.retryAfterSec })
  }

  if (!API_KEY) {
    logger.warn('ai.unconfigured')
    return jsonError('AI service is not configured', 503)
  }

  const raw = await request.text()
  if (raw.length > MAX_BODY) return jsonError('payload too large', 413)

  let body: Record<string, unknown>
  try {
    body = JSON.parse(raw) as Record<string, unknown>
  } catch {
    return jsonError('invalid json', 400)
  }

  const type = body.type
  if (type !== 'progress' && type !== 'task' && type !== 'suggestions') {
    return jsonError('invalid request type', 400)
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    if (type === 'progress') {
      const tasks = Array.isArray(body.tasks) ? (body.tasks as Task[]) : []
      const completed = tasks.filter((t) => t.completed)
      const prompt = biscuitProgressPrompt(tasks, completed)
      const text = (await model.generateContent(prompt)).response.text()
      logger.info('ai.progress', { n: tasks.length })
      return NextResponse.json({
        id: crypto.randomUUID(),
        type: 'encouragement',
        title: 'Progress analysis',
        content: text.trim(),
        createdAt: new Date().toISOString(),
        relevantTasks: tasks.slice(0, 3).map((t) => t.id),
      })
    }

    if (type === 'task') {
      const task = body.task as Task | undefined
      const userHistory = Array.isArray(body.userHistory) ? (body.userHistory as Task[]) : []
      if (!task?.title) return jsonError('task required', 400)
      const prompt = biscuitTaskPrompt(task, userHistory)
      const text = (await model.generateContent(prompt)).response.text()
      logger.info('ai.task')
      return NextResponse.json({
        id: crypto.randomUUID(),
        type: 'suggestion',
        title: 'On the ledger',
        content: text.trim(),
        category: task.category,
        createdAt: new Date().toISOString(),
        relevantTasks: [task.id],
      })
    }

    const category = typeof body.category === 'string' ? body.category : 'personal'
    const userHistory = Array.isArray(body.userHistory) ? (body.userHistory as Task[]) : []
    const prompt = biscuitSuggestPrompt(category, userHistory)
    const text = (await model.generateContent(prompt)).response.text()
    const suggestions = text
      .split('\n')
      .map((line) => line.replace(/^[-•\d.\s]+/, '').trim())
      .filter((s) => s.length > 8)
      .slice(0, 3)
    return NextResponse.json({ suggestions })
  } catch (error) {
    logger.error('ai.fail', { err: error instanceof Error ? error.message : 'unknown' })
    return jsonError('failed to generate insight', 502)
  }
}

function biscuitProgressPrompt(tasks: Task[], completed: Task[]) {
  const rate = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0
  return `You are Biscuit, a sharp hamster who treats personal growth like a capital allocation problem. Speak directly to the user. Never say "the user" or that you are an AI.

Their book:
- positions: ${tasks.length}
- closed: ${completed.length}
- hit rate: ${rate}%
- domains: ${[...new Set(tasks.slice(0, 12).map((t) => t.category))].join(', ') || 'none'}

Give one tight paragraph: what is compounding, what is leaking, and what to do next. No bullet lists. No corporate wellness voice.`
}

function biscuitTaskPrompt(task: Task, history: Task[]) {
  return `You are Biscuit, a hamster who underwrites human capital. Your friend just booked: "${task.title}" (${task.category}, ${task.priority}).
${task.description ? `Note: ${task.description}` : ''}
Recent book: ${history.slice(0, 6).map((t) => `${t.title} [${t.category}]`).join('; ') || 'empty'}

Reply in 2-4 sentences. Be specific. No AI disclaimers.`
}

function biscuitSuggestPrompt(category: string, history: Task[]) {
  return `Suggest 3 concrete ${category} goals. Recent: ${history
    .filter((t) => t.category === category)
    .slice(0, 5)
    .map((t) => t.title)
    .join('; ') || 'none'}. One line each.`
}
