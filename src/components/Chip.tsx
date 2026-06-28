import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cx } from '../lib/cx'
import { popSpring } from '../lib/motion'
import { useReducedMotion } from '../lib/useReducedMotion'

interface ChipProps {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}

// Pill selector chip (style presets / tone). A real <button> with aria-pressed
// so it's keyboard-operable and announced as a toggle. Selected fills indigo;
// the springy press doubles as the "pop on select".
export default function Chip({
  selected = false,
  onClick,
  children,
  className,
}: ChipProps) {
  const reduced = useReducedMotion()

  const gestures = reduced
    ? {}
    : {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.93 },
        transition: popSpring,
      }

  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      {...gestures}
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium font-sans',
        'select-none transition-colors focus-visible:outline focus-visible:outline-2',
        'focus-visible:outline-indigo outline-offset-2',
        selected
          ? 'bg-indigo text-white shadow-soft'
          : 'bg-bg-sunk text-ink-soft hover:bg-indigo-dim hover:text-indigo',
        className,
      )}
    >
      {children}
    </motion.button>
  )
}
