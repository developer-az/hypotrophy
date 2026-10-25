import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Task } from '@/types'

const API_KEY = process.env.GEMINI_API_KEY
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const BISCUIT_MODEL = 'gemini-2.5-flash'
const BISCUIT_LENGTH_HINT =
  'Keep your reply to at most 3 short sentences (about 60 words total). No markdown, no bullet lists, no sign-off.'

const biscuitModel = () => {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  const genAI = new GoogleGenerativeAI(API_KEY)
  return genAI.getGenerativeModel({
    model: BISCUIT_MODEL,
    generationConfig: {
      maxOutputTokens: 180,
      temperature: 0.85,
    },
  })
}

function trimBiscuitReply(text: string): string {
  const normalized = text.trim().replace(/\s+/g, ' ')
  const maxChars = 420
  if (normalized.length <= maxChars) {
    return normalized
  }
  const cut = normalized.slice(0, maxChars)
  const lastSentence = cut.lastIndexOf('. ')
  if (lastSentence > maxChars * 0.5) {
    return `${cut.slice(0, lastSentence + 1).trim()}`
  }
  return `${cut.trim()}…`
}

// Health check endpoint (minimal in production — no key metadata)
export async function GET() {
  try {
    const hasApiKey = Boolean(API_KEY)

    if (IS_PRODUCTION) {
      return NextResponse.json({
        status: 'ok',
        apiConfigured: hasApiKey,
      })
    }

    const envKeys = Object.keys(process.env).filter(key => key.includes('GEMINI')).length

    return NextResponse.json({
      status: 'ok',
      apiConfigured: hasApiKey,
      envKeysFound: envKeys,
      keyLength: API_KEY ? API_KEY.length : 0,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      console.error('GEMINI_API_KEY environment variable is not set')

      return NextResponse.json(
        { error: 'AI service not configured.' },
        { status: 503 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { type, tasks, task, category, userHistory } = body as {
      type?: string
      tasks?: Task[]
      task?: Task
      category?: string
      userHistory?: Task[]
    }

    const model = biscuitModel()

    if (type === 'progress') {
      if (!Array.isArray(tasks)) {
        return NextResponse.json({ error: 'tasks array required' }, { status: 400 })
      }

      const completedTasks = tasks.filter((t: Task) => t.completed)
      const completionRate =
        tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

      const prompt = `
        You are Biscuit, a friendly hamster who helps users with personal growth. You're enthusiastic, encouraging, and speak directly to the user like a supportive friend. Never say "the user" or mention that you're an AI.

        Your friend's Progress:
        - Total goals: ${tasks.length}
        - Completed: ${completedTasks.length}
        - Success rate: ${completionRate}%
        - Areas they're working on: ${[...new Set(tasks.slice(0, 10).map((t: Task) => t.category))].join(', ')}

        Give them a personal, encouraging message about their progress. Speak as Biscuit the hamster directly to them. Use "you" and "I" naturally. Be specific about what they're doing well and give friendly suggestions for what they could try next. Keep it conversational and warm, like a friend cheering them on.

        Don't use formal language or structure. Just talk to them like the supportive hamster friend you are!
        ${BISCUIT_LENGTH_HINT}
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = trimBiscuitReply(response.text())

      return NextResponse.json({
        id: Date.now().toString(),
        type: 'encouragement',
        title: 'Progress Analysis',
        content: text,
        createdAt: new Date().toISOString(),
        relevantTasks: tasks.slice(0, 3).map((t: Task) => t.id),
      })
    }

    if (type === 'task') {
      if (!task || typeof task.title !== 'string') {
        return NextResponse.json({ error: 'task with title required' }, { status: 400 })
      }

      const history = Array.isArray(userHistory) ? userHistory : []

      const prompt = `
        You are Biscuit, a friendly hamster who helps with personal growth! Your friend just added: "${task.title}" (${task.category}, ${task.priority} priority).

        ${task.description ? `More details: ${task.description}` : ''}

        Their recent goals: ${history.slice(0, 5).map((t: Task) => `- ${t.title} (${t.category})`).join('\n')}

        Give them a warm, encouraging response as Biscuit! Talk directly to them like their supportive hamster friend. Share why you're excited about this goal, give them one practical tip, and briefly connect it to their other goals if relevant.

        Be conversational and enthusiastic - no formal structure or AI language. Just be their cheerful hamster buddy who believes in them! Use "you" and "I" naturally.
        ${BISCUIT_LENGTH_HINT}
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = trimBiscuitReply(response.text())

      return NextResponse.json({
        id: Date.now().toString(),
        type: 'suggestion',
        title: 'Task Added Successfully',
        content: text,
        category: task.category,
        createdAt: new Date().toISOString(),
        relevantTasks: [task.id],
      })
    }

    if (type === 'suggestions') {
      if (!category || typeof category !== 'string') {
        return NextResponse.json({ error: 'category required' }, { status: 400 })
      }

      const history = Array.isArray(userHistory) ? userHistory : []

      const prompt = `
        You are a personal growth AI assistant. Based on the user's interest in ${category} and their task history, suggest 3 specific, actionable tasks they could add.

        User's recent ${category} tasks: ${history
          .filter((t: Task) => t.category === category)
          .slice(0, 5)
          .map((t: Task) => `- ${t.title}`)
          .join('\n')}

        Provide 3 specific, actionable task suggestions for ${category} that would help them grow and achieve their goals.
        Make them practical and achievable. Use a simple numbered list.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const suggestions = text
        .split('\n')
        .filter(
          line =>
            line.trim() &&
            (line.includes('-') ||
              line.includes('•') ||
              line.includes('1.') ||
              line.includes('2.') ||
              line.includes('3.'))
        )
        .map(line => line.replace(/^[-•\d.\s]+/, '').trim())
        .filter(s => s.length > 0)
        .slice(0, 3)

      return NextResponse.json({ suggestions })
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
  } catch (error) {
    console.error('AI API Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate AI insight',
        ...(IS_PRODUCTION
          ? {}
          : {
              details: error instanceof Error ? error.message : 'Unknown error occurred',
            }),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
