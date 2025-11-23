'use client'

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { getAudioUrl } from '@/lib/api'

interface AudioPlayerProps {
  audioUrl?: string
  autoPlay?: boolean
  onEnded?: () => void
}

export interface AudioPlayerRef {
  stop: () => void
  pause: () => void
}

const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(
  ({ audioUrl, autoPlay = false, onEnded }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Expose stop method to parent
    useImperativeHandle(ref, () => ({
      stop: () => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
          setIsPlaying(false)
        }
      },
      pause: () => {
        if (audioRef.current) {
          audioRef.current.pause()
          setIsPlaying(false)
        }
      },
    }))

  useEffect(() => {
    if (!audioUrl) return

    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }
    const handleError = () => {
      setError('Failed to load audio')
      setIsPlaying(false)
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [audioUrl, onEnded])

  useEffect(() => {
    if (autoPlay && audioUrl && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.error('Error playing audio:', err)
        setError('Failed to play audio')
      })
    }
  }, [autoPlay, audioUrl])

  if (!audioUrl) return null

  const fullUrl = audioUrl.startsWith('http') ? audioUrl : getAudioUrl(audioUrl.split('/').pop() || '')

  return (
    <div className="flex items-center justify-center gap-2">
      <audio ref={audioRef} src={fullUrl} className="hidden" />
      <button
        onClick={() => {
          if (audioRef.current) {
            if (isPlaying) {
              audioRef.current.pause()
            } else {
              audioRef.current.play().catch((err) => {
                console.error('Error playing audio:', err)
                setError('Failed to play audio')
              })
            }
          }
        }}
        className="p-3 bg-purple-700 text-white rounded-full hover:bg-purple-600 transition-colors shadow-lg"
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isPlaying ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      {error && (
        <span className="text-red-500 text-sm">{error}</span>
      )}
    </div>
  )
})

AudioPlayer.displayName = 'AudioPlayer'

export default AudioPlayer

