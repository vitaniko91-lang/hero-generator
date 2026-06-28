import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

export type PanelPadding = 'none' | 'sm' | 'md' | 'lg'

interface PanelProps {
  children?: ReactNode
  /** Add a hairline border in addition to the soft shadow. */
  bordered?: boolean
  padding?: PanelPadding
  className?: string
  /** Render as <section> etc. when the surface is a landmark. */
  as?: 'div' | 'section' | 'article' | 'aside'
}

const PADDING: Record<PanelPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

// The tactile container behind every input / preview / code surface: rounded,
// white, soft layered shadow. Rounded-xl (16px) per the Playful Maker shape
// language.
export default function Panel({
  children,
  bordered = false,
  padding = 'md',
  className,
  as: Tag = 'div',
}: PanelProps) {
  return (
    <Tag
      className={cx(
        'bg-bg-panel rounded-xl shadow-soft',
        bordered && 'border border-line',
        PADDING[padding],
        className,
      )}
    >
      {children}
    </Tag>
  )
}
