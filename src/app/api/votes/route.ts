import { NextRequest, NextResponse } from 'next/server'
import { fetchProductHuntVotes } from '~/lib/product-hunt-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    console.log('🏁 Starting votes API request for date:', date)

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    const votes = await fetchProductHuntVotes({ date })

    console.log('✅ Votes API request completed successfully')
    return NextResponse.json({ votes })
  } catch (error) {
    console.error('🚨 Votes API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Internal server error'

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
