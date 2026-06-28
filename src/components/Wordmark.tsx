import { Icon } from '@iconify/react'
import { cx } from '../lib/cx'

// The Hero Lab brand mark: an indigo squircle tile with a white spark + a coral
// dot, next to the "Hero Lab" wordmark in Space Grotesk. Shared by the top bar
// and the footer so the brand reads identically in both places. The tile mirrors
// the favicon (indigo squircle + spark + coral dot).
export default function Wordmark({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md'
  className?: string
}) {
  const md = size === 'md'
  return (
    <span className={cx('inline-flex items-center', md ? 'gap-2' : 'gap-1.5', className)}>
      <span
        className={cx(
          'relative grid shrink-0 place-items-center rounded-[8px] bg-indigo text-white shadow-soft',
          md ? 'h-7 w-7' : 'h-6 w-6',
        )}
      >
        <Icon icon="lucide:sparkles" className={md ? 'h-4 w-4' : 'h-3.5 w-3.5'} aria-hidden="true" />
        <span
          aria-hidden="true"
          className={cx(
            'absolute rounded-full bg-coral',
            md ? '-right-0.5 -top-0.5 h-2 w-2' : '-right-0.5 -top-0.5 h-1.5 w-1.5',
          )}
        />
      </span>
      <span
        className={cx(
          'font-display font-bold tracking-tight text-ink',
          md ? 'text-[19px]' : 'text-[16px]',
        )}
      >
        Hero Lab
      </span>
    </span>
  )
}
