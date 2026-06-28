import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { popSpring, reducedFade } from '../lib/motion'
import { useReducedMotion } from '../lib/useReducedMotion'

interface PopInProps {
  children: ReactNode
  /** Trigger on viewport entry (once) instead of on mount. */
  startOnView?: boolean
  delay?: number
  className?: string
}

// Spring entrance wrapper: scale 0.96 -> 1 + fade with a gentle bounce. Under
// reduced motion it becomes a quick fade with no movement.
export default function PopIn({
  children,
  startOnView = false,
  delay = 0,
  className,
}: PopInProps) {
  const reduced = useReducedMotion()

  const initial = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }
  const target = reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }
  const transition = reduced
    ? { ...reducedFade, delay }
    : { ...popSpring, delay }

  const motionProps = startOnView
    ? {
        initial,
        whileInView: target,
        viewport: { once: true, margin: '-80px' },
      }
    : { initial, animate: target }

  return (
    <motion.div className={className} transition={transition} {...motionProps}>
      {children}
    </motion.div>
  )
}
