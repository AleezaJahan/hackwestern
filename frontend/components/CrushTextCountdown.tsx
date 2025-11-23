'use client'

import { useState, useEffect, useRef } from 'react'
import { generateCountdownAudio } from '@/lib/api'

interface CrushTextCountdownProps {
  isActive: boolean
  crushPhoneNumber?: string
  onCountdownComplete: () => void
  onCancel?: () => void
}

export default function CrushTextCountdown({
  isActive,
  crushPhoneNumber,
  onCountdownComplete,
  onCancel
}: CrushTextCountdownProps) {
  const [countdown, setCountdown] = useState(5)
  const audioRefs = useRef<HTMLAudioElement[]>([])
  const isPlayingRef = useRef(false)
  const sequenceRef = useRef<Promise<void> | null>(null)

  // Stop all currently playing audio
  const stopAllAudio = () => {
    audioRefs.current.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
      audio.onended = null
      audio.onerror = null
    })
    audioRefs.current = []
  }

  // Play countdown audio using ElevenLabs
  const playCountdownAudio = async (text: string): Promise<void> => {
    // Stop any currently playing audio first
    stopAllAudio()
    
    try {
      const audioUrl = await generateCountdownAudio(text)
      const audio = new Audio(audioUrl)
      
      return new Promise((resolve, reject) => {
        // Clean up function
        const cleanup = () => {
          URL.revokeObjectURL(audioUrl)
          const index = audioRefs.current.indexOf(audio)
          if (index > -1) {
            audioRefs.current.splice(index, 1)
          }
        }
        
        audio.onended = () => {
          cleanup()
          resolve()
        }
        audio.onerror = (e) => {
          console.error('Error playing countdown audio:', e)
          cleanup()
          reject(e)
        }
        
        audioRefs.current.push(audio)
        audio.play().catch((err) => {
          cleanup()
          reject(err)
        })
      })
    } catch (error) {
      console.error('Error generating/playing countdown audio:', error)
      // Fallback: continue even if audio fails
      return Promise.resolve()
    }
  }

  useEffect(() => {
    if (!isActive) {
      setCountdown(5)
      isPlayingRef.current = false
      stopAllAudio()
      // Cancel any ongoing sequence
      if (sequenceRef.current) {
        sequenceRef.current = null
      }
      return
    }

    // Prevent multiple simultaneous countdowns
    if (isPlayingRef.current) {
      console.warn('Countdown already playing, ignoring duplicate trigger')
      return
    }

    // Reset countdown when component becomes active
    setCountdown(5)
    isPlayingRef.current = true

    // Play countdown audio sequentially using ElevenLabs
    const playCountdownSequence = async () => {
      try {
        // First, play the warning message
        await playCountdownAudio("I'm going to text your crush in 5 seconds if you don't wake up")
        
        // Small pause after warning
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Play "5"
        await playCountdownAudio("5")
        setCountdown(4)
        
        // Play "4"
        await playCountdownAudio("4")
        setCountdown(3)
        
        // Play "3"
        await playCountdownAudio("3")
        setCountdown(2)
        
        // Play "2"
        await playCountdownAudio("2")
        setCountdown(1)
        
        // Play "1"
        await playCountdownAudio("1")
        setCountdown(0)
        
        // Play "text sent to crush loser" with dramatic pause before "now wake up"
        await playCountdownAudio("text sent to crush loser")
        
        // Dramatic pause (1.5 seconds)
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Play "now wake up"
        await playCountdownAudio("now wake up")
        
        // Reset flag
        isPlayingRef.current = false
        
        // Call completion handler
        onCountdownComplete()
      } catch (error) {
        console.error('Error in countdown sequence:', error)
        isPlayingRef.current = false
        // Still call completion even if audio fails
        onCountdownComplete()
      }
    }

    // Small delay to ensure component is mounted
    const startDelay = setTimeout(() => {
      sequenceRef.current = playCountdownSequence()
    }, 200)

    return () => {
      clearTimeout(startDelay)
      isPlayingRef.current = false
      stopAllAudio()
      // Cancel any ongoing sequence
      sequenceRef.current = null
    }
  }, [isActive, onCountdownComplete])

  if (!isActive || !crushPhoneNumber) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-red-600 text-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-red-800 animate-pulse">
        <div className="text-center">
          <div className="text-6xl mb-4">💕</div>
          <h2 className="text-3xl font-bold mb-4">Texting Your Crush!</h2>
          <p className="text-xl mb-6">
            Sending romantic text to your crush in...
          </p>
          
          <div className="text-8xl font-bold mb-6 text-yellow-300">
            {countdown}
          </div>
          
          <p className="text-lg mb-4 opacity-90">
            "Hey babe, I was up all night thinking about how to confess my feelings for you, and now I can't wake up. Call me please."
          </p>
          
          {onCancel && countdown > 0 && (
            <button
              onClick={onCancel}
              className="mt-4 px-6 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel (Too Late!)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

