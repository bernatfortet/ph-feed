import { PostsResponse } from '~/types/product-hunt.types'

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
          slug
          votesCount
          commentsCount
          createdAt
          featuredAt
          website
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
            id
            name
            username
            profileImage
            headline
          }
          makers {
            id
            name
            username
            profileImage
            headline
          }
          topics {
            edges {
              node {
                id
                name
                slug
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

  console.log('🌀 Fetching Product Hunt posts', { variables })

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

    const data = await response.json()

    if (data.errors) {
      console.log('🚨 GraphQL errors', data.errors)
      throw new Error(data.errors[0]?.message || 'GraphQL error')
    }

    console.log('✅ Successfully fetched Product Hunt posts', data.data?.posts?.edges?.length)
    return data.data as PostsResponse
  } catch (error) {
    console.error('🚨 Error fetching Product Hunt posts', error)
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
