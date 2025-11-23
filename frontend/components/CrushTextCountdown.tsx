'use client'

import { useState, useEffect, useRef } from 'react'

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
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)

  // Speak the countdown number
  const speakCountdown = (number: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }

    // Cancel any ongoing speech
    if (speechSynthesisRef.current) {
      speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(number.toString())
    utterance.rate = 0.9
    utterance.pitch = 1.2
    utterance.volume = 1.0
    
    speechSynthesis.speak(utterance)
    speechSynthesisRef.current = speechSynthesis
  }

  // Speak "text sent"
  const speakTextSent = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }

    const utterance = new SpeechSynthesisUtterance('Text sent')
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (!isActive) {
      setCountdown(5)
      // Cancel any ongoing speech
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        speechSynthesis.cancel()
      }
      return
    }

    // Reset countdown when component becomes active
    setCountdown(5)

    // Speak the initial countdown number (5)
    speakCountdown(5)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        const newCount = prev - 1
        if (newCount > 0) {
          // Speak the countdown number
          speakCountdown(newCount)
        } else if (newCount === 0) {
          // Speak "text sent" when countdown reaches 0
          speakTextSent()
          clearInterval(timer)
          // Small delay before calling onCountdownComplete
          setTimeout(() => {
            onCountdownComplete()
          }, 500)
          return 0
        }
        return newCount
      })
    }, 1000)

    return () => {
      clearInterval(timer)
      // Cancel speech on cleanup
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        speechSynthesis.cancel()
      }
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

