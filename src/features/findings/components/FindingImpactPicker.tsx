/** Selector de semáforo. Montarlo en FindingDetailCard (hoy comentado). */
import { cn } from '@/shared/lib/utils'
import type { FindingImpact } from '@/features/findings/types/finding'
import {
  FINDING_IMPACT_FILTER_ORDER,
  FINDING_IMPACT_HINTS,
  FINDING_IMPACT_LABELS,
} from '@/features/findings/types/finding'
import { IMPACT_LAMP } from '@/features/findings/lib/impact'

export function FindingImpactPicker({
  value,
  disabled = false,
  onChange,
}: {
  value: FindingImpact
  disabled?: boolean
  onChange: (impact: FindingImpact) => void
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-1"
      role="radiogroup"
      aria-label="Semáforo"
    >
      {FINDING_IMPACT_FILTER_ORDER.map((impact) => {
        const lamp = IMPACT_LAMP[impact]
        const selected = value === impact
        return (
          <button
            key={impact}
            type="button"
            role="radio"
            aria-checked={selected}
            title={FINDING_IMPACT_HINTS[impact]}
            disabled={disabled}
            onClick={() => {
              if (!selected) onChange(impact)
            }}
            className={cn(
              'inline-flex min-h-8 items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-[11px] font-semibold transition-[background-color,border-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45 motion-safe:active:scale-[0.99] disabled:opacity-50',
              selected
                ? cn('border-transparent', lamp.badge)
                : 'border-norma-border bg-norma-surface text-norma-muted hover:bg-norma-raised',
            )}
          >
            <span
              className={cn('size-1.5 shrink-0 rounded-full', lamp.fill)}
              aria-hidden
            />
            {FINDING_IMPACT_LABELS[impact]}
          </button>
        )
      })}
    </div>
  )
}
