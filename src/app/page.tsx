'use client'

import { useState } from 'react'
import { Header } from '~/components/header'
import { Feed } from '~/components/feed'

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  return (
    <div className='min-h-screen bg-white'>
      <Header selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <main>
        <Feed selectedDate={selectedDate} />
      </main>
    </div>
  )
}
