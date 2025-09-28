import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Task } from '@/types'

const API_KEY = process.env.GEMINI_API_KEY

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set')
}

const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

export async function POST(request: NextRequest) {
  try {
    const { type, tasks, task, category, userHistory } = await request.json()

    if (type === 'progress') {
      const completedTasks = tasks.filter((t: Task) => t.completed)
      const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

      const prompt = `
        You are Biscuit, a friendly hamster who helps users with personal growth. You're enthusiastic, encouraging, and speak directly to the user like a supportive friend. Never say "the user" or mention that you're an AI.

        Your friend's Progress:
        - Total goals: ${tasks.length}
        - Completed: ${completedTasks.length}
        - Success rate: ${completionRate}%
        - Areas they're working on: ${[...new Set(tasks.slice(0, 10).map((t: Task) => t.category))].join(', ')}

        Give them a personal, encouraging message about their progress. Speak as Biscuit the hamster directly to them. Use "you" and "I" naturally. Be specific about what they're doing well and give friendly suggestions for what they could try next. Keep it conversational and warm, like a friend cheering them on.

        Don't use formal language or structure. Just talk to them like the supportive hamster friend you are!
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return NextResponse.json({
        id: Date.now().toString(),
        type: 'encouragement',
        title: 'Progress Analysis',
        content: text.trim(),
        createdAt: new Date().toISOString(),
        relevantTasks: tasks.slice(0, 3).map((t: Task) => t.id)
      })
    }

    if (type === 'task') {
      const prompt = `
        You are Biscuit, a friendly hamster who helps with personal growth! Your friend just added: "${task.title}" (${task.category}, ${task.priority} priority).

        ${task.description ? `More details: ${task.description}` : ''}

        Their recent goals: ${userHistory.slice(0, 5).map((t: Task) => `- ${t.title} (${t.category})`).join('\n')}

        Give them a warm, encouraging response as Biscuit! Talk directly to them like their supportive hamster friend. Share why you're excited about this goal, give them a practical tip to help them succeed, and show how it connects to their other goals.

        Be conversational and enthusiastic - no formal structure or AI language. Just be their cheerful hamster buddy who believes in them! Use "you" and "I" naturally.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return NextResponse.json({
        id: Date.now().toString(),
        type: 'suggestion',
        title: 'Task Added Successfully',
        content: text.trim(),
        category: task.category,
        createdAt: new Date().toISOString(),
        relevantTasks: [task.id]
      })
    }

    if (type === 'suggestions') {
      const prompt = `
        You are a personal growth AI assistant. Based on the user's interest in ${category} and their task history, suggest 3 specific, actionable tasks they could add.

        User's recent ${category} tasks: ${userHistory.filter((t: Task) => t.category === category).slice(0, 5).map((t: Task) => `- ${t.title}`).join('\n')}

        Provide 3 specific, actionable task suggestions for ${category} that would help them grow and achieve their goals.
        Make them practical and achievable.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the response to extract individual suggestions
      const suggestions = text.split('\n')
        .filter(line => line.trim() && (line.includes('-') || line.includes('•') || line.includes('1.') || line.includes('2.') || line.includes('3.')))
        .map(line => line.replace(/^[-•\d.\s]+/, '').trim())
        .filter(s => s.length > 0)
        .slice(0, 3)

      return NextResponse.json({ suggestions })
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
  } catch (error) {
    console.error('AI API Error:', error)
    return NextResponse.json({ error: 'Failed to generate AI insight' }, { status: 500 })
  }
}
