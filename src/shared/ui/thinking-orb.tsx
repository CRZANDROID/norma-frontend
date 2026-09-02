import { useId } from 'react'
import { ThinkingOrb, type ThinkingOrbProps } from 'thinking-orbs'
import { cn } from '@/shared/lib/utils'

/**
 * thinking-orbs is grayscale only (light/dark ink).
 * Tint light dots to NORMA accent (#6958F8) via an SVG color matrix.
 */
const ACCENT_MATRIX =
  '0.412 0 0 0 0  0 0.345 0 0 0  0 0 0.973 0 0  0 0 0 1 0'

export function NormaThinkingOrb({
  className,
  style,
  ...props
}: Omit<ThinkingOrbProps, 'theme'>) {
  const filterId = `norma-orb-${useId().replace(/:/g, '')}`

  return (
    <span className={cn('relative inline-block', className)}>
      <svg width={0} height={0} className="pointer-events-none absolute" aria-hidden>
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={ACCENT_MATRIX} />
        </filter>
      </svg>
      <ThinkingOrb
        {...props}
        theme="dark"
        style={{ filter: `url(#${filterId})`, ...style }}
      />
    </span>
  )
}
