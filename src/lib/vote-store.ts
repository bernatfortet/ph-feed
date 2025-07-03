import { atom } from 'nanostores'

export const voteLoadingStore = atom<boolean>(false)

export function setVoteLoading(loading: boolean) {
  console.log('⚡ Vote loading state:', loading)
  voteLoadingStore.set(loading)
}

export function getVoteLoading(): boolean {
  return voteLoadingStore.get()
}
