import { PostsResponse, Post } from '~/types/product-hunt.types'
import { getCachedData, setCachedData } from './product-hunt-cache'

const PRODUCT_HUNT_API_URL = 'https://api.producthunt.com/v2/api/graphql'
const PRODUCT_HUNT_OAUTH_URL = 'https://api.producthunt.com/v2/oauth/token'

let cachedAccessToken: string | null = null
let tokenExpiryTime: number = 0

const POSTS_QUERY = `
  query Posts($first: Int!, $after: String, $postedAfter: DateTime, $postedBefore: DateTime) {
    posts(first: $first, after: $after, postedAfter: $postedAfter, postedBefore: $postedBefore, order: VOTES) {
      edges {
        node {
          id
          name
          tagline
          description
          votesCount
          commentsCount
          createdAt
          url
          thumbnail {
            type
            url
          }
          media {
            type
            url
            videoUrl
          }
          user {
            username
          }
          topics {
            edges {
              node {
                id
                name
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`

// Lightweight query for just vote counts - very low complexity!
const VOTES_QUERY = `
  query PostVotes($first: Int!, $postedAfter: DateTime, $postedBefore: DateTime) {
    posts(first: $first, postedAfter: $postedAfter, postedBefore: $postedBefore, order: VOTES) {
      edges {
        node {
          id
          votesCount
        }
      }
    }
  }
`

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedAccessToken && Date.now() < tokenExpiryTime) {
    return cachedAccessToken
  }

  const clientId = process.env.PRODUCT_HUNT_TOKEN
  const clientSecret = process.env.PRODUCT_HUNT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Product Hunt client ID and secret are required')
  }

  console.log('🌀 Getting new Product Hunt access token')

  try {
    const response = await fetch(PRODUCT_HUNT_OAUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    })

    if (!response.ok) {
      throw new Error(`OAuth failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.access_token) {
      throw new Error('No access token received from Product Hunt')
    }

    // Cache the token (expires in 1 hour by default, we'll refresh 5 minutes early)
    cachedAccessToken = data.access_token
    tokenExpiryTime = Date.now() + ((data.expires_in || 3600) - 300) * 1000

    console.log('✅ Successfully obtained Product Hunt access token')
    return data.access_token
  } catch (error) {
    console.error('🚨 Error getting Product Hunt access token:', error)
    throw error
  }
}

export async function fetchProductHuntPosts(params: { date?: string; first?: number; after?: string }) {
  const { date, first = 20, after } = params

  // Check cache first for complete date requests (no pagination)
  if (date && !after) {
    const cacheKey = `posts-${date}-${first}`
    const cachedData = getCachedData<PostsResponse>(cacheKey)
    if (cachedData) {
      console.log('💾 Using cached posts for', date)
      return cachedData
    }
  }

  // If date is provided, set the time range for that day
  let postedAfter: string | undefined
  let postedBefore: string | undefined

  if (date) {
    // Parse the date string (YYYY-MM-DD) in local timezone
    const [year, month, day] = date.split('-').map(Number)

    // Set the time range for that day in local timezone
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)

    postedAfter = startOfDay.toISOString()
    postedBefore = endOfDay.toISOString()

    console.log('📅 Date range for', date, ':', { postedAfter, postedBefore })
  }

  const variables = {
    first,
    after,
    postedAfter,
    postedBefore,
  }

  console.log('🌀 Fetching Product Hunt posts from API', { variables })

  try {
    // Get access token first
    const accessToken = await getAccessToken()

    const response = await fetch(PRODUCT_HUNT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: POSTS_QUERY,
        variables,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
    }

    // Log rate limit headers from Product Hunt API
    const rateLimitLimit = response.headers.get('X-Rate-Limit-Limit')
    const rateLimitRemaining = response.headers.get('X-Rate-Limit-Remaining')
    const rateLimitReset = response.headers.get('X-Rate-Limit-Reset')

    if (rateLimitLimit) {
      console.log('⚡ Rate Limit Status:', {
        limit: rateLimitLimit,
        remaining: rateLimitRemaining,
        resetInSeconds: rateLimitReset,
        percentUsed: Math.round(((Number(rateLimitLimit) - Number(rateLimitRemaining)) / Number(rateLimitLimit)) * 100),
      })
    }

    const data = await response.json()

    if (data.errors) {
      console.log('🚨 GraphQL errors', data.errors)
      throw new Error(data.errors[0]?.message || 'GraphQL error')
    }

    const result = data.data as PostsResponse

    // Cache the complete result for date-based requests (no pagination)
    if (date && !after) {
      const cacheKey = `posts-${date}-${first}`
      setCachedData(cacheKey, result, 24 * 60 * 60 * 1000) // 24 hours
      console.log('💾 Cached posts for', date)
    }

    console.log('✅ Successfully fetched Product Hunt posts from API', result?.posts?.edges?.length)
    return result
  } catch (error) {
    console.error('🚨 Error fetching Product Hunt posts', error)
    throw error
  }
}

export async function fetchAllProductHuntPosts(params: { date: string; pageSize?: number }) {
  const { date, pageSize = 50 } = params

  // Check cache first for all posts of the day
  const cacheKey = `all-posts-${date}`
  const cachedData = getCachedData<PostsResponse>(cacheKey)
  if (cachedData) {
    console.log('💾 Using cached ALL posts for', date, '- Total:', cachedData.posts.edges.length)
    return cachedData
  }

  console.log('🏁 Fetching ALL posts for', date, 'with pagination...')

  const allPosts: Array<{ node: Post; cursor: string }> = []
  let hasNextPage = true
  let after: string | undefined
  let pageCount = 0

  try {
    while (hasNextPage) {
      pageCount++
      console.log(`🌀 Fetching page ${pageCount}...`)

      const response = await fetchProductHuntPosts({
        date,
        first: pageSize,
        after,
      })

      if (!response?.posts?.edges) {
        console.log('🚨 No posts data received')
        break
      }

      // Add posts from this page
      allPosts.push(...response.posts.edges)

      // Check if there are more pages
      hasNextPage = response.posts.pageInfo.hasNextPage
      after = response.posts.pageInfo.endCursor

      console.log(`✅ Page ${pageCount} completed - ${response.posts.edges.length} posts, hasNextPage: ${hasNextPage}`)

      // Safety check to prevent infinite loops
      if (pageCount > 20) {
        console.log('🚨 Safety break: reached maximum page limit')
        break
      }
    }

    // Create the final response structure
    const allPostsResponse: PostsResponse = {
      posts: {
        edges: allPosts,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: allPosts[0]?.cursor || '',
          endCursor: allPosts[allPosts.length - 1]?.cursor || '',
        },
      },
    }

    // Cache the complete result for 24 hours
    setCachedData(cacheKey, allPostsResponse, 24 * 60 * 60 * 1000)

    console.log(`🎉 Successfully fetched ALL posts for ${date}! Total: ${allPosts.length} posts across ${pageCount} pages`)
    return allPostsResponse
  } catch (error) {
    console.error('🚨 Error fetching all Product Hunt posts', error)
    throw error
  }
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayDate(): string {
  return formatDate(new Date())
}

export async function fetchProductHuntVotes(params: { date?: string; first?: number }) {
  const { date, first = 50 } = params

  // If date is provided, set the time range for that day
  let postedAfter: string | undefined
  let postedBefore: string | undefined

  if (date) {
    // Parse the date string (YYYY-MM-DD) in local timezone
    const [year, month, day] = date.split('-').map(Number)

    // Set the time range for that day in local timezone
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)

    postedAfter = startOfDay.toISOString()
    postedBefore = endOfDay.toISOString()
  }

  const variables = {
    first,
    postedAfter,
    postedBefore,
  }

  console.log('⚡ Fetching vote counts only (low complexity)', { variables })

  try {
    // Get access token first
    const accessToken = await getAccessToken()

    const response = await fetch(PRODUCT_HUNT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: VOTES_QUERY,
        variables,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch votes: ${response.status} ${response.statusText}`)
    }

    // Log rate limit headers
    const rateLimitLimit = response.headers.get('X-Rate-Limit-Limit')
    const rateLimitRemaining = response.headers.get('X-Rate-Limit-Remaining')
    const rateLimitReset = response.headers.get('X-Rate-Limit-Reset')

    if (rateLimitLimit) {
      console.log('⚡ Rate Limit Status (votes query):', {
        limit: rateLimitLimit,
        remaining: rateLimitRemaining,
        resetInSeconds: rateLimitReset,
        percentUsed: Math.round(((Number(rateLimitLimit) - Number(rateLimitRemaining)) / Number(rateLimitLimit)) * 100),
      })
    }

    const data = await response.json()

    if (data.errors) {
      console.log('🚨 GraphQL errors', data.errors)
      throw new Error(data.errors[0]?.message || 'GraphQL error')
    }

    // Extract vote counts into a simple object
    const votes: Record<string, number> = {}
    data.data?.posts?.edges?.forEach((edge: { node: { id: string; votesCount: number } }) => {
      votes[edge.node.id] = edge.node.votesCount
    })

    console.log('✅ Successfully fetched vote counts', Object.keys(votes).length, 'posts')
    return votes
  } catch (error) {
    console.error('🚨 Error fetching vote counts', error)
    throw error
  }
}
