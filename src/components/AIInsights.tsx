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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 ease-out">
        <h2 className="text-xl font-semibold mb-4">Biscuit's Insights</h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🐹</div>
          <p className="text-gray-500">Complete some tasks and goals to get personalized insights from Biscuit!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 ease-out">
      <h2 className="text-xl font-semibold mb-4">
        {compact ? 'Recent Insights' : 'Biscuit\'s Insights'}
      </h2>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 ease-out animate-slide-up p-6 bg-gradient-to-br from-primary-50/50 to-secondary-50/50 border-l-4 border-primary-400 hover:border-secondary-400 ${getInsightColor(insight.type)}`}
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
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center">
            <span className="mr-2">🐹</span>
            About Biscuit's Insights
          </h3>
          <p className="text-sm text-gray-700">
            Biscuit provides personalized encouragement, celebrates your achievements, and offers helpful suggestions based on your progress. Every insight is crafted to keep you motivated on your growth journey!
          </p>
        </div>
      )}
    </div>
  )
}
