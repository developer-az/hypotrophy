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
      case 'suggestion': return 'border-l-blue-500 bg-gradient-to-r from-blue-50/80 to-indigo-50/50'
      case 'analysis': return 'border-l-purple-500 bg-gradient-to-r from-purple-50/80 to-pink-50/50'
      case 'encouragement': return 'border-l-green-500 bg-gradient-to-r from-green-50/80 to-emerald-50/50'
      case 'warning': return 'border-l-yellow-500 bg-gradient-to-r from-yellow-50/80 to-orange-50/50'
      default: return 'border-l-gray-500 bg-gradient-to-r from-gray-50/80 to-slate-50/50'
    }
  }

  if (insights.length === 0) {
    return (
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🤖</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">AI Insights</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-5xl mb-4 animate-bounce-gentle">🧠</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">AI Learning Mode</h3>
          <p className="text-gray-500 leading-relaxed max-w-sm mx-auto">
            Complete some tasks to unlock personalized AI insights and recommendations!
          </p>
          <div className="mt-6 flex justify-center space-x-3 text-xs text-gray-400">
            <span className="flex items-center space-x-1">
              <span>⚡</span>
              <span>Pattern Analysis</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>🎯</span>
              <span>Smart Suggestions</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>📈</span>
              <span>Growth Tips</span>
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🤖</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {compact ? 'Recent Insights' : 'AI Insights'}
            </h2>
            <p className="text-xs text-gray-500">
              {compact ? 'Latest recommendations' : 'Personalized growth recommendations'}
            </p>
          </div>
        </div>
        {!compact && (
          <div className="text-right text-xs text-gray-500">
            <div className="font-medium text-accent-600">{insights.length}</div>
            <div>insights</div>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={insight.id}
            className={`insight-card border-l-4 ${getInsightColor(insight.type)} hover-lift`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-soft">
                <span className="text-lg">{getInsightIcon(insight.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {insight.title}
                </h3>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {insight.content}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    {insight.category && (
                      <span className="capitalize bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full font-medium text-gray-600 border border-gray-200/50">
                        {insight.category}
                      </span>
                    )}
                    <span className="text-gray-500">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                    insight.type === 'analysis' ? 'bg-purple-100 text-purple-700' :
                    insight.type === 'encouragement' ? 'bg-green-100 text-green-700' :
                    insight.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {insight.type}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {compact && insights.length > 0 && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-accent-50 text-accent-700 rounded-full text-sm font-medium hover:bg-accent-100 transition-colors cursor-pointer">
            <span>View all insights</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}

      {!compact && (
        <div className="mt-8 p-6 bg-gradient-to-br from-primary-50/80 to-accent-50/80 backdrop-blur-sm rounded-xl border border-primary-200/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🚀</span>
            </div>
            <h3 className="font-semibold text-gray-800">Coming Soon</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start space-x-2">
              <span className="text-primary-500 mt-0.5">•</span>
              <span>Integration with Google Gemini API for advanced AI analysis</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-accent-500 mt-0.5">•</span>
              <span>Image analysis for habit tracking and progress verification</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-500 mt-0.5">•</span>
              <span>Personalized goal recommendations based on your patterns</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Smart scheduling and time optimization suggestions</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}