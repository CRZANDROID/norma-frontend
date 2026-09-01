import { cn } from '@/shared/lib/utils'
import type { FindingImpact, FindingListItem } from '@/features/findings/types/finding'
import {
  FINDING_IMPACTS,
  FINDING_IMPACT_HINTS,
  FINDING_IMPACT_LABELS,
} from '@/features/findings/types/finding'
import { IMPACT_LAMP } from '@/features/findings/lib/impact'
import { ImpactLamp } from '@/features/findings/components/ImpactLamp'

export function ImpactFilter({
  items,
  selected,
  onSelect,
}: {
  items: FindingListItem[]
  selected: FindingImpact | null
  onSelect: (impact: FindingImpact | null) => void
}) {
  const counts = Object.fromEntries(
    FINDING_IMPACTS.map((impact) => [
      impact,
      items.filter((row) => row.impact === impact).length,
    ]),
  ) as Record<FindingImpact, number>

  return (
    <div
      className="grid grid-cols-4"
      role="group"
      aria-label="Filtrar por impacto"
    >
      {FINDING_IMPACTS.map((impact) => {
        const lamp = IMPACT_LAMP[impact]
        const isOn = selected === impact
        const dim = selected !== null && !isOn
        const count = counts[impact]
        const hallazgos = count === 1 ? '1 hallazgo' : `${count} hallazgos`
        return (
          <button
            key={impact}
            type="button"
            aria-pressed={isOn}
            aria-label={`${FINDING_IMPACT_LABELS[impact]}: ${FINDING_IMPACT_HINTS[impact]}. ${hallazgos}`}
            onClick={() => onSelect(isOn ? null : impact)}
            className={cn(
              'flex min-h-11 items-center gap-2.5 px-3 py-2.5 text-left transition-[background-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
              'focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-norma-accent-soft/80',
              'motion-safe:active:scale-[0.99]',
              isOn ? 'bg-white/12' : 'hover:bg-white/[0.06]',
              dim && 'opacity-40',
            )}
          >
            <ImpactLamp impact={impact} size="sm" lit={!dim} />
            <span className="min-w-0">
              <span className="block truncate font-display text-xs font-semibold text-white">
                {FINDING_IMPACT_LABELS[impact]}
              </span>
              <span
                className={cn(
                  'mt-0.5 block font-mono text-xs tabular-nums',
                  isOn ? lamp.text : 'text-white/65',
                )}
              >
                {count}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
