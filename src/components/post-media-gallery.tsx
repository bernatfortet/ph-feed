'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Post } from '~/types/product-hunt.types'
import { HoverVideo } from './hover-video'

interface PostMediaGalleryProps {
  post: Post
  className?: string
}

export function PostMediaGallery(props: PostMediaGalleryProps) {
  const { post, className = '' } = props
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  function handleScroll() {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const itemWidth = container.clientWidth
    const scrollLeft = container.scrollLeft
    const newIndex = Math.round(scrollLeft / itemWidth)

    if (newIndex !== selectedMediaIndex && newIndex >= 0 && newIndex < post.media.length) {
      setSelectedMediaIndex(newIndex)
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    function handleScrollThrottled() {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      scrollTimeoutRef.current = setTimeout(handleScroll, 100)
    }

    container.addEventListener('scroll', handleScrollThrottled)
    return () => {
      container.removeEventListener('scroll', handleScrollThrottled)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [selectedMediaIndex, post.media.length])

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.matchMedia('(min-width: 768px)').matches)
    }

    checkIsDesktop()
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    mediaQuery.addEventListener('change', checkIsDesktop)

    return () => mediaQuery.removeEventListener('change', checkIsDesktop)
  }, [])

  if (!post.media || post.media.length === 0) return null

  const hasMultipleMedia = post.media.length > 1
  const fixedAspectRatio = 16 / 9 // 1.778 (16:9 widescreen)

  function handleThumbnailClick(index: number) {
    setSelectedMediaIndex(index)
    scrollToMedia(index, true)
  }

  function handleThumbnailHover(index: number) {
    if (!isDesktop) return
    setSelectedMediaIndex(index)
    scrollToMedia(index, false)
  }

  function scrollToMedia(index: number, smooth: boolean = true) {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const itemWidth = container.clientWidth
    container.scrollTo({
      left: index * itemWidth,
      behavior: smooth ? 'smooth' : 'instant',
    })
  }

  return (
    <div className={`${className}`}>
      {/* Thumbnail Navigation */}
      {hasMultipleMedia && (
        <div className='mb-2 h-10 flex gap-1'>
          {post.media.map((mediaItem, index) => {
            const width = `${100 / post.media.length}%`
            const isSelected = index === selectedMediaIndex

            return (
              <div
                key={`${mediaItem.url}-${index}`}
                className='relative h-full overflow-hidden rounded group cursor-pointer'
                style={{ width }}
                onMouseEnter={() => handleThumbnailHover(index)}
                onClick={() => handleThumbnailClick(index)}
              >
                <Image
                  src={mediaItem.url}
                  alt={`${post.name} media ${index + 1}`}
                  width={80}
                  height={40}
                  className='w-full h-full object-cover object-center'
                  unoptimized={mediaItem.url.includes('.gif')}
                />

                {/* Ring overlay - White base ring */}
                <div
                  className={`absolute inset-0 pointer-events-none rounded transition-all duration-200 ring-4 ring-inset ${
                    isSelected ? 'ring-white' : 'ring-transparent group-hover:ring-white'
                  }`}
                />

                {/* Ring overlay - Orange top ring */}
                <div
                  className={`absolute inset-0 pointer-events-none rounded transition-all duration-200 ring-2 ring-inset ${
                    isSelected ? 'ring-orange-500' : 'ring-transparent group-hover:ring-gray-300'
                  }`}
                />

                {/* Video indicator */}
                {mediaItem.type === 'video' && (
                  <div className='absolute inset-0 bg-black/20 flex items-center justify-center'>
                    <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M8 5v14l11-7z' />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Scrollable Media Container */}
      <div className='rounded-lg overflow-hidden border border-gray-200'>
        <div
          ref={scrollContainerRef}
          className='flex overflow-x-auto scrollbar-hide snap-x snap-mandatory'
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {post.media.map((mediaItem, index) => (
            <div key={`${mediaItem.url}-${index}`} className='flex-none w-full snap-start' style={{ aspectRatio: fixedAspectRatio }}>
              {mediaItem.type === 'video' && mediaItem.videoUrl ? (
                <HoverVideo
                  thumbnailUrl={mediaItem.url}
                  videoUrl={mediaItem.videoUrl}
                  alt={`${post.name} media ${index + 1}`}
                  width={500}
                  height={Math.round(500 / fixedAspectRatio)}
                  className='w-full h-full'
                />
              ) : (
                <Image
                  src={mediaItem.url}
                  alt={`${post.name} media ${index + 1}`}
                  width={500}
                  height={Math.round(500 / fixedAspectRatio)}
                  className='w-full h-full object-cover object-center'
                  unoptimized={mediaItem.url.includes('.gif')}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
