export interface User {
  id: string
  name: string
  username: string
  profileImage?: string
  headline?: string
}

export interface Post {
  id: string
  name: string
  tagline: string
  description: string
  slug: string
  votesCount: number
  commentsCount: number
  createdAt: string
  featuredAt?: string
  website?: string
  thumbnail?: Media
  media: Media[]
  user: User
  makers: User[]
  topics: {
    edges: Array<{
      node: Topic
    }>
  }
  url: string
}

export interface Media {
  type: string
  url: string
  videoUrl?: string
}

export interface Topic {
  id: string
  name: string
  slug: string
}

export interface PostsResponse {
  posts: {
    edges: Array<{
      node: Post
      cursor: string
    }>
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor: string
      endCursor: string
    }
  }
}
