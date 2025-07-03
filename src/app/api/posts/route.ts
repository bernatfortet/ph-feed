import { NextRequest, NextResponse } from 'next/server'
import { fetchAllProductHuntPosts } from '~/lib/product-hunt-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    console.log('🏁 Starting API request for date:', date)

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    const data = await fetchAllProductHuntPosts({ date })

    console.log('✅ API request completed successfully')
    return NextResponse.json(data)
  } catch (error) {
    console.error('🚨 API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Internal server error'

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
