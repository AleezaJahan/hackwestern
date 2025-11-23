'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { triggerAlarm, handleSnooze, notifySocialBackend } from '@/lib/api'
import { getSettings, getUserId, saveAlarmToHistory, getAlarmHistory, removeAlarmFromHistory, clearAlarmHistory, saveSleepSession, type AlarmHistoryItem } from '@/lib/storage'
import { formatTime, formatDateTime, getMinutesUntilAlarm, isAlarmTimePassed, getNextThreshold } from '@/lib/utils'
import AudioPlayer, { AudioPlayerRef } from '@/components/AudioPlayer'
import AlarmSound from '@/components/AlarmSound'
import RoastDisplay from '@/components/RoastDisplay'
import SnoozeCounter from '@/components/SnoozeCounter'
import SocialMediaThreat from '@/components/SocialMediaThreat'
import CrushTextCountdown from '@/components/CrushTextCountdown'
import TwitterThreatCountdown from '@/components/TwitterThreatCountdown'
import SleepStats from '@/components/SleepStats'
import OnboardingPopup from '@/components/OnboardingPopup'
import { toast } from 'react-hot-toast'
import { getTranslations, type LanguageCode } from '@/lib/translations'

// Helper function to convert language code to locale
function getLocaleFromLanguage(lang: LanguageCode): string {
  const localeMap: Record<LanguageCode, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-PT',
    pl: 'pl-PL',
    tr: 'tr-TR',
    ru: 'ru-RU',
    nl: 'nl-NL',
    cs: 'cs-CZ',
    ar: 'ar-SA',
    zh: 'zh-CN',
    ja: 'ja-JP',
    hu: 'hu-HU',
    ko: 'ko-KR',
  }
  return localeMap[lang] || 'en-US'
}

