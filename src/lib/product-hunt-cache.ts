import { Post } from '~/types/product-hunt.types'

interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

// Cache durations
const DAILY_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const VOTE_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }

  console.log('💾 Cache hit for', key)
  return entry.data as T
}

export function setCachedData<T>(key: string, data: T, duration: number = DAILY_CACHE_DURATION): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + duration,
  }

  cache.set(key, entry)
  console.log('💾 Cached data for', key, 'expires in', Math.round(duration / 1000 / 60), 'minutes')
}

export function getCachedPosts(date: string): Post[] | null {
  return getCachedData<Post[]>(`posts-${date}`)
}

export function setCachedPosts(date: string, posts: Post[]): void {
  setCachedData(`posts-${date}`, posts, DAILY_CACHE_DURATION)
}

export function getCachedVotes(date: string): Record<string, number> | null {
  return getCachedData<Record<string, number>>(`votes-${date}`)
}

export function setCachedVotes(date: string, votes: Record<string, number>): void {
  setCachedData(`votes-${date}`, votes, VOTE_CACHE_DURATION)
}

export function getCacheStats(): Record<string, unknown> {
  const now = Date.now()
  return {
    totalEntries: cache.size,
    entries: Array.from(cache.entries()).map(([key, entry]) => ({
      key,
      age: Math.round((now - entry.timestamp) / 1000 / 60), // minutes
      expiresIn: Math.round((entry.expiresAt - now) / 1000 / 60), // minutes
    })),
  }
}
