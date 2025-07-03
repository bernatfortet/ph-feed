'use client'

import { useState, useEffect } from 'react'
import { Post } from '~/types/product-hunt.types'
import { ProductCard } from './product-card'
import { setVoteLoading } from '~/lib/vote-store'

interface FeedProps {
  selectedDate: string
}

export function Feed(props: FeedProps) {
  const { selectedDate } = props
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [selectedDate])

  async function fetchPosts() {
    setLoading(true)
    setError(null)

    try {
      console.log('🌀 Fetching posts for date:', selectedDate)

      const response = await fetch(`/api/posts?date=${selectedDate}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const postNodes = data.posts?.edges?.map((edge: { node: Post }) => edge.node) || []
      setPosts(postNodes)
      console.log('✅ Successfully loaded posts:', postNodes.length)

      // After main posts load, fetch fresh vote counts in background
      fetchVotesUpdate(postNodes)
    } catch (err) {
      console.error('🚨 Error fetching posts:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function fetchVotesUpdate(currentPosts: Post[]) {
    if (currentPosts.length === 0) return

    setVoteLoading(true)
    try {
      console.log('⚡ Fetching fresh vote counts for date:', selectedDate)

      const response = await fetch(`/api/votes?date=${selectedDate}`)

      if (!response.ok) {
        console.warn('Failed to fetch vote updates:', response.status)
        return
      }

      const data = await response.json()

      if (data.error) {
        console.warn('Vote update error:', data.error)
        return
      }

      // Merge fresh vote counts with existing posts
      const updatedPosts = currentPosts.map((post) => ({
        ...post,
        votesCount: data.votes[post.id] ?? post.votesCount,
      }))

      setPosts(updatedPosts)
      console.log('✅ Updated vote counts for', Object.keys(data.votes).length, 'posts')
    } catch (err) {
      console.warn('🚨 Error updating votes (non-critical):', err)
      // Don't show error to user since this is background update
    } finally {
      setVoteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='max-w-2xl mx-auto'>
        <div className='p-4 space-y-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='border-b border-gray-200 p-4'>
              <div className='flex gap-3 animate-pulse'>
                <div className='w-12 h-12 bg-gray-200 rounded-lg'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                  <div className='h-3 bg-gray-200 rounded w-5/6'></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='max-w-2xl mx-auto p-4'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-center'>
          <div className='text-red-600 mb-2'>
            <svg className='w-8 h-8 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h3 className='font-medium text-red-800 mb-1'>Failed to load products</h3>
          <p className='text-sm text-red-600 mb-3'>{error}</p>
          <button onClick={fetchPosts} className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm'>
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className='max-w-2xl mx-auto p-4'>
        <div className='text-center py-12'>
          <div className='text-gray-400 mb-4'>
            <svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1}
                d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-gray-700 mb-2'>No products found</h3>
          <p className='text-gray-500'>No products were launched on {formatDisplayDate(selectedDate)}. Try selecting a different date.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='bg-white'>
        {posts.map((post) => (
          <ProductCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString)
  const result = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return result
}
