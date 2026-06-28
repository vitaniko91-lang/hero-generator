import type { Transition } from 'motion/react'

// Shared motion tokens — keep every primitive's springs cohesive (Emil: the
// whole experience should feel like one instrument). Bounce is intentional here:
// Hero Lab is a playful/creative tool, not a productivity utility.

/** Springy "pop" for chip select + result entrances. */
export const popSpring: Transition = { type: 'spring', duration: 0.45, bounce: 0.3 }

/** Calmer spring for sliding indicators / layout moves. */
export const gentleSpring: Transition = { type: 'spring', duration: 0.4, bounce: 0.18 }

/** `useSpring` config for the magnetic primary button (physics form). */
export const magneticSpring = { stiffness: 220, damping: 16, mass: 0.5 } as const

/** Reduced-motion fallback: a quick fade, no movement, no bounce. */
export const reducedFade: Transition = { duration: 0.15, ease: 'easeOut' }
