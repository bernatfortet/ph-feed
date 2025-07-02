interface HeaderProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export function Header(props: HeaderProps) {
  const { selectedDate, onDateChange } = props

  return (
    <header className='sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200'>
      <div className='max-w-2xl mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          {/* Logo and title */}
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>PH</span>
            </div>
            <div>
              <h1 className='font-bold text-xl text-gray-900'>Product Hunt – Feed-mode</h1>
            </div>
          </div>

          {/* Date picker */}
          <div className='flex items-center gap-2'>
            <label htmlFor='date-picker' className='text-sm text-gray-600'>
              Date:
            </label>
            <input
              id='date-picker'
              type='date'
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className='px-3 py-1 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent'
              max={getTodayDateString()}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
