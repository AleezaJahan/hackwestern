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
      <div className={`text-center p-8 rounded-3xl bg-purple-900/40 backdrop-blur-md border-2 border-purple-300/30 shadow-2xl text-white`}>
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
        <div className="flex justify-between text-sm font-medium text-white/90">
          <span>Escalation Level</span>
          <span>{snoozeCount}/10</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              snoozeCount <= 2
                ? 'bg-purple-400'
                : snoozeCount <= 4
                ? 'bg-purple-500'
                : snoozeCount <= 6
                ? 'bg-purple-600'
                : 'bg-purple-800'
            }`}
            style={{ width: `${Math.min((snoozeCount / 10) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Next Threshold */}
      {nextThreshold && (
        <div className="bg-purple-900/40 backdrop-blur-md rounded-2xl p-4 border-2 border-dashed border-purple-300/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Next Escalation</p>
              <p className="text-xs text-white/70 mt-1">{nextThreshold.message}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-200">
                {nextThreshold.snoozesUntil}
              </div>
              <p className="text-xs text-white/70">snoozes left</p>
            </div>
          </div>
        </div>
      )}

      {/* Escalation Timeline */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-white">Escalation Timeline</p>
        <div className="space-y-1">
          {[
            { threshold: 3, label: 'Text to Crush', icon: '💕' },
            { threshold: 5, label: 'Twitter Post', icon: '🐦' },
          ].map(({ threshold, label, icon }) => (
            <div
              key={threshold}
              className={`flex items-center justify-between p-3 rounded-xl backdrop-blur-sm ${
                snoozeCount >= threshold
                  ? 'bg-red-500/40 text-white font-semibold border border-red-400/50'
                  : snoozeCount >= threshold - 1
                  ? 'bg-yellow-500/40 text-white border border-yellow-400/50'
                  : 'bg-purple-800/30 text-white/70 border border-purple-300/20'
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

