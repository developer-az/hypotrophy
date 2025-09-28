import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Task } from '@/types'

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAr3TOUeP5yQhccvXGnaem5pkH1EJhCVVo'
const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

export async function POST(request: NextRequest) {
  try {
    const { type, tasks, task, category, userHistory } = await request.json()

    if (type === 'progress') {
      const completedTasks = tasks.filter((t: Task) => t.completed)
      const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

      const prompt = `
        You are a personal growth AI assistant for Hypotrophy. Analyze the user's progress and provide an encouraging insight.

        User's Progress:
        - Total tasks: ${tasks.length}
        - Completed tasks: ${completedTasks.length}
        - Completion rate: ${completionRate}%
        - Recent categories: ${[...new Set(tasks.slice(0, 10).map((t: Task) => t.category))].join(', ')}

        Provide an encouraging insight about their progress, suggest improvements, and motivate them to continue their growth journey.
        Keep it positive, specific, and actionable.
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
        You are a personal growth AI assistant for Hypotrophy, an AI-powered personal growth app.
        A user just added a new task: "${task.title}" in the ${task.category} category with ${task.priority} priority.

        ${task.description ? `Task description: ${task.description}` : ''}

        Based on this task and the user's previous tasks, provide a helpful, encouraging insight that will motivate them and offer practical advice.

        User's recent tasks: ${userHistory.slice(0, 5).map((t: Task) => `- ${t.title} (${t.category}, ${t.priority})`).join('\n')}

        Please provide:
        1. A motivational insight about this task
        2. Practical advice for completing it
        3. How it fits into their growth journey

        Keep it concise, positive, and actionable. Use emojis sparingly but effectively.
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
