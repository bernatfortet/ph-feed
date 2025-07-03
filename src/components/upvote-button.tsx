'use client'

import { Post } from '~/types/product-hunt.types'

interface UpvoteButtonProps {
  post: Post
  className?: string
}

export function UpvoteButton(props: UpvoteButtonProps) {
  const { post, className } = props

  function handleUpvoteClick() {
    window.open(post.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={`flex-shrink-0 ml-3 ${className}`}>
      <div
        onClick={handleUpvoteClick}
        className='group/accessory flex w-[52px] h-[52px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-gray-200 bg-primary transition-all duration-300 hover:border-brand-500 cursor-pointer'
        data-filled='false'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='16'
          height='16'
          fill='none'
          viewBox='0 0 16 16'
          className='fill-white stroke-gray-700 stroke-[1.5px] transition-all duration-300'
        >
          <path d='M6.579 3.467c.71-1.067 2.132-1.067 2.842 0L12.975 8.8c.878 1.318.043 3.2-1.422 3.2H4.447c-1.464 0-2.3-1.882-1.422-3.2z'></path>
        </svg>
        <p className='text-[14px] font-semibold leading-none text-gray-700'>{post.votesCount}</p>
      </div>
    </div>
  )
}
