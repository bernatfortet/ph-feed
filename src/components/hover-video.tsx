'use client'

import { useState, useRef, useEffect, useId } from 'react'
import Image from 'next/image'
import { setActiveVideo, clearActiveVideo } from '~/lib/video-store'

interface HoverVideoProps {
  thumbnailUrl: string
  videoUrl: string
  alt: string
  width: number
  height: number
  className?: string
}

export function HoverVideo(props: HoverVideoProps) {
  const { thumbnailUrl, videoUrl, alt, width, height, className = '' } = props
  const [isHovered, setIsHovered] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const youtubePlayerRef = useRef<HTMLIFrameElement>(null)
  const videoId = useId()

  const isYouTubeVideo = isYouTubeUrl(videoUrl)
  const isDirectVideoFile = isDirectVideoUrl(videoUrl)

  // Stop function for global state management
  function stopVideo() {
    setIsHovered(false)
    setShowVideo(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setIsPlaying(false)
      setCurrentTime(0)
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  // Intersection observer to stop video when off-screen
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Use a ref to get current showVideo state to avoid dependency issues
        if (!entry?.isIntersecting) {
          console.log('📺 video went off-screen, stopping', videoId)
          stopVideo()
          clearActiveVideo(videoId)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [videoId]) // Removed showVideo from dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearActiveVideo(videoId)
    }
  }, [videoId])

  // Try to set YouTube playback speed when video shows
  useEffect(() => {
    if (showVideo && isYouTubeVideo && youtubePlayerRef.current) {
      const iframe = youtubePlayerRef.current
      const timeoutId = setTimeout(() => {
        try {
          // Try to post message to YouTube player to set playback rate
          iframe.contentWindow?.postMessage('{"event":"command","func":"setPlaybackRate","args":[2]}', 'https://www.youtube.com')
        } catch (error) {
          console.log('Could not set YouTube playback rate:', error)
        }
      }, 1000) // Wait for player to be ready

      return () => clearTimeout(timeoutId)
    }
  }, [showVideo, isYouTubeVideo])

  function handleMouseEnter() {
    setIsHovered(true)

    // Register this video as active to stop others
    setActiveVideo(videoId, stopVideo)

    if (isDirectVideoFile) {
      // Show video immediately for direct files
      setShowVideo(true)
      timeoutRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play()
          setIsPlaying(true)
        }
      }, 100)
    } else if (isYouTubeVideo) {
      // Delay for YouTube videos
      timeoutRef.current = setTimeout(() => {
        setShowVideo(true)
      }, 200)
    }
  }

  function handleMouseLeave() {
    setIsHovered(false)

    // For YouTube videos, keep them playing but clear hover state
    // For direct video files, stop them immediately
    if (isDirectVideoFile) {
      stopVideo()
      clearActiveVideo(videoId)
    } else if (isYouTubeVideo) {
      // Keep YouTube video playing, just remove hover state
      // It will be stopped by global state when another video starts
      // or by intersection observer when off-screen
    }
  }

  function handleVideoClick() {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!videoRef.current || !progressRef.current) return

    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const progressWidth = rect.width
    const clickRatio = clickX / progressWidth
    const newTime = clickRatio * duration

    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  function handleTimeUpdate() {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  function handleLoadedMetadata() {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  function isYouTubeUrl(url: string): boolean {
    const youtubePatterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/, /youtube\.com\/watch\?.*v=/]
    return youtubePatterns.some((pattern) => pattern.test(url))
  }

  function isDirectVideoUrl(url: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi']
    const lowerUrl = url.toLowerCase()
    return (
      videoExtensions.some((ext) => lowerUrl.includes(ext)) ||
      lowerUrl.includes('video') ||
      lowerUrl.includes('.mp4') ||
      lowerUrl.includes('media')
    )
  }

  function getYouTubeEmbedUrl(url: string): string | null {
    const regexPatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]

    for (const pattern of regexPatterns) {
      const match = url.match(pattern)
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&controls=1&loop=1&playlist=${match[1]}&enablejsapi=1`
      }
    }
    return null
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const embedUrl = getYouTubeEmbedUrl(videoUrl)
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div ref={containerRef} className={`relative group ${className}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Thumbnail */}
      <Image
        src={thumbnailUrl}
        alt={alt}
        width={width}
        height={height}
        className='w-full h-full object-cover object-center'
        unoptimized={thumbnailUrl.includes('.gif')}
      />

      {/* Custom Video Player for Direct Files */}
      {showVideo && isDirectVideoFile && (
        <div className='absolute inset-0 bg-black'>
          <video
            ref={videoRef}
            className='w-full h-full object-cover object-center cursor-pointer'
            muted
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={handleVideoClick}
          >
            <source src={videoUrl} type='video/mp4' />
            Your browser does not support the video tag.
          </video>

          {/* Enhanced Video Controls - Always visible when hovered or playing */}
          {(isHovered || isPlaying) && duration > 0 && (
            <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4'>
              {/* Progress Bar */}
              <div
                ref={progressRef}
                className='w-full h-2 bg-white/20 rounded-full cursor-pointer mb-3 relative group/progress hover:h-3 transition-all duration-200'
                onClick={handleProgressClick}
              >
                <div
                  className='h-full bg-white rounded-full transition-all duration-150 relative'
                  style={{ width: `${progressPercentage}%` }}
                >
                  {/* Progress handle */}
                  <div className='absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200' />
                </div>

                {/* Time tooltip on hover */}
                <div className='absolute -top-8 left-0 right-0 flex justify-between text-xs text-white opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200'>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control buttons and time display */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  {/* Play/Pause Button */}
                  <button
                    onClick={handleVideoClick}
                    className='flex items-center justify-center w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 transition-colors'
                  >
                    {isPlaying ? (
                      <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 24 24'>
                        <path d='M6 4h4v16H6V4zm8 0h4v16h-4V4z' />
                      </svg>
                    ) : (
                      <svg className='w-5 h-5 text-white ml-0.5' fill='currentColor' viewBox='0 0 24 24'>
                        <path d='M8 5v14l11-7z' />
                      </svg>
                    )}
                  </button>

                  {/* Time display */}
                  <div className='text-sm text-white font-medium'>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Volume indicator */}
                <div className='text-xs text-white/60'>🔇 Muted</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* YouTube Player Fallback with enhanced controls */}
      {showVideo && isYouTubeVideo && embedUrl && (
        <div className='absolute inset-0'>
          <iframe
            ref={youtubePlayerRef}
            src={embedUrl}
            className='w-full h-full'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          />
        </div>
      )}

      {/* Play button overlay (shows when not playing) */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          showVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div
          className={`w-16 h-16 bg-black/70 rounded-full flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'scale-110 bg-black/80' : 'scale-100'
          }`}
        >
          <svg className='w-8 h-8 relative -left-[2px] rounded-sm text-white ml-1' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M8 5v14l11-7z' />
          </svg>
        </div>
      </div>
    </div>
  )
}
