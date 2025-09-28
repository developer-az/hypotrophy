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
      <div className="premium-card p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20">
              <span className="text-white text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">AI Insights</h2>
              <p className="text-white/70 text-lg">Your personalized growth insights</p>
            </div>
          </div>
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-3xl flex items-center justify-center border border-white/20">
              <span className="text-4xl animate-bounce-gentle">🤖</span>
            </div>
            <p className="text-xl text-white/80 max-w-md mx-auto leading-relaxed">Complete some tasks to get personalized AI insights!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="premium-card p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20">
            <span className="text-white text-xl">🤖</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {compact ? 'Recent Insights' : 'AI Insights'}
            </h2>
            <p className="text-white/70">Your personalized growth insights</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-blue-400/20">
                  <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {insight.title}
                  </h3>
                  <p className="text-white/80 mb-4 leading-relaxed">
                    {insight.content}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    {insight.category && (
                      <span className="capitalize px-3 py-1 bg-white/10 text-white/80 rounded-lg font-medium">
                        {insight.category}
                      </span>
                    )}
                    <span className="text-white/60 font-medium">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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