import { useCallback, useEffect, useRef, useState } from 'react'

// Copy text to the clipboard and expose a transient `copied` flag that resets
// itself after `resetDelay` ms. The flag drives both the icon swap and the
// aria-live "Copied" announcement in CodeBlock.
export function useCopyToClipboard(resetDelay = 2000): {
  copied: boolean
  copy: (text: string) => Promise<boolean>
} {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        if (
          typeof navigator !== 'undefined' &&
          navigator.clipboard?.writeText
        ) {
          await navigator.clipboard.writeText(text)
        } else {
          return false
        }
        setCopied(true)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), resetDelay)
        return true
      } catch {
        setCopied(false)
        return false
      }
    },
    [resetDelay],
  )

  return { copied, copy }
}
