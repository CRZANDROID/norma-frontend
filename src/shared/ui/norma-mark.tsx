import { motion, useReducedMotion } from 'motion/react'
import { brandMarkEnter, brandMarkIdle, duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'

type NormaMarkProps = {
  className?: string
  /** Show mount entrance + soft idle presence. Default true. */
  animated?: boolean
}

/**
 * NORMA brand mark — aperture + focal node.
 * Suggests attentive intelligence (sensing / focus) without brain/robot clichés.
 */
export function NormaMark({ className, animated = true }: NormaMarkProps) {
  const reduceMotion = useReducedMotion()
  const live = animated && !reduceMotion

  return (
    <motion.span
      className={cn(
        'relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-norma-accent text-white shadow-[0_12px_28px_-10px_rgba(105,88,248,0.95)]',
        className,
      )}
      aria-hidden
      initial={live ? brandMarkEnter.initial : false}
      animate={brandMarkEnter.animate}
      transition={
        live
          ? { type: 'spring', duration: 0.48, bounce: 0.14 }
          : { duration: duration.fast, ease: easeOut }
      }
    >
      <svg
        viewBox="0 0 32 32"
        className="size-[22px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer sensing arc — incomplete ring (aperture) */}
        <path
          d="M24.2 16a8.2 8.2 0 1 1-2.4-5.8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* Inner focus ring */}
        <circle
          cx="16"
          cy="16"
          r="4.6"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.9"
        />
        {/* Precision diamond — regulatory “norm” geometry */}
        <path
          d="M16 12.6 19.4 16 16 19.4 12.6 16Z"
          fill="currentColor"
          opacity="0.35"
        />
        {/* Focal intelligence node */}
        <motion.circle
          cx="16"
          cy="16"
          r="1.55"
          fill="currentColor"
          animate={live ? brandMarkIdle.animate : undefined}
          transition={live ? brandMarkIdle.transition : undefined}
        />
        {/* Signal tip on the aperture gap */}
        <circle cx="24.2" cy="16" r="1.35" fill="currentColor" opacity="0.85" />
      </svg>
    </motion.span>
  )
}
