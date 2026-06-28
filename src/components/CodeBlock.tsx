import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Icon } from '@iconify/react'
import { cx } from '../lib/cx'
import { useCopyToClipboard } from '../lib/useCopyToClipboard'
import { useReducedMotion } from '../lib/useReducedMotion'
import SparkleBurst from './SparkleBurst'

interface CodeBlockProps {
  code: string
  /** Shown as the small label in the header, e.g. "tsx". */
  language?: string
  className?: string
}

// A sunken code well with a Copy button. Copy state announces via an aria-live
// region and fires a little sparkle burst (reduced motion: just the checkmark +
// label, no burst). Long lines scroll horizontally.
export default function CodeBlock({ code, language, className }: CodeBlockProps) {
  const reduced = useReducedMotion()
  const { copied, copy } = useCopyToClipboard()
  const [burst, setBurst] = useState(0)

  const handleCopy = async () => {
    const ok = await copy(code)
    if (ok && !reduced) setBurst((b) => b + 1)
  }

  return (
    <div className={cx('relative overflow-hidden rounded-lg bg-bg-sunk', className)}>
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          {language ?? 'code'}
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy code'}
            className={cx(
              'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[12px] font-medium font-sans',
              'transition-[color,background-color,transform] duration-150 ease-out',
              'text-ink-soft hover:bg-bg-panel hover:text-ink active:scale-95',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo outline-offset-2',
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? 'check' : 'copy'}
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
                className="inline-flex"
              >
                <Icon
                  icon={copied ? 'lucide:check' : 'lucide:copy'}
                  className={cx('h-4 w-4', copied && 'text-indigo')}
                  aria-hidden="true"
                />
              </motion.span>
            </AnimatePresence>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <SparkleBurst trigger={burst} count={10} />
        </div>
      </div>

      <pre className="overflow-x-auto px-4 py-3.5 text-[13px] leading-relaxed">
        <code className="font-mono text-ink">{code}</code>
      </pre>

      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </div>
  )
}
