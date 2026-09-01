import { cn } from '@/shared/lib/utils'
import type { FindingImpact } from '@/features/findings/types/finding'
import { FINDING_IMPACT_LABELS } from '@/features/findings/types/finding'
import { IMPACT_LAMP } from '@/features/findings/lib/impact'

export function ImpactLamp({
  impact,
  size = 'md',
  showLabel = false,
  lit = true,
}: {
  impact: FindingImpact
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  lit?: boolean
}) {
  const lamp = IMPACT_LAMP[impact]
  const well = size === 'sm' ? 'size-7' : size === 'lg' ? 'size-12' : 'size-10'
  const dot = size === 'sm' ? 'size-3.5' : size === 'lg' ? 'size-6' : 'size-5'

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          'grid place-items-center rounded-full bg-black/30 ring-2',
          well,
          lamp.ring,
          lit && lamp.glow,
        )}
        aria-hidden
      >
        <span
          className={cn(
            'rounded-full',
            dot,
            lamp.fill,
            lit ? 'opacity-100' : 'opacity-45',
          )}
        />
      </span>
      {showLabel ? (
        <span className={cn('text-sm font-semibold', lamp.text)}>
          {FINDING_IMPACT_LABELS[impact]}
        </span>
      ) : (
        <span className="sr-only">{FINDING_IMPACT_LABELS[impact]}</span>
      )}
    </span>
  )
}
