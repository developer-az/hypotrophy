'use client'

import { AIInsight } from '@/types'

interface AIInsightsProps {
  insights: AIInsight[]
  compact?: boolean
}

export default function AIInsights({ insights, compact = false }: AIInsightsProps) {
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'suggestion': return '💡'
      case 'analysis': return '📊'
      case 'encouragement': return '🎉'
      case 'warning': return '⚠️'
      default: return '🤖'
    }
  }

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'suggestion': return 'border-blue-500 bg-blue-50'
      case 'analysis': return 'border-purple-500 bg-purple-50'
      case 'encouragement': return 'border-green-500 bg-green-50'
      case 'warning': return 'border-yellow-500 bg-yellow-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🤖</div>
          <p className="text-gray-500">Complete some tasks to get personalized AI insights!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {compact ? 'Recent Insights' : 'AI Insights'}
      </h2>
      
      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`insight-card border-l-4 ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{getInsightIcon(insight.type)}</span>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  {insight.title}
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  {insight.content}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  {insight.category && (
                    <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                      {insight.category}
                    </span>
                  )}
                  <span>
                    {new Date(insight.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {compact && insights.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            View all insights in the AI Insights tab
          </p>
        </div>
      )}

      {!compact && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">🚀 Coming Soon</h3>
          <p className="text-sm text-gray-700">
            • Integration with Google Gemini API for advanced AI analysis
            <br />
            • Image analysis for habit tracking and progress verification
            <br />
            • Personalized goal recommendations based on your patterns
            <br />
            • Smart scheduling and time optimization suggestions
          </p>
        </div>
      )}
    </div>
  )
}