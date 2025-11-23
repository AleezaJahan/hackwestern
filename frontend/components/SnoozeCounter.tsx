'use client'

import { getSnoozeLevelInfo, getNextThreshold } from '@/lib/utils'

interface SnoozeCounterProps {
  snoozeCount: number
  alarmTime?: Date | string
}

export default function SnoozeCounter({ snoozeCount, alarmTime }: SnoozeCounterProps) {
  const levelInfo = getSnoozeLevelInfo(snoozeCount)
  const nextThreshold = getNextThreshold(snoozeCount)

  return (
    <div className="w-full space-y-4">
      {/* Main Counter */}
      <div className={`text-center p-8 rounded-lg ${levelInfo.bgColor} border-4 border-current`}>
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-6xl">{levelInfo.emoji}</span>
          <div>
            <div className="text-7xl font-bold" style={{ color: 'currentColor' }}>
              {snoozeCount}
            </div>
            <div className="text-xl font-semibold uppercase tracking-wider">
              {levelInfo.level}
            </div>
          </div>
        </div>
        <p className="text-lg font-medium opacity-90">{levelInfo.message}</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Escalation Level</span>
          <span>{snoozeCount}/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              snoozeCount <= 2
                ? 'bg-green-500'
                : snoozeCount <= 4
                ? 'bg-yellow-500'
                : snoozeCount <= 6
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((snoozeCount / 10) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Next Threshold */}
      {nextThreshold && (
        <div className="bg-white/80 rounded-lg p-4 border-2 border-dashed border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Next Escalation</p>
              <p className="text-xs text-gray-600 mt-1">{nextThreshold.message}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {nextThreshold.snoozesUntil}
              </div>
              <p className="text-xs text-gray-600">snoozes left</p>
            </div>
          </div>
        </div>
      )}

      {/* Escalation Timeline */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Escalation Timeline</p>
        <div className="space-y-1">
          {[
            { threshold: 3, label: 'Text to Crush', icon: '💕' },
            { threshold: 5, label: 'Twitter Post with Photo', icon: '📸' },
          ].map(({ threshold, label, icon }) => (
            <div
              key={threshold}
              className={`flex items-center justify-between p-2 rounded ${
                snoozeCount >= threshold
                  ? 'bg-red-100 text-red-700 font-semibold'
                  : snoozeCount >= threshold - 1
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span>
                <span className="mr-2">{icon}</span>
                {label}
              </span>
              <span className="text-sm">
                {snoozeCount >= threshold ? '✓ Triggered' : `At ${threshold} snoozes`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

