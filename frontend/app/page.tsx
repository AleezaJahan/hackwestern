'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { triggerAlarm, handleSnooze, notifySocialBackend } from '@/lib/api'
import { getSettings, getUserId } from '@/lib/storage'
import { formatTime, formatDateTime, formatDateTimeLocal, getMinutesUntilAlarm, isAlarmTimePassed } from '@/lib/utils'
import AudioPlayer, { AudioPlayerRef } from '@/components/AudioPlayer'
import AlarmSound from '@/components/AlarmSound'
import RoastDisplay from '@/components/RoastDisplay'
import SnoozeCounter from '@/components/SnoozeCounter'
import SocialMediaThreat from '@/components/SocialMediaThreat'
import { toast } from 'react-hot-toast'
import { getNextThreshold } from '@/lib/utils'

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
  const excuseInputRef = useRef<HTMLInputElement>(null)
  const audioPlayerRef = useRef<AudioPlayerRef>(null)
  const settings = getSettings()
  const userId = getUserId()

  // Check if alarm time has passed
  useEffect(() => {
    if (!alarmTime || isAlarmActive) return

    const interval = setInterval(() => {
      const alarm = new Date(alarmTime)
      if (isAlarmTimePassed(alarm) && !wakeUpTime) {
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
    try {
      setIsLoading(true)
      const response = await triggerAlarm({
        snooze_count: snoozeCount,
        user_id: userId,
        wake_up_time: new Date().toISOString(),
      })
      
      setAudioUrl(response.audio_url)
      setWakeUpTime(new Date())
      setIsAlarmActive(true)
      toast.success(`Alarm triggered! ${response.message}`)
    } catch (error: any) {
      toast.error(`Failed to trigger alarm: ${error.message}`)
      console.error('Error triggering alarm:', error)
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
      const response = await handleSnooze({
        excuse: excuse || 'No excuse given',
        snooze_count: newSnoozeCount,
        user_id: userId,
        transcribed_audio: excuse,
      })

      setSnoozeCount(newSnoozeCount)
      setCurrentRoast(response.roast)
      setCurrentAnalysis(response.analysis)
      setAudioUrl(response.audio_url)
      setExcuse('')
      
      // Notify Person 4's backend (Social Media)
      let imageData: File | null = null;
      if (newSnoozeCount >= 5) {
        // At snooze 5, automatically get random image from camera roll
        try {
          const { getRandomImageFromCameraRoll } = await import('@/lib/api');
          imageData = await getRandomImageFromCameraRoll();
          if (imageData) {
            toast.success('📸 Random image selected from camera roll!');
          } else {
            toast.warning('⚠️ No image found, posting stats without image');
          }
        } catch (error) {
          console.error('Error getting image:', error);
          toast.warning('⚠️ Could not access camera roll, posting without image');
        }
      }
      
      if (newSnoozeCount >= 3) {
        await notifySocialBackend(userId, newSnoozeCount, now, imageData, settings.mom_phone_number)
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

    const alarm = new Date(alarmTime)
    if (isAlarmTimePassed(alarm)) {
      toast.error('Please set an alarm time in the future!')
      return
    }

    setSnoozeCount(0)
    setIsAlarmActive(false)
    setWakeUpTime(null)
    setCurrentRoast(undefined)
    setCurrentAnalysis(undefined)
    setAudioUrl(undefined)
    toast.success(`Alarm set for ${formatDateTime(new Date(alarmTime))}`)
  }

  const handleStopAlarm = () => {
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
    
    // Reset alarm time so user can set a new one
    setAlarmTime('')
    
    toast.success('Alarm stopped! You can set a new alarm.')
  }

  const nextThreshold = getNextThreshold(snoozeCount)

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-2">
            ⏰ Passive-Aggressive Alarm Clock
          </h1>
          <p className="text-gray-600 text-lg">
            The alarm that scolds you for snoozing and threatens to tweet your wake-up time
          </p>
        </div>

        {/* Settings Button */}
        <div className="text-right">
          <button
            onClick={() => router.push('/settings')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Alarm Time Picker */}
        {!isAlarmActive && !wakeUpTime && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Set Alarm</h2>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alarm Time
                </label>
                <input
                  type="datetime-local"
                  value={alarmTime ? formatDateTimeLocal(alarmTime) : ''}
                  onChange={(e) => {
                    // Ensure the value is in correct format
                    const value = e.target.value;
                    if (value) {
                      setAlarmTime(value);
                    } else {
                      setAlarmTime('');
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                  min={formatDateTimeLocal(new Date())}
                />
              </div>
              <button
                onClick={handleSetAlarm}
                disabled={!alarmTime || isLoading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Set Alarm
              </button>
            </div>
            {alarmTime && (
              <div className="mt-4 space-y-1">
                <p className="text-sm font-semibold text-gray-700">
                  Alarm set for: {formatDateTime(new Date(alarmTime))}
                </p>
                <p className="text-sm text-gray-600">
                  Alarm will go off in {getMinutesUntilAlarm(alarmTime)} minutes
                </p>
              </div>
            )}
          </div>
        )}

        {/* Active Alarm */}
        {isAlarmActive && (
          <div className="bg-red-100 border-4 border-red-500 rounded-lg shadow-lg p-6 animate-pulse-slow">
            {/* Blaring Alarm Sound - plays continuously */}
            <AlarmSound isActive={isAlarmActive} volume={0.6} />
            
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold text-red-800 mb-2">🔔 WAKE UP! 🔔</h2>
              <p className="text-xl text-red-700">Your alarm is ringing!</p>
            </div>

            {/* Audio Player - plays voice message */}
            {audioUrl && (
              <div className="mb-6">
                <AudioPlayer ref={audioPlayerRef} audioUrl={audioUrl} autoPlay />
              </div>
            )}

            {/* Excuse Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg text-gray-900 bg-white"
                disabled={isLoading}
              />
            </div>

            {/* Snooze Button */}
            <button
              onClick={handleSnoozeClick}
              disabled={isLoading}
              className="w-full py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-bold text-xl shake"
            >
              {isLoading ? 'Processing...' : '😴 SNOOZE (I dare you!)'}
            </button>

            {/* Stop Alarm Button */}
            <button
              onClick={handleStopAlarm}
              className="w-full mt-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              ✅ I'm Awake! Stop Alarm
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Today's Stats</h3>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Wake-up time:</span>{' '}
                {formatTime(wakeUpTime)}
              </p>
              <p>
                <span className="font-semibold">Total snoozes:</span> {snoozeCount}
              </p>
              {snoozeCount > 0 && (
                <p className="text-sm text-gray-600">
                  {snoozeCount === 1
                    ? 'Not bad! Only one snooze.'
                    : `You snoozed ${snoozeCount} times. That's ${snoozeCount > 5 ? 'ridiculous' : 'pretty bad'}! 😅`}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

