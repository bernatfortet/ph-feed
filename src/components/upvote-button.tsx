'use client'

import { useStore } from '@nanostores/react'
import { voteLoadingStore } from '~/lib/vote-store'
import { Post } from '~/types/product-hunt.types'

interface UpvoteButtonProps {
  post: Post
}

export function UpvoteButton(props: UpvoteButtonProps) {
  const { post } = props
  const isVoteLoading = useStore(voteLoadingStore)

  function handleUpvoteClick() {
    window.open(post.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className='flex-shrink-0 ml-3'>
      <button
        type='button'
        onClick={handleUpvoteClick}
        className='group flex size-12 flex-col items-center justify-center gap-1 rounded-xl border-2 border-gray-200 bg-white transition-all duration-300 hover:border-orange-500'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='16'
          height='16'
          fill='none'
          viewBox='0 0 16 16'
          className='fill-white stroke-gray-700 stroke-[1.5px] transition-all duration-300 group-hover:stroke-orange-500'
        >
          <path d='M6.579 3.467c.71-1.067 2.132-1.067 2.842 0L12.975 8.8c.878 1.318.043 3.2-1.422 3.2H4.447c-1.464 0-2.3-1.882-1.422-3.2z'></path>
        </svg>

        {/* Vote count with loading state */}
        <div className='flex items-center justify-center h-5'>
          {isVoteLoading ? (
            <div className='w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin'></div>
          ) : (
            <p className='text-sm font-semibold leading-none text-gray-700 group-hover:text-orange-500 transition-colors duration-300'>
              {post.votesCount}
            </p>
          )}
        </div>
      </button>
    </div>
  )
}
