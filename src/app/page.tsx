'use client'

import { useState } from 'react'
import { Header } from '~/components/header'
import { Feed } from '~/components/feed'

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <Header selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <main>
        <Feed selectedDate={selectedDate} />
      </main>
    </div>
  )
}
