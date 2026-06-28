import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '../lib/useReducedMotion'

export interface SparkleBurstHandle {
  fire: () => void
}

interface SparkleBurstProps {
  /** Bump this number to fire a burst (e.g. on Generate / Copy success). */
  trigger?: number
  /** Particle count. */
  count?: number
  className?: string
}

const COLORS = ['#FF6B5C', '#FFC44D', '#5B4DF0'] // coral, sunshine, indigo

interface Particle {
  angle: number
  distance: number
  size: number
  color: string
  delay: number
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    return {
      angle,
      distance: 26 + Math.random() * 30,
      size: 5 + Math.random() * 4,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.06,
    }
  })
}

function Burst({ count, onDone }: { count: number; onDone: () => void }) {
  const particles = useMemo(() => makeParticles(count), [count])

  useEffect(() => {
    const t = setTimeout(onDone, 650)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <>
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ x: '-50%', y: '-50%', scale: 0.3, opacity: 1 }}
          animate={{
            x: `calc(-50% + ${Math.cos(p.angle) * p.distance}px)`,
            y: `calc(-50% + ${Math.sin(p.angle) * p.distance}px)`,
            scale: [0.3, 1, 0.6],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.6, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

// A small celebratory particle burst (coral / sunshine / indigo) for Generate &
// Copy success. Pure transform + opacity, ~600ms, self-cleaning. Wrap in a
// `position: relative` parent. Renders nothing under reduced motion (no-op).
const SparkleBurst = forwardRef<SparkleBurstHandle, SparkleBurstProps>(
  function SparkleBurst({ trigger = 0, count = 12, className }, ref) {
    const reduced = useReducedMotion()
    const [bursts, setBursts] = useState<number[]>([])
    const prevTrigger = useRef(trigger)

    const fire = useCallback(() => {
      if (reduced) return
      setBursts((b) => [...b, Date.now() + Math.random()])
    }, [reduced])

    useImperativeHandle(ref, () => ({ fire }), [fire])

    useEffect(() => {
      if (trigger !== prevTrigger.current) {
        prevTrigger.current = trigger
        fire()
      }
    }, [trigger, fire])

    if (reduced) return null

    return (
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-20 ${className ?? ''}`}
      >
        <AnimatePresence>
          {bursts.map((id) => (
            <Burst
              key={id}
              count={count}
              onDone={() => setBursts((b) => b.filter((x) => x !== id))}
            />
          ))}
        </AnimatePresence>
      </span>
    )
  },
)

export default SparkleBurst
