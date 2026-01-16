import { useCallback, useMemo, useState } from 'react'

const STORAGE_KEY = 'langlearn.countdownSeconds'
const DEFAULT_SECONDS = 5
const MIN_SECONDS = 2
const MAX_SECONDS = 15

const clampSeconds = (value: number) =>
  Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, value))

const readInitialValue = () => {
  if (typeof window === 'undefined') return DEFAULT_SECONDS
  const stored = window.localStorage.getItem(STORAGE_KEY)
  const parsed = stored ? Number(stored) : DEFAULT_SECONDS
  if (Number.isNaN(parsed)) return DEFAULT_SECONDS
  return clampSeconds(parsed)
}

export const useCountdownSetting = () => {
  const [seconds, setSeconds] = useState(readInitialValue)

  const updateSeconds = useCallback((nextValue: number) => {
    const clamped = clampSeconds(nextValue)
    setSeconds(clamped)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, String(clamped))
    }
  }, [])

  return useMemo(
    () => ({
      seconds,
      updateSeconds,
      min: MIN_SECONDS,
      max: MAX_SECONDS,
    }),
    [seconds, updateSeconds],
  )
}
