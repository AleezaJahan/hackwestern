'use client'

import { getSnoozeLevelInfo } from '@/lib/utils'

interface RoastDisplayProps {
  roast?: string
  snoozeCount: number
  analysis?: {
    legitimacy_score?: number
    analysis?: string
    recommended_intensity?: string
  }
}

export default function RoastDisplay({ roast, snoozeCount, analysis }: RoastDisplayProps) {
  const levelInfo = getSnoozeLevelInfo(snoozeCount)

  if (!roast) {
    return null
  }

  return (
    <div className={`w-full p-6 rounded-lg ${levelInfo.bgColor} border-2 border-current ${levelInfo.color} shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{levelInfo.emoji}</span>
          <div>
            <h3 className="font-bold text-lg">{levelInfo.level} Roast</h3>
            <p className="text-sm opacity-80">{levelInfo.message}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold">{snoozeCount}</span>
          <p className="text-xs opacity-80">snoozes</p>
        </div>
      </div>

      <div className="bg-white/50 rounded-lg p-4 mb-4">
        <p className="text-gray-800 font-medium italic text-lg">{roast}</p>
      </div>

      {analysis && (
        <div className="mt-4 space-y-2 text-sm">
          {analysis.legitimacy_score !== undefined && (
            <div className="flex items-center justify-between">
              <span className="opacity-80">Legitimacy Score:</span>
              <span className="font-semibold">
                {analysis.legitimacy_score}/100
                {analysis.legitimacy_score < 30 && ' 😏'}
                {analysis.legitimacy_score >= 30 && analysis.legitimacy_score < 70 && ' 😐'}
                {analysis.legitimacy_score >= 70 && ' 🤔'}
              </span>
            </div>
          )}
          {analysis.analysis && (
            <div className="opacity-80 italic">
              <span className="font-semibold">Analysis:</span> {analysis.analysis}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

