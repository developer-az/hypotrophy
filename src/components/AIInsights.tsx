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
      <div className="card-luxury hover-lift-luxury text-center animate-fade-in-scale">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-500/20 to-primary-500/20 rounded-full blur-3xl scale-150 animate-pulse-luxury"></div>
          <div className="relative text-8xl animate-float-gentle">🐹</div>
        </div>
        <h2 className="text-3xl font-black text-gradient-luxury mb-6">Biscuit's Insights</h2>
        <p className="text-xl text-neutral-600 font-medium max-w-md mx-auto leading-relaxed">
          Complete some tasks and goals to get personalized insights from Biscuit!
        </p>
      </div>
    )
  }

  return (
    <div className="card-luxury hover-lift-luxury animate-fade-in-scale">
      <div className="flex items-center space-x-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-2xl blur-lg opacity-50"></div>
          <div className="relative w-14 h-14 bg-gradient-to-br from-secondary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-luxury">
            <span className="text-white text-2xl animate-float-gentle">🐹</span>
          </div>
        </div>
        <h2 className="text-3xl font-black text-gradient-luxury">
          {compact ? 'Recent Insights' : 'Biscuit\'s Insights'}
        </h2>
      </div>

      <div className="space-y-6">
        {insights.map((insight, index) => (
          <div
            key={insight.id}
            className={`glass-card hover-lift-gentle animate-slide-up relative overflow-hidden ${getInsightColor(insight.type)}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-500 to-secondary-500 rounded-r-full"></div>
            <div className="flex items-start space-x-4 pl-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-2xl flex items-center justify-center shadow-elegant mt-1">
                <span className="text-xl">{getInsightIcon(insight.type)}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-black text-xl text-neutral-900 mb-3">
                  {insight.title}
                </h3>
                <p className="text-lg text-neutral-700 mb-4 leading-relaxed font-medium">
                  {insight.content}
                </p>
                <div className="flex items-center justify-between">
                  {insight.category && (
                    <span className="glass-card px-4 py-2 rounded-2xl text-sm font-bold text-primary-700 capitalize shadow-soft">
                      {insight.category}
                    </span>
                  )}
                  <span className="text-sm font-medium text-neutral-500">
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
