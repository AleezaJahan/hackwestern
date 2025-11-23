'use client'

import { useState, useEffect, useRef } from 'react'
import { generateCountdownAudio } from '@/lib/api'
import { getSettings } from '@/lib/storage'

interface TwitterThreatCountdownProps {
  isActive: boolean
  twitterHandle?: string
  onCountdownComplete: () => void
  onCancel?: () => void
}

export default function TwitterThreatCountdown({
  isActive,
  twitterHandle,
  onCountdownComplete,
  onCancel
}: TwitterThreatCountdownProps) {
  const [countdown, setCountdown] = useState(5)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isActiveRef = useRef(false)
  const cancelledRef = useRef(false)

  // Stop and cleanup audio
  const stopAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src)
        }
      } catch (e) {}
      audioRef.current = null
    }
  }

  // Play ONE audio file - wait for it to finish
  const playAudio = async (text: string): Promise<void> => {
    if (cancelledRef.current || !isActiveRef.current) {
      console.log('🚫 [Twitter] Audio cancelled before start:', text)
      return Promise.resolve()
    }

    // Stop any existing audio FIRST
    stopAudio()

    return new Promise(async (resolve) => {
      if (cancelledRef.current || !isActiveRef.current) {
        console.log('🚫 [Twitter] Audio cancelled in promise:', text)
        resolve()
        return
      }

      try {
        const settings = getSettings()
        const language = settings.language || 'en'
        console.log('📞 [Twitter] Calling API for:', text, 'Language:', language)
        const audioUrl = await generateCountdownAudio(text, language)
        console.log('✅ [Twitter] API returned audio URL for:', text)
        
        if (cancelledRef.current || !isActiveRef.current) {
          console.log('🚫 [Twitter] Cancelled after API call:', text)
          URL.revokeObjectURL(audioUrl)
          resolve()
          return
        }

        const audio = new Audio(audioUrl)
        audioRef.current = audio

        let finished = false

        const done = () => {
          if (finished) return
          finished = true
          console.log('🏁 [Twitter] Audio finished:', text)
          stopAudio()
          resolve()
        }

        audio.onended = () => {
          done()
        }

        audio.onerror = (e) => {
          console.error('❌ [Twitter] Audio error:', text, e)
          done()
        }

        // Play when ready
        const tryPlay = async () => {
          if (cancelledRef.current || !isActiveRef.current || finished) return
          try {
            await audio.play()
            console.log('▶️ [Twitter] Now playing:', text)
          } catch (e) {
            console.error('❌ [Twitter] Play failed:', text, e)
            done()
          }
        }

        audio.oncanplay = tryPlay
        audio.oncanplaythrough = tryPlay

        audio.load()

        // Fallback
        setTimeout(() => {
          if (!finished && audio.readyState >= 2 && audio.paused) {
            tryPlay()
          }
        }, 300)

        // Max wait
        setTimeout(() => {
          if (!finished) {
            console.log('⏱️ [Twitter] Timeout for:', text)
            done()
          }
        }, 3000)

      } catch (error) {
        console.error('❌ [Twitter] Generation error:', text, error)
        resolve()
      }
    })
  }

  // Store onCountdownComplete in ref to prevent re-renders
  const onCompleteRef = useRef(onCountdownComplete)
  useEffect(() => {
    onCompleteRef.current = onCountdownComplete
  }, [onCountdownComplete])

  useEffect(() => {
    if (!isActive) {
      cancelledRef.current = false
      isActiveRef.current = false
      setCountdown(5)
      stopAudio()
      return
    }

    // PREVENT DUPLICATES - only run once
    if (isActiveRef.current) {
      console.warn('⚠️ [Twitter] Already active, IGNORING duplicate trigger')
      return
    }

    console.log('🎯 [Twitter] ACTIVATING - Starting countdown sequence')
    isActiveRef.current = true
    cancelledRef.current = false
    setCountdown(5)

    const runSequence = async () => {
      console.log('🚀 [Twitter] ===== STARTING SEQUENCE =====')
      
      // 1. Warning (ONCE)
      if (!cancelledRef.current && isActiveRef.current) {
        console.log('📢 [Twitter] Step 1: Warning message')
        await playAudio("I'm going to post an embarrassing message in 5 seconds if you don't wake up")
      }
      if (cancelledRef.current || !isActiveRef.current) {
        console.log('🛑 [Twitter] Cancelled after step 1')
        return
      }
      await new Promise(r => setTimeout(r, 500))

      // 2. Countdown 5
      if (!cancelledRef.current && isActiveRef.current) {
        console.log('📢 [Twitter] Step 2: Countdown 5')
        setCountdown(5)
        await playAudio("5")
      }
      if (cancelledRef.current || !isActiveRef.current) return
      await new Promise(r => setTimeout(r, 300))

      // 3. Countdown 4
      if (!cancelledRef.current && isActiveRef.current) {
        console.log('📢 [Twitter] Step 3: Countdown 4')
        setCountdown(4)
        await playAudio("4")
      }
      if (cancelledRef.current || !isActiveRef.current) return
      await new Promise(r => setTimeout(r, 300))

      // 4. Countdown 3
      if (!cancelledRef.current && isActiveRef.current) {
        console.log('📢 [Twitter] Step 4: Countdown 3')
        setCountdown(3)
        await playAudio("3")
      }
      if (cancelledRef.current || !isActiveRef.current) return
      await new Promise(r => setTimeout(r, 300))

      // 5. Countdown 2
      if (!cancelledRef.current && isActiveRef.current) {
        console.log('📢 [Twitter] Step 5: Countdown 2')
        setCountdown(2)
        await playAudio("2")
      }
      if (cancelledRef.current || !isActiveRef.current) return
      await new Promise(r => setTimeout(r, 300))

      // 6. Countdown 1
      if (!cancelledRef.current && isActiveRef.current) {
        console.log('📢 [Twitter] Step 6: Countdown 1')
        setCountdown(1)
        await playAudio("1")
      }
      if (cancelledRef.current || !isActiveRef.current) return
      await new Promise(r => setTimeout(r, 300))

      // 7. Posted message
      if (!cancelledRef.current && isActiveRef.current) {
        console.log('📢 [Twitter] Step 7: Posted message')
        setCountdown(0)
        await playAudio("posted to Twitter loser")
      }
      if (cancelledRef.current || !isActiveRef.current) return
      await new Promise(r => setTimeout(r, 1000))

      // 8. Final
      if (!cancelledRef.current && isActiveRef.current) {
        console.log('📢 [Twitter] Step 8: Final message')
        await playAudio("now wake up")
      }

      console.log('✅ [Twitter] ===== SEQUENCE COMPLETE =====')
      
      if (!cancelledRef.current && isActiveRef.current) {
        isActiveRef.current = false
        onCompleteRef.current()
      }
    }

    // Small delay to ensure mounted
    const timer = setTimeout(() => {
      runSequence()
    }, 100)

    return () => {
      console.log('🧹 [Twitter] Cleanup - stopping sequence')
      clearTimeout(timer)
      cancelledRef.current = true
      isActiveRef.current = false
      stopAudio()
    }
  }, [isActive]) // REMOVED onCountdownComplete from dependencies

  const handleCancel = () => {
    console.log('🛑 [Twitter] CANCEL - STOPPING EVERYTHING')
    cancelledRef.current = true
    isActiveRef.current = false
    stopAudio()
    if (onCancel) onCancel()
  }

  if (!isActive || !twitterHandle) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-950/95 backdrop-blur-md text-white rounded-2xl sm:rounded-lg shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 border-4 border-purple-800/80 animate-pulse max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🐦</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 px-2">Posting to Twitter!</h2>
          <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 px-2">
            Your embarrassing wake-up stats will be posted in...
          </p>
          
          <div className="text-6xl sm:text-7xl md:text-8xl font-bold mb-4 sm:mb-6 text-purple-300">
            {countdown}
          </div>
          
          <p className="text-sm sm:text-base md:text-lg mb-4 opacity-90 px-2">
            Everyone will see how many times you snoozed. Better wake up now! 😱
          </p>
          
          {onCancel && countdown > 0 && (
            <button
              onClick={handleCancel}
              className="mt-4 px-6 py-3 sm:py-3.5 bg-white/10 backdrop-blur-sm text-purple-200 border-2 border-purple-700 rounded-lg font-semibold hover:bg-white/20 active:bg-white/30 hover:border-purple-600 transition-colors text-base sm:text-lg min-h-[48px] w-full sm:w-auto"
            >
              Cancel (Too Late!)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
