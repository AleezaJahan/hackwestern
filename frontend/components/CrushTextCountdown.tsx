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

  // Play countdown audio using ElevenLabs
  const playCountdownAudio = async (text: string): Promise<void> => {
    try {
      const audioUrl = await generateCountdownAudio(text)
      const audio = new Audio(audioUrl)
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl) // Clean up
          resolve()
        }
        audio.onerror = (e) => {
          console.error('Error playing countdown audio:', e)
          URL.revokeObjectURL(audioUrl) // Clean up
          reject(e)
        }
        audio.play().catch(reject)
        audioRefs.current.push(audio)
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
      // Stop all audio
      audioRefs.current.forEach(audio => {
        audio.pause()
        audio.currentTime = 0
      })
      audioRefs.current = []
      return
    }

    // Reset countdown when component becomes active
    setCountdown(5)

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
        
        // Call completion handler
        onCountdownComplete()
      } catch (error) {
        console.error('Error in countdown sequence:', error)
        // Still call completion even if audio fails
        onCountdownComplete()
      }
    }

    // Small delay to ensure component is mounted
    const startDelay = setTimeout(() => {
      playCountdownSequence()
    }, 200)

    return () => {
      clearTimeout(startDelay)
      // Stop all audio on cleanup
      audioRefs.current.forEach(audio => {
        audio.pause()
        audio.currentTime = 0
      })
      audioRefs.current = []
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

