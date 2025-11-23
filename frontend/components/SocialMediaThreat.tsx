'use client'

import { useState, useEffect } from 'react'

interface SocialMediaThreatProps {
  snoozeCount: number
  nextThreshold?: number
  snoozesUntil?: number
}

export default function SocialMediaThreat({ snoozeCount, nextThreshold, snoozesUntil }: SocialMediaThreatProps) {
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (!nextThreshold || !snoozesUntil || snoozesUntil <= 0) {
      setCountdown(null)
      return
    }

    // Show countdown when user is 1-2 snoozes away from threshold
    if (snoozesUntil <= 2 && snoozeCount < nextThreshold) {
      setCountdown(snoozesUntil)
    } else {
      setCountdown(null)
    }
  }, [snoozeCount, nextThreshold, snoozesUntil])

  if (snoozeCount < 3) {
    return null
  }

  if (snoozeCount >= 7) {
    return (
      <div className="w-full p-6 bg-purple-600/40 backdrop-blur-md text-white rounded-3xl shadow-2xl border-2 border-purple-400/50 animate-pulse">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🚨</span>
          <div>
            <h3 className="text-2xl font-bold">SOCIAL MEDIA POSTED</h3>
            <p className="text-purple-200">Your embarrassing stats have been posted!</p>
          </div>
        </div>
        <p className="text-lg mt-4">
          You've snoozed {snoozeCount} times. This is now public information. Hope your crush doesn't see this! 💀
        </p>
      </div>
    )
  }

  if (snoozeCount >= 5) {
    return (
      <div className="w-full p-6 bg-purple-500/40 backdrop-blur-md text-white rounded-3xl shadow-2xl border-2 border-purple-400/50">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">⚠️</span>
          <div>
            <h3 className="text-2xl font-bold">SOCIAL MEDIA THREAT ACTIVE</h3>
            <p className="text-purple-200">You're in the danger zone!</p>
          </div>
        </div>
        <p className="text-lg mt-4">
          One more snooze and we're posting your wake-up time to Twitter. This is your final warning! 🐦
        </p>
      </div>
    )
  }

  if (countdown !== null && countdown > 0) {
    return (
      <div className="w-full p-6 bg-purple-700/40 backdrop-blur-md text-white rounded-3xl shadow-2xl border-2 border-purple-400/50">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">⏰</span>
          <div>
            <h3 className="text-2xl font-bold">WARNING: Approaching Threshold</h3>
            <p className="text-purple-200">You're {countdown} {countdown === 1 ? 'snooze' : 'snoozes'} away from escalation!</p>
          </div>
        </div>
        {countdown === 1 && (
          <p className="text-lg mt-4 font-semibold">
            Next snooze will trigger SMS threat! 📱
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full p-4 bg-purple-800/30 backdrop-blur-md border-2 border-purple-300/30 rounded-2xl">
      <div className="flex items-center gap-2">
        <span className="text-2xl">💡</span>
        <p className="text-white">
          You're at {snoozeCount} snoozes. Keep it under control! 😊
        </p>
      </div>
    </div>
  )
}

