import type { ButtonHTMLAttributes, ElementType, MouseEvent, ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { Icon } from '@iconify/react'
import { cx } from '../lib/cx'
import { magneticSpring } from '../lib/motion'
import { useReducedMotion } from '../lib/useReducedMotion'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'md' | 'lg'

interface ButtonOwnProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Iconify name rendered before the label, e.g. "lucide:sparkles". */
  leadingIcon?: string
  /** Iconify name rendered after the label, e.g. "lucide:arrow-right". */
  trailingIcon?: string
  /** Renders an <a> instead of a <button> when set. */
  href?: string
  target?: string
  rel?: string
  children?: ReactNode
  className?: string
}

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>

const BASE =
  'inline-flex items-center justify-center gap-2 font-display font-medium rounded-lg select-none ' +
  'duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo ' +
  'outline-offset-2 disabled:opacity-50 disabled:pointer-events-none ' +
  'aria-disabled:opacity-50 aria-disabled:pointer-events-none'

// Each variant declares its own transition-property list. Primary's transform is
// owned by motion (magnetic), so it deliberately omits transform from CSS.
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo text-white shadow-soft transition-[background-color,box-shadow] hover:bg-[#4A3FD4] hover:shadow-lift active:scale-95',
  secondary:
    'bg-bg-panel text-ink border border-line transition-[background-color,transform] hover:bg-bg-sunk active:scale-[0.97]',
  ghost:
    'bg-transparent text-ink-soft transition-[color,transform] hover:text-ink active:scale-[0.97]',
}

const SIZES: Record<ButtonSize, string> = {
  md: 'px-5 py-2.5 text-[15px]',
  lg: 'px-7 py-3.5 text-base',
}

const ICON_SIZE: Record<ButtonSize, string> = {
  md: 'h-[18px] w-[18px]',
  lg: 'h-5 w-5',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  href,
  target,
  rel,
  className,
  children,
  disabled,
  type,
  ...rest
}: ButtonProps) {
  const reduced = useReducedMotion()
  // Subtle magnetic pull — primary CTA only, mouse-driven, off under reduced
  // motion. Touch devices never fire mousemove, so no extra gating needed.
  const magnetic = variant === 'primary' && !reduced

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, magneticSpring)
  const sy = useSpring(y, magneticSpring)

  const handleMove = (e: MouseEvent<HTMLElement>) => {
    if (!magnetic) return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.22)
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.4)
  }
  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  // Magnetic path lets motion own the transform; otherwise CSS handles the
  // press scale, so it needs a transform transition.
  const motionProps = magnetic
    ? {
        style: { x: sx, y: sy },
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.95 },
        transition: { type: 'spring' as const, stiffness: 500, damping: 26 },
        onMouseMove: handleMove,
        onMouseLeave: handleLeave,
      }
    : {}

  const classes = cx(BASE, SIZES[size], VARIANTS[variant], className)

  const Comp = (href ? motion.a : motion.button) as ElementType
  const elementProps = href
    ? { href, target, rel, 'aria-disabled': disabled || undefined }
    : { type: type ?? 'button', disabled }

  return (
    <Comp className={classes} {...motionProps} {...elementProps} {...rest}>
      {leadingIcon && (
        <Icon icon={leadingIcon} className={ICON_SIZE[size]} aria-hidden="true" />
      )}
      {children}
      {trailingIcon && (
        <Icon icon={trailingIcon} className={ICON_SIZE[size]} aria-hidden="true" />
      )}
    </Comp>
  )
}
