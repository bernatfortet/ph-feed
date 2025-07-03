'use client'

import { useState } from 'react'
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

  if (!post.media || post.media.length === 0) return null

  const selectedMedia = post.media[selectedMediaIndex]
  const hasMultipleMedia = post.media.length > 1
  const fixedAspectRatio = 16 / 9 // 1.778 (16:9 widescreen)

  function handleThumbnailHover(index: number) {
    setSelectedMediaIndex(index)
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
                className='relative h-full overflow-hidden rounded group'
                style={{ width }}
                onMouseEnter={() => handleThumbnailHover(index)}
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

      {/* Main Media Display */}
      <div className='rounded-lg overflow-hidden border border-gray-200'>
        {selectedMedia.type === 'video' && selectedMedia.videoUrl ? (
          <div style={{ aspectRatio: fixedAspectRatio }}>
            <HoverVideo
              thumbnailUrl={selectedMedia.url}
              videoUrl={selectedMedia.videoUrl}
              alt={post.name}
              width={500}
              height={Math.round(500 / fixedAspectRatio)}
              className='w-full h-full'
            />
          </div>
        ) : (
          <div style={{ aspectRatio: fixedAspectRatio }}>
            <Image
              src={selectedMedia.url}
              alt={post.name}
              width={500}
              height={Math.round(500 / fixedAspectRatio)}
              className='w-full h-full object-cover object-center'
              unoptimized={selectedMedia.url.includes('.gif')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
