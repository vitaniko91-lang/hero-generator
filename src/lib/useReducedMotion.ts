import { useEffect, useState } from 'react'

// Reactive `prefers-reduced-motion: reduce` reader. Every motion primitive uses
// this to swap springs/bounce for a quick fade (or nothing). Subscribes to
// changes so toggling the OS setting updates the UI live.
const QUERY = '(prefers-reduced-motion: reduce)'

function getInitial(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia(QUERY).matches
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(getInitial)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const mql = window.matchMedia(QUERY)
    const onChange = () => setReduced(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}
