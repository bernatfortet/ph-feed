import { atom } from 'nanostores'

interface ActiveVideo {
  id: string
  stop: () => void
}

export const activeVideoStore = atom<ActiveVideo | null>(null)

export function setActiveVideo(id: string, stopFn: () => void) {
  const currentActive = activeVideoStore.get()

  // Stop the currently active video if it's different
  if (currentActive && currentActive.id !== id) {
    console.log('🛑 stopping previous video', currentActive.id)
    currentActive.stop()
  }

  console.log('🏁 setting active video', id)
  activeVideoStore.set({ id, stop: stopFn })
}

export function clearActiveVideo(id: string) {
  const currentActive = activeVideoStore.get()
  if (currentActive?.id === id) {
    console.log('✅ clearing active video', id)
    activeVideoStore.set(null)
  }
}

export function stopActiveVideo() {
  const currentActive = activeVideoStore.get()
  if (currentActive) {
    console.log('🛑 stopping active video', currentActive.id)
    currentActive.stop()
    activeVideoStore.set(null)
  }
}
