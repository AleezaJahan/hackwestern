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
      <div className="w-full p-6 bg-red-600 text-white rounded-lg shadow-lg border-4 border-red-800 animate-pulse">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🚨</span>
          <div>
            <h3 className="text-2xl font-bold">NUCLEAR OPTION ENGAGED</h3>
            <p className="text-red-100">Your embarrassing stats have been posted!</p>
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
      <div className="w-full p-6 bg-orange-600 text-white rounded-lg shadow-lg border-4 border-orange-800">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">⚠️</span>
          <div>
            <h3 className="text-2xl font-bold">SOCIAL MEDIA THREAT ACTIVE</h3>
            <p className="text-orange-100">You're in the danger zone!</p>
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
      <div className="w-full p-6 bg-yellow-500 text-yellow-900 rounded-lg shadow-lg border-4 border-yellow-600">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">⏰</span>
          <div>
            <h3 className="text-2xl font-bold">WARNING: Approaching Threshold</h3>
            <p className="text-yellow-800">You're {countdown} {countdown === 1 ? 'snooze' : 'snoozes'} away from escalation!</p>
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
    <div className="w-full p-4 bg-blue-100 border-2 border-blue-300 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-2xl">💡</span>
        <p className="text-blue-800">
          You're at {snoozeCount} snoozes. Keep it under control! 😊
        </p>
      </div>
    </div>
  )
}

