import Image from 'next/image'
import { Post } from '~/types/product-hunt.types'
import { PostMediaGallery } from './post-media-gallery'
import { UpvoteButton } from './upvote-button'

interface ProductCardProps {
  post: Post
}

export function ProductCard(props: ProductCardProps) {
  const { post } = props

  return (
    <article className='border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors'>
      <div className='flex gap-3'>
        {/* Product logo/thumbnail */}
        <div className='flex-shrink-0'>
          {post.thumbnail?.url ? (
            <Image src={post.thumbnail.url} alt={post.name} width={48} height={48} className='rounded-lg object-cover' />
          ) : (
            <div className='w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-lg'>{post.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Product content */}
        <div className='flex-1 min-w-0'>
          {/* Header with product name and maker */}
          <div className='flex items-start justify-between mb-2'>
            <div className='flex-1 min-w-0 cursor-pointer' onClick={() => window.open(post.url, '_blank', 'noopener,noreferrer')}>
              <div className='flex items-center gap-2'>
                <h3 className='font-bold text-lg -mt-1 text-gray-900 truncate'>{post.name}</h3>
                {post.user?.username && !post.user.username.includes('[REDACTED]') && (
                  <span className='text-gray-500 text-sm'>by @{post.user.username}</span>
                )}
              </div>
              <p className='text-gray-700 text-sm mb-2'>{post.tagline}</p>
            </div>

            {/* Vote button */}
            <UpvoteButton post={post} className='-mt-2' />
          </div>

          {/* Description */}
          {post.description && <p className='text-gray-700 text-sm mb-3 line-clamp-2'>{post.description}</p>}

          {/* Media Gallery */}
          <PostMediaGallery post={post} className='mb-3' />

          {/* Topics */}
          {post.topics?.edges && post.topics.edges.length > 0 && (
            <div className='flex flex-wrap gap-1 mb-3'>
              {post.topics.edges.slice(0, 3).map((edge) => (
                <span key={edge.node.id} className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'>
                  {edge.node.name}
                </span>
              ))}
            </div>
          )}

          {/* Footer with stats and actions */}
          <div className='flex items-center justify-between text-gray-500 text-sm'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-1'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-7.7-6M3 12c0-4.418 3.582-8 8-8s8 3.582 8 8z'
                  />
                </svg>
                <span>{post.commentsCount}</span>
              </div>

              <div className='flex items-center gap-1'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                  />
                </svg>
              </div>

              <div className='flex items-center gap-1'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                  />
                </svg>
              </div>
            </div>

            <div className='text-xs text-gray-400'>{formatTimeAgo(post.createdAt)}</div>
          </div>
        </div>
      </div>
    </article>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays > 0) return `${diffInDays}d`
  if (diffInHours > 0) return `${diffInHours}h`

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  if (diffInMinutes > 0) return `${diffInMinutes}m`

  return 'now'
}
