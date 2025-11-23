'use client'

import { useEffect, useState } from 'react'
import { getTranslations, type LanguageCode } from '@/lib/translations'
import { getSettings } from '@/lib/storage'

interface SleepSession {
  date: string
  hoursSlept: number
  alarmTime: string
  wakeTime: string
  snoozeCount: number
}

interface SleepStats {
  totalSessions: number
  avgHoursSlept: number
  goodSleepDays: number // 8+ hours
  currentStreak: number
  totalSnoozes: number
  avgSnoozes: number
}

// Get sleep stats from localStorage
function getSleepStats(): SleepStats {
  if (typeof window === 'undefined') {
    return {
      totalSessions: 0,
      avgHoursSlept: 0,
      goodSleepDays: 0,
      currentStreak: 0,
      totalSnoozes: 0,
      avgSnoozes: 0,
    }
  }

  try {
    const stored = localStorage.getItem('sleep_sessions')
    if (!stored) {
      return {
        totalSessions: 0,
        avgHoursSlept: 0,
        goodSleepDays: 0,
        currentStreak: 0,
        totalSnoozes: 0,
        avgSnoozes: 0,
      }
    }

    const sessions: SleepSession[] = JSON.parse(stored)
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        avgHoursSlept: 0,
        goodSleepDays: 0,
        currentStreak: 0,
        totalSnoozes: 0,
        avgSnoozes: 0,
      }
    }

    const totalHours = sessions.reduce((sum, s) => sum + s.hoursSlept, 0)
    const avgHoursSlept = totalHours / sessions.length
    const goodSleepDays = sessions.filter(s => s.hoursSlept >= 8).length
    const totalSnoozes = sessions.reduce((sum, s) => sum + s.snoozeCount, 0)
    const avgSnoozes = totalSnoozes / sessions.length

    // Calculate current streak (consecutive days with 8+ hours)
    let streak = 0
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    for (const session of sortedSessions) {
      if (session.hoursSlept >= 8) {
        streak++
      } else {
        break
      }
    }

    return {
      totalSessions: sessions.length,
      avgHoursSlept,
      goodSleepDays,
      currentStreak: streak,
      totalSnoozes,
      avgSnoozes,
    }
  } catch (error) {
    console.error('Error reading sleep stats:', error)
    return {
      totalSessions: 0,
      avgHoursSlept: 0,
      goodSleepDays: 0,
      currentStreak: 0,
      totalSnoozes: 0,
      avgSnoozes: 0,
    }
  }
}

// Circular progress component
function CircularProgress({ 
  value, 
  max, 
  label, 
  unit = '',
  size = 120 
}: { 
  value: number
  max: number
  label: string
  unit?: string
  size?: number
}) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px]">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 120 120"
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
            fill="none"
            className="sm:stroke-[10]"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="url(#purpleGradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 sm:stroke-[10]"
          />
          <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#581c87" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
            {value.toFixed(1)}{unit}
          </div>
          {max > 0 && (
            <div className="text-[10px] sm:text-xs text-white/60">
              / {max}{unit}
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 text-xs sm:text-sm font-medium text-white/90 text-center px-1">
        {label}
      </div>
    </div>
  )
}

export default function SleepStats() {
  // Initialize with safe defaults to avoid hydration mismatch
  const [stats, setStats] = useState<SleepStats>(() => {
    if (typeof window === 'undefined') {
      return {
        totalSessions: 0,
        avgHoursSlept: 0,
        goodSleepDays: 0,
        currentStreak: 0,
        totalSnoozes: 0,
        avgSnoozes: 0,
      }
    }
    return getSleepStats()
  })
  
  // Get translations based on text language
  const textLang = (getSettings().text_language || 'en') as LanguageCode
  const t = getTranslations(textLang)

  useEffect(() => {
    // Update stats when component mounts or when storage changes
    const updateStats = () => {
      setStats(getSleepStats())
    }

    updateStats()
    
    // Listen for storage changes
    window.addEventListener('storage', updateStats)
    
    // Also check periodically (in case of same-window updates)
    const interval = setInterval(updateStats, 2000)

    return () => {
      window.removeEventListener('storage', updateStats)
      clearInterval(interval)
    }
  }, [])

  if (stats.totalSessions === 0) {
    return (
      <div className="mt-8 bg-purple-900/40 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-purple-300/30">
        <h3 className="text-xl font-bold mb-4 text-white text-center">{t.sleepStats}</h3>
        <p className="text-white/70 text-center">
          {t.sleepStatsDescription}
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 bg-purple-900/40 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-purple-300/30">
      <h3 className="text-2xl font-bold mb-6 text-white text-center">{t.sleepStats}</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Average Hours Slept */}
        <CircularProgress
          value={stats.avgHoursSlept}
          max={8}
          label={t.averageHours}
          unit="h"
        />

        {/* Good Sleep Days */}
        <CircularProgress
          value={stats.goodSleepDays}
          max={stats.totalSessions}
          label={t.goodSleepDays}
          unit=""
        />

        {/* Current Streak */}
        <CircularProgress
          value={stats.currentStreak}
          max={7}
          label={t.currentStreak}
          unit=""
        />

        {/* Total Sessions */}
        <CircularProgress
          value={stats.totalSessions}
          max={30}
          label={t.totalSessions}
          unit=""
        />
      </div>

      {/* Additional stats */}
      <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-purple-300">{stats.totalSnoozes}</div>
          <div className="text-sm text-white/70">{t.totalSnoozes}</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-300">{stats.avgSnoozes.toFixed(1)}</div>
          <div className="text-sm text-white/70">{t.averageSnoozes}</div>
        </div>
      </div>
    </div>
  )
}