export default function Home() {
  const router = useRouter()
  const [alarmTime, setAlarmTime] = useState<string>('')
  const [snoozeCount, setSnoozeCount] = useState(0)
  const [isAlarmActive, setIsAlarmActive] = useState(false)
  const [currentRoast, setCurrentRoast] = useState<string | undefined>()
  const [currentAnalysis, setCurrentAnalysis] = useState<any>()
  const [audioUrl, setAudioUrl] = useState<string | undefined>()
  const [excuse, setExcuse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [wakeUpTime, setWakeUpTime] = useState<Date | null>(null)
  const [showCrushCountdown, setShowCrushCountdown] = useState(false)
  const [showTwitterCountdown, setShowTwitterCountdown] = useState(false)
  const [crushTextSent, setCrushTextSent] = useState(false)
  const [alarmHistory, setAlarmHistory] = useState<AlarmHistoryItem[]>([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [mounted, setMounted] = useState(false)
  const excuseInputRef = useRef<HTMLInputElement>(null)
  const audioPlayerRef = useRef<AudioPlayerRef>(null)
  const isTriggeringRef = useRef(false) // Prevent multiple simultaneous triggers
  const [settings, setSettings] = useState<ReturnType<typeof getSettings>>(() => {
    // Initialize with empty/default values to avoid hydration mismatch
    if (typeof window === 'undefined') {
      return { user_id: '' }
    }
    return getSettings()
  })
  const [userId, setUserId] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    return getUserId()
  })

  // Load settings and userId on mount (client-side only)
  useEffect(() => {
    setMounted(true)
    setSettings(getSettings())
    setUserId(getUserId())
  }, [])

  // Get translations based on text language
  const textLang = (settings.text_language || 'en') as LanguageCode
  const t = getTranslations(textLang)

  // Refresh settings when window gains focus (e.g., returning from settings page)
  useEffect(() => {
    const handleFocus = () => {
      const freshSettings = getSettings()
      console.log('[DEBUG] Window focused - Refreshing settings. Language:', freshSettings.language || 'en')
      setSettings(freshSettings)
    }
    window.addEventListener('focus', handleFocus)
    
    // Also refresh on visibility change (when tab becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const freshSettings = getSettings()
        console.log('[DEBUG] Tab visible - Refreshing settings. Language:', freshSettings.language || 'en')
        setSettings(freshSettings)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Check if onboarding is needed
  useEffect(() => {
    // Show onboarding if name or gender is missing (first time or after clearing)
    if (!settings.name || !settings.gender) {
      setShowOnboarding(true)
    }
  }, [settings.name, settings.gender])

  // Load alarm history on mount
  useEffect(() => {
    setAlarmHistory(getAlarmHistory())
  }, [])

  // Check if alarm time has passed
  useEffect(() => {
    if (!alarmTime || isAlarmActive) return

    const interval = setInterval(() => {
      // Don't trigger if already triggering or if wakeUpTime is set
      if (isTriggeringRef.current || wakeUpTime) {
        return
      }

      // Parse time and create alarm datetime
      const [hours, minutes] = alarmTime.split(':').map(Number)
      const now = new Date()
      
      // Create alarm time for today at the specified time (set seconds/milliseconds to 0 for clean comparison)
      const alarmToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
      const nowClean = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0)
      
      // If alarm time today is in the past, check for tomorrow
      // Otherwise check for today (like Apple alarms)
      const alarm = alarmToday < nowClean 
        ? new Date(alarmToday.getTime() + 24 * 60 * 60 * 1000) 
        : alarmToday
      
      if (isAlarmTimePassed(alarm) && !wakeUpTime && !isTriggeringRef.current) {
        console.log('⏰ Alarm time passed, triggering...')
        triggerAlarmHandler()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [alarmTime, isAlarmActive, wakeUpTime])

  // Focus excuse input when alarm is active
  useEffect(() => {
    if (isAlarmActive && excuseInputRef.current) {
      excuseInputRef.current.focus()
    }
  }, [isAlarmActive])

  const triggerAlarmHandler = async () => {
    // Prevent multiple simultaneous calls
    if (isTriggeringRef.current) {
      console.log('⚠️ Already triggering alarm, skipping duplicate call')
      return
    }

    // Set flag IMMEDIATELY to prevent duplicates
    isTriggeringRef.current = true
    
    try {
      setIsLoading(true)
      console.log('🚀 Triggering alarm...')
      
      // Convert alarm time to full datetime (like Apple alarms - same day if future, tomorrow if past)
      const [hours, minutes] = alarmTime.split(':').map(Number)
      const now = new Date()
      
      // Create alarm time for today at the specified time (set seconds/milliseconds to 0 for clean comparison)
      const alarmToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
      const nowClean = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0)
      
      // If alarm time today is in the past, set for tomorrow
      // Otherwise set for today (like Apple alarms)
      const alarmDate = alarmToday < nowClean 
        ? new Date(alarmToday.getTime() + 24 * 60 * 60 * 1000) 
        : alarmToday
      
      // Refresh settings before making the call to ensure we have the latest language
      const currentSettings = getSettings()
      console.log('[DEBUG] Trigger alarm - Language from settings:', currentSettings.language || 'en')
      
      const response = await triggerAlarm({
        snooze_count: snoozeCount,
        user_id: userId,
        wake_up_time: alarmDate.toISOString(),
        language: currentSettings.language || 'en',
      })
      
      setAudioUrl(response.audio_url)
      setWakeUpTime(alarmDate)
      setIsAlarmActive(true)
      toast.success(`Alarm triggered! ${response.message}`)
      console.log('✅ Alarm triggered successfully')
      // Keep flag true since alarm is active
    } catch (error: any) {
      // Only show ONE error toast
      toast.error(`Failed to trigger alarm: ${error.message}`, { id: 'alarm-error' })
      console.error('❌ Error triggering alarm:', error)
      // Set a dummy wakeUpTime to prevent interval from retrying immediately
      // Reset after 5 seconds to allow manual retry
      setTimeout(() => {
        isTriggeringRef.current = false
      }, 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSnoozeClick = async () => {
    if (!excuse.trim() && snoozeCount > 0) {
      toast.error('Please provide an excuse for snoozing!')
      if (excuseInputRef.current) {
        excuseInputRef.current.focus()
      }
      return
    }

    try {
      setIsLoading(true)
      const newSnoozeCount = snoozeCount + 1
      const now = new Date().toISOString()

      // Call Person 2's backend (AI & Voice)
      // Refresh settings before making the call to ensure we have the latest language
      const currentSettings = getSettings()
      console.log('[DEBUG] Handle snooze - Language from settings:', currentSettings.language || 'en')
      
      const response = await handleSnooze({
        excuse: excuse || 'No excuse given',
        snooze_count: newSnoozeCount,
        user_id: userId,
        transcribed_audio: excuse,
        language: currentSettings.language || 'en',
      })

      setSnoozeCount(newSnoozeCount)
      setCurrentRoast(response.roast)
      setCurrentAnalysis(response.analysis)
      setAudioUrl(response.audio_url)
      setExcuse('')
      
      // For snooze 3, wait for audio to finish before showing countdown
      if (newSnoozeCount === 3 && settings.crush_phone_number) {
        // Don't show countdown yet - wait for audio to finish
        // The AudioPlayer's onEnded callback will trigger the countdown
        toast.error('💕 After this message, texting your crush!', { duration: 3000 })
      } else if (newSnoozeCount === 5 && settings.twitter_handle && settings.enable_social_media_threats !== false) {
        // Show Twitter countdown at snooze 5
        toast.error('🐦 After this message, posting to Twitter!', { duration: 3000 })
        // The Twitter countdown will be triggered after audio finishes
      } else if (newSnoozeCount > 3 && newSnoozeCount !== 5) {
        // Already sent at snooze 3, just notify backend for other actions (no image)
        // Skip snooze 5 as it will be handled by the countdown
        await notifySocialBackend(userId, newSnoozeCount, now, null, settings.crush_phone_number, {
          twitter_handle: settings.twitter_handle,
          phone_number: settings.phone_number,
          enable_social_media_threats: settings.enable_social_media_threats,
          enable_sms_threats: settings.enable_sms_threats,
        })
      }

      // Check if threshold reached
      const nextThreshold = getNextThreshold(newSnoozeCount)
      if (nextThreshold && nextThreshold.snoozesUntil === 0) {
        toast.error(`⚠️ Threshold reached! ${nextThreshold.message}`)
      } else {
        toast.success(`Snoozed! Roast incoming... 😅`)
      }
    } catch (error: any) {
      toast.error(`Failed to process snooze: ${error.message}`)
      console.error('Error handling snooze:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetAlarm = () => {
    if (!alarmTime) {
      toast.error('Please set an alarm time!')
      return
    }

    // Parse time (HH:mm format)
    const [hours, minutes] = alarmTime.split(':').map(Number)
    const now = new Date()
    
    // Create alarm time for today at the specified time (set seconds/milliseconds to 0 for clean comparison)
    const alarmToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
    const nowClean = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0)
    
    // Compare: if alarm time today is in the past, set for tomorrow
    // Otherwise set for today (like Apple alarms)
    const alarm = alarmToday < nowClean 
      ? new Date(alarmToday.getTime() + 24 * 60 * 60 * 1000) 
      : alarmToday

    // Save alarm time to history (HH:mm format)
    saveAlarmToHistory(alarmTime)
    setAlarmHistory(getAlarmHistory())

    setSnoozeCount(0)
    setIsAlarmActive(false)
    setWakeUpTime(null)
    setCurrentRoast(undefined)
    setCurrentAnalysis(undefined)
    setAudioUrl(undefined)
    
    // Calculate minutes until alarm
    const minutesUntil = Math.round((alarm.getTime() - now.getTime()) / (1000 * 60))
    toast.success(`Alarm set for ${alarmTime} (${minutesUntil} minutes)`)
  }

  const handleReuseAlarm = (time: string) => {
    // Set alarm time (just the time string in HH:mm format)
    setAlarmTime(time)
    
    // Calculate the actual alarm datetime (like Apple alarms - same day if future, tomorrow if past)
    const now = new Date()
    const [hours, minutes] = time.split(':').map(Number)
    
    // Create alarm time for today at the specified time (set seconds/milliseconds to 0 for clean comparison)
    const alarmToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
    const nowClean = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0)
    
    // If alarm time today is in the past, set for tomorrow
    // Otherwise set for today (like Apple alarms)
    const alarmDate = alarmToday < nowClean 
      ? new Date(alarmToday.getTime() + 24 * 60 * 60 * 1000) 
      : alarmToday
    
    // Calculate minutes until alarm
    const minutesUntil = Math.round((alarmDate.getTime() - now.getTime()) / (1000 * 60))
    toast.success(`Alarm set for ${time} (${minutesUntil} minutes)`)
  }

  const handleRemoveAlarm = (alarmId: string) => {
    removeAlarmFromHistory(alarmId)
    setAlarmHistory(getAlarmHistory())
    toast.success('Alarm removed from history')
  }

  const handleClearAllAlarms = () => {
    if (confirm('Are you sure you want to clear all previous alarms?')) {
      clearAlarmHistory()
      setAlarmHistory([])
      toast.success('All previous alarms cleared')
    }
  }

  const handleStopAlarm = () => {
    // Calculate sleep hours if we have alarm time
    if (wakeUpTime) {
      const now = new Date()
      const alarmDate = new Date(wakeUpTime)
      
      // Calculate hours slept (assuming alarm was set for wake-up time)
      // For simplicity, we'll estimate based on typical sleep patterns
      // If alarm was set for today and it's past that time, calculate from alarm time
      // Otherwise, estimate 8 hours (user woke up on time)
      let hoursSlept = 8 // Default estimate
      
      if (alarmDate <= now) {
        // Alarm time has passed, calculate from alarm time to now
        const diffMs = now.getTime() - alarmDate.getTime()
        hoursSlept = diffMs / (1000 * 60 * 60)
        
        // If it's been more than 16 hours, probably slept overnight
        // Estimate based on alarm time (if alarm is early morning, likely slept 7-9 hours)
        if (hoursSlept > 16) {
          const alarmHour = alarmDate.getHours()
          if (alarmHour >= 5 && alarmHour <= 9) {
            // Morning alarm, estimate 7-9 hours
            hoursSlept = 7 + Math.random() * 2
          } else {
            hoursSlept = 8 // Default
          }
        }
      }
      
      // Clamp to reasonable values
      hoursSlept = Math.max(4, Math.min(12, hoursSlept))
      
      // Save sleep session
      saveSleepSession({
        date: alarmDate.toISOString().split('T')[0], // Just the date part
        hoursSlept: Math.round(hoursSlept * 10) / 10, // Round to 1 decimal
        alarmTime: alarmDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        wakeTime: now.toISOString(),
        snoozeCount: snoozeCount,
      })
    }
    
    // Stop alarm sound (AlarmSound component will stop when isActive becomes false)
    setIsAlarmActive(false)
    
    // Stop voice message audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop()
    }
    setAudioUrl(undefined)
    
    // Reset all alarm state to go back to main page
    setWakeUpTime(null)
    setSnoozeCount(0)
    setCurrentRoast(undefined)
    setCurrentAnalysis(undefined)
    setExcuse('')
    setShowCrushCountdown(false) // Reset countdown state
    setCrushTextSent(false) // Reset crush text flag for next alarm
    
    // Reset alarm time so user can set a new one
    setAlarmTime('')
    
    toast.success('Alarm stopped! You can set a new alarm.')
  }

  const nextThreshold = getNextThreshold(snoozeCount)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  // Update current time every second (client-side only)
  useEffect(() => {
    // Set initial time on client
    setCurrentTime(new Date())
    
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Don't render client-specific content until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#1a0a2e] via-[#2d1b3d] to-[#1a0a2e] p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              🌙 Rise & Roast
            </h1>
          </div>
          <div className="bg-purple-900/40 backdrop-blur-md rounded-3xl p-8 border border-purple-300/30 shadow-2xl">
            <div className="text-center space-y-4">
              <div>
                <p className="text-white/70 text-sm mb-2">Current Time</p>
                <h2 className="text-6xl md:text-7xl font-bold text-white mb-2">--:--</h2>
                <p className="text-white/60 text-sm">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a0a2e] via-[#2d1b3d] to-[#1a0a2e] p-4 md:p-8">
        {/* Onboarding Popup */}
        {showOnboarding && (
          <OnboardingPopup
            onComplete={() => {
              setShowOnboarding(false)
              // Reload settings after onboarding
              window.location.reload()
            }}
          />
        )}

        {/* Crush Text Countdown Overlay */}
      <CrushTextCountdown
        isActive={showCrushCountdown}
        crushPhoneNumber={settings.crush_phone_number}
        onCountdownComplete={async () => {
          setShowCrushCountdown(false)
          // Only send if we haven't already sent
          if (!crushTextSent) {
            setCrushTextSent(true)
            // Send the text after countdown
            const now = new Date().toISOString()
            await notifySocialBackend(userId, 3, now, null, settings.crush_phone_number, {
              twitter_handle: settings.twitter_handle,
              phone_number: settings.phone_number,
              enable_social_media_threats: settings.enable_social_media_threats,
              enable_sms_threats: settings.enable_sms_threats,
            })
            toast.error('💕 Text sent to your crush!', { duration: 3000 })
          } else {
            console.log('💕 Crush text already sent, skipping')
          }
        }}
        onCancel={() => {
          // Stop alarm and reset everything to go back to alarm page
          setIsAlarmActive(false)
          
          // Stop voice message audio
          if (audioPlayerRef.current) {
            audioPlayerRef.current.stop()
          }
          setAudioUrl(undefined)
          
          // Reset all alarm state
          setWakeUpTime(null)
          setSnoozeCount(0)
          setCurrentRoast(undefined)
          setCurrentAnalysis(undefined)
          setExcuse('')
          setShowCrushCountdown(false)
          setCrushTextSent(false)
          
          // Reset alarm time so user can set a new one
          setAlarmTime('')
          
          toast.success('Alarm stopped! You can set a new alarm.')
        }}
      />

      {/* Twitter Threat Countdown Overlay */}
      <TwitterThreatCountdown
        isActive={showTwitterCountdown}
        twitterHandle={settings.twitter_handle}
        onCountdownComplete={async () => {
          setShowTwitterCountdown(false)
          // The backend will handle the Twitter post automatically
          // Just notify it that we've reached the threshold
          const now = new Date().toISOString()
          await notifySocialBackend(userId, snoozeCount, now, null, settings.crush_phone_number, {
            twitter_handle: settings.twitter_handle,
            phone_number: settings.phone_number,
            enable_social_media_threats: settings.enable_social_media_threats,
            enable_sms_threats: settings.enable_sms_threats,
          })
        }}
        onCancel={() => {
          // Stop alarm and reset everything to go back to alarm page
          setIsAlarmActive(false)
          
          // Stop voice message audio
          if (audioPlayerRef.current) {
            audioPlayerRef.current.stop()
          }
          setAudioUrl(undefined)
          
          // Reset all alarm state
          setWakeUpTime(null)
          setSnoozeCount(0)
          setCurrentRoast(undefined)
          setCurrentAnalysis(undefined)
          setExcuse('')
          setShowTwitterCountdown(false)
          
          // Reset alarm time so user can set a new one
          setAlarmTime('')
          
          toast.success('Alarm stopped! You can set a new alarm.')
        }}
      />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Settings */}
        <div className="flex flex-col items-center mb-6 md:mb-8 relative">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4">
            {t.appTitle}
          </h1>
          <button
            onClick={() => {
              // Refresh settings before navigating to ensure we have latest values
              setSettings(getSettings())
              router.push('/settings')
            }}
            className="absolute right-0 top-0 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 active:bg-white/40 transition-colors border border-white/30 text-sm sm:text-base min-h-[44px] min-w-[44px]"
          >
            {t.settings}
          </button>
        </div>

        {/* Time Display Card */}
        <div className="bg-purple-900/40 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-purple-300/30 shadow-2xl">
          <div className="text-center space-y-3 sm:space-y-4">
            {/* Current Time */}
            <div>
              <p className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">{t.currentTime}</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-1 sm:mb-2">
                {currentTime ? currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                }) : '--:--'}
              </h2>
              <p className="text-white/60 text-xs sm:text-sm px-2">
                {currentTime ? currentTime.toLocaleDateString(getLocaleFromLanguage(textLang), { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Loading...'}
              </p>
            </div>

            {/* Alarm Time */}
            {alarmTime && !isAlarmActive && (() => {
              // Calculate alarm datetime (like Apple alarms - same day if future, tomorrow if past)
              const [hours, minutes] = alarmTime.split(':').map(Number)
              const now = new Date()
              
              // Create alarm time for today at the specified time (set seconds/milliseconds to 0 for clean comparison)
              const alarmToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
              const nowClean = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0)
              
              // If alarm time today is in the past, set for tomorrow
              // Otherwise set for today (like Apple alarms)
              const alarmDate = alarmToday < nowClean 
                ? new Date(alarmToday.getTime() + 24 * 60 * 60 * 1000) 
                : alarmToday
              
              return (
                <div className="pt-4 sm:pt-6 border-t border-white/20">
                  <p className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">Alarm Set For</p>
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-200 mb-1 sm:mb-2">
                    {alarmTime}
                  </h3>
                  <p className="text-white/60 text-xs sm:text-sm">
                    {getMinutesUntilAlarm(alarmDate.toISOString())} {t.minutesUntilAlarm}
                  </p>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Alarm Time Picker */}
        {!isAlarmActive && !wakeUpTime && (
          <div className="bg-purple-900/40 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 border border-purple-300/30">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">{t.setAlarm}</h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t.alarmTime}
                </label>
                <input
                  type="time"
                  value={alarmTime || ''}
                  onChange={(e) => {
                    setAlarmTime(e.target.value);
                  }}
                  className="w-full px-4 py-3 sm:py-3.5 text-base sm:text-lg border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-900 bg-white/90 backdrop-blur-sm min-h-[44px]"
                />
              </div>
              <button
                onClick={handleSetAlarm}
                disabled={!alarmTime || isLoading}
                className="px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-purple-800 to-indigo-800 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 active:from-purple-900 active:to-indigo-900 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all font-semibold shadow-lg text-base sm:text-lg min-h-[44px]"
              >
                {t.setAlarm}
              </button>
            </div>

            {/* Previous Alarms */}
            {alarmHistory.length > 0 && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">{t.previousAlarms}</h3>
                  <button
                    onClick={handleClearAllAlarms}
                    className="text-xs sm:text-sm text-white/70 hover:text-white active:text-white/80 transition-colors min-h-[44px] px-2"
                  >
                    {t.clear}
                  </button>
                </div>
                <div className="space-y-2">
                  {alarmHistory.map((alarm) => (
                    <div
                      key={alarm.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:bg-white/10 active:bg-white/15 transition-colors"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <span className="text-xl sm:text-2xl flex-shrink-0">⏰</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold text-base sm:text-lg truncate">{alarm.time}</p>
                          <p className="text-white/60 text-xs">
                            {new Date(alarm.date).toLocaleDateString(getLocaleFromLanguage(textLang), { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleReuseAlarm(alarm.time)}
                          className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-800 to-indigo-800 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 active:from-purple-900 active:to-indigo-900 transition-all text-xs sm:text-sm font-medium shadow-md min-h-[44px]"
                        >
                          {t.use}
                        </button>
                        <button
                          onClick={() => handleRemoveAlarm(alarm.id)}
                          className="p-2 text-white/70 hover:text-white active:text-white/90 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Remove alarm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Alarm */}
        {isAlarmActive && (
          <div className="bg-red-500/20 backdrop-blur-md border-4 border-red-400 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 animate-pulse-slow border-white/30">
            {/* Blaring Alarm Sound - plays continuously */}
            <AlarmSound isActive={isAlarmActive} volume={0.6} />
            
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">🔔 WAKE UP! 🔔</h2>
              <p className="text-lg sm:text-xl text-red-200">Your alarm is ringing!</p>
            </div>

            {/* Audio Player - plays voice message */}
            {audioUrl && (
              <div className="mb-6">
                <AudioPlayer 
                  ref={audioPlayerRef} 
                  audioUrl={audioUrl} 
                  autoPlay 
                  onEnded={() => {
                    // After audio finishes, show countdown if it's snooze 3 (crush text)
                    // Only trigger if countdown is not already showing
                    if (snoozeCount === 3 && settings.crush_phone_number && !showCrushCountdown) {
                      console.log('🎯 [Main] Triggering crush countdown at snooze 3')
                      setShowCrushCountdown(true)
                    }
                    // After audio finishes, show countdown if it's snooze 5 (Twitter post)
                    if (snoozeCount === 5 && settings.twitter_handle && settings.enable_social_media_threats !== false && !showTwitterCountdown) {
                      console.log('🎯 [Main] Triggering Twitter countdown at snooze 5')
                      setShowTwitterCountdown(true)
                    }
                  }}
                />
              </div>
            )}

            {/* Excuse Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/90 mb-2">
                Why are you snoozing? (Required)
              </label>
              <input
                ref={excuseInputRef}
                type="text"
                value={excuse}
                onChange={(e) => setExcuse(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSnoozeClick()
                  }
                }}
                placeholder="e.g., Just 5 more minutes..."
                className="w-full px-4 py-3 sm:py-3.5 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-base sm:text-lg text-gray-900 bg-white/90 backdrop-blur-sm min-h-[44px]"
                disabled={isLoading}
              />
            </div>

            {/* Warning before snooze 3 */}
            {snoozeCount === 2 && settings.crush_phone_number && (
              <div className="mb-4 p-3 sm:p-4 bg-purple-500/30 backdrop-blur-sm border-2 border-purple-400 rounded-xl animate-pulse">
                <p className="text-white font-bold text-sm sm:text-base md:text-lg text-center">
                  ⚠️ WARNING: Next snooze will text your crush! 💕
                </p>
              </div>
            )}

            {/* Warning before snooze 5 (Twitter) */}
            {snoozeCount === 4 && settings.twitter_handle && settings.enable_social_media_threats !== false && (
              <div className="mb-4 p-3 sm:p-4 bg-purple-500/30 backdrop-blur-sm border-2 border-purple-400 rounded-xl animate-pulse">
                <p className="text-white font-bold text-sm sm:text-base md:text-lg text-center">
                  ⚠️ WARNING: Next snooze will post to Twitter! 🐦
                </p>
              </div>
            )}

            {/* Snooze Button */}
            <button
              onClick={handleSnoozeClick}
              disabled={isLoading}
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-purple-900 to-purple-950 text-white rounded-xl hover:from-purple-800 hover:to-purple-900 active:from-purple-950 active:to-purple-950 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all font-bold text-lg sm:text-xl shake shadow-lg min-h-[56px]"
            >
              {isLoading ? 'Processing...' : snoozeCount === 2 && settings.crush_phone_number ? `😴 ${t.snooze} (Will text crush!)` : `😴 ${t.snooze}`}
            </button>

            {/* Stop Alarm Button */}
            <button
              onClick={handleStopAlarm}
              className="w-full mt-3 sm:mt-4 py-3 sm:py-3.5 bg-gradient-to-r from-purple-800 to-purple-950 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 active:from-purple-900 active:to-purple-950 transition-all font-semibold shadow-lg text-base sm:text-lg min-h-[48px]"
            >
              ✅ {t.imAwake}
            </button>
          </div>
        )}

        {/* Snooze Counter */}
        {snoozeCount > 0 && (
          <SnoozeCounter snoozeCount={snoozeCount} alarmTime={alarmTime} />
        )}

        {/* Social Media Threat */}
        {snoozeCount >= 3 && (
          <SocialMediaThreat
            snoozeCount={snoozeCount}
            nextThreshold={nextThreshold?.threshold}
            snoozesUntil={nextThreshold?.snoozesUntil}
          />
        )}

        {/* Roast Display */}
        {currentRoast && (
          <RoastDisplay
            roast={currentRoast}
            snoozeCount={snoozeCount}
            analysis={currentAnalysis}
          />
        )}

        {/* Stats Display */}
        {wakeUpTime && !isAlarmActive && (
          <div className="bg-purple-900/40 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-purple-300/30">
            <h3 className="text-xl font-bold mb-4 text-white">Today's Stats</h3>
            <div className="space-y-2">
              <p className="text-white/90">
                <span className="font-semibold">Wake-up time:</span>{' '}
                {formatTime(wakeUpTime)}
              </p>
              <p className="text-white/90">
                <span className="font-semibold">Total snoozes:</span> {snoozeCount}
              </p>
              {snoozeCount > 0 && (
                <p className="text-sm text-white/70">
                  {snoozeCount === 1
                    ? 'Not bad! Only one snooze.'
                    : `You snoozed ${snoozeCount} times. That's ${snoozeCount > 5 ? 'ridiculous' : 'pretty bad'}! 😅`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sleep Stats - Always show at bottom */}
        <SleepStats />
      </div>
    </main>
  )
}

