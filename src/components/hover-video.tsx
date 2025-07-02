'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  function handleMouseEnter() {
    setIsHovered(true)
    // Delay video load slightly to avoid flickering on quick hovers
    timeoutRef.current = setTimeout(() => {
      setShowVideo(true)
    }, 200)
  }

  function handleMouseLeave() {
    setIsHovered(false)
    setShowVideo(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  function getYouTubeEmbedUrl(url: string): string | null {
    // Extract YouTube video ID from various URL formats
    const regexPatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]

    for (const pattern of regexPatterns) {
      const match = url.match(pattern)
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${match[1]}`
      }
    }
    return null
  }

  const embedUrl = getYouTubeEmbedUrl(videoUrl)

  return (
    <div className={`relative ${className}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Thumbnail */}
      <Image
        src={thumbnailUrl}
        alt={alt}
        width={width}
        height={height}
        className='w-full h-auto object-cover'
        unoptimized={thumbnailUrl.includes('.gif')}
      />

      {/* Video overlay */}
      {showVideo && embedUrl && (
        <div className='absolute inset-0'>
          <iframe
            src={embedUrl}
            className='w-full h-full object-cover'
            frameBorder='0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          />
        </div>
      )}

      {/* Play button overlay (always visible) */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div
          className={`w-12 h-12 bg-black/60 rounded-full flex items-center justify-center transition-opacity ${
            isHovered ? 'opacity-30' : 'opacity-100'
          }`}
        >
          <svg className='w-6 h-6 text-white ml-0.5' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M8 5v14l11-7z' />
          </svg>
        </div>
      </div>
    </div>
  )
}
