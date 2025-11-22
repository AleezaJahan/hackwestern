'use client'

import { useEffect, useRef } from 'react'

interface AlarmSoundProps {
  isActive: boolean
  volume?: number
}

/**
 * AlarmSound component that generates a blaring alarm beep sound
 * Uses Web Audio API to create a classic alarm clock beeping sound
 */
export default function AlarmSound({ isActive, volume = 0.5 }: AlarmSoundProps) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isActive) {
      // Stop alarm sound
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop()
        } catch (e) {
          // Already stopped
        }
        oscillatorRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
        audioContextRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Create audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) {
      console.warn('Web Audio API not supported')
      return
    }

    const audioContext = new AudioContextClass()
    audioContextRef.current = audioContext

    // Create beeping alarm sound
    const createBeep = () => {
      if (!audioContext || !isActive) return

      // Create oscillator for beep sound
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      // Set frequency for alarm beep (800Hz - classic alarm frequency)
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      
      // Create envelope for beep (sharp attack, quick decay)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01)
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2)

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)

      oscillator.onended = () => {
        // Clean up
      }
    }

    // Start beeping immediately
    createBeep()

    // Continue beeping every 0.5 seconds (classic alarm pattern)
    intervalRef.current = setInterval(() => {
      if (isActive && audioContext.state === 'running') {
        createBeep()
      }
    }, 500)

    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop()
        } catch (e) {
          // Already stopped
        }
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
      }
    }
  }, [isActive, volume])

  // This component doesn't render anything - it just plays sound
  return null
}

