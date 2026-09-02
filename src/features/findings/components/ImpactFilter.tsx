import { cn } from '@/shared/lib/utils'
import type { FindingImpact, FindingListItem } from '@/features/findings/types/finding'
import {
  FINDING_IMPACT_FILTER_ORDER,
  FINDING_IMPACT_HINTS,
  FINDING_IMPACT_LABELS,
} from '@/features/findings/types/finding'
import { IMPACT_LAMP } from '@/features/findings/lib/impact'

export function ImpactFilter({
  items,
  selected,
  onSelect,
  loading = false,
}: {
  items: FindingListItem[]
  selected: FindingImpact | null
  onSelect: (impact: FindingImpact | null) => void
  loading?: boolean
}) {
  const counts = Object.fromEntries(
    FINDING_IMPACT_FILTER_ORDER.map((impact) => [
      impact,
      items.filter((row) => row.impact === impact).length,
    ]),
  ) as Record<FindingImpact, number>

  const allOn = selected === null
  const chipFocus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45'

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label="Filtrar por impacto"
    >
      <button
        type="button"
        aria-pressed={allOn}
        aria-label={`Todos. ${loading ? 'Cargando' : `${items.length} hallazgos`}`}
        onClick={() => onSelect(null)}
        className={cn(
          'inline-flex min-h-8 items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-semibold transition-[background-color,border-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
          chipFocus,
          'motion-safe:active:scale-[0.99]',
          allOn
            ? 'border-norma-accent/40 bg-norma-accent/10 text-norma-accent'
            : 'border-norma-border bg-norma-surface text-norma-muted hover:bg-norma-raised',
        )}
      >
        Todos
        <span className="font-mono tabular-nums">
          {loading ? '…' : items.length}
        </span>
      </button>
      {FINDING_IMPACT_FILTER_ORDER.map((impact) => {
        const lamp = IMPACT_LAMP[impact]
        const isOn = selected === impact
        const count = counts[impact]
        const hallazgos = count === 1 ? '1 hallazgo' : `${count} hallazgos`
        return (
          <button
            key={impact}
            type="button"
            title={FINDING_IMPACT_HINTS[impact]}
            aria-pressed={isOn}
            aria-label={`${FINDING_IMPACT_LABELS[impact]}: ${FINDING_IMPACT_HINTS[impact]}. ${loading ? 'Cargando' : hallazgos}`}
            onClick={() => onSelect(isOn ? null : impact)}
            className={cn(
              'inline-flex min-h-8 items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-semibold transition-[background-color,border-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
              chipFocus,
              'motion-safe:active:scale-[0.99]',
              isOn
                ? cn('border-transparent', lamp.badge)
                : 'border-norma-border bg-norma-surface text-norma-muted hover:bg-norma-raised',
            )}
          >
            <span
              className={cn('size-2 shrink-0 rounded-full', lamp.fill)}
              aria-hidden
            />
            <span className="hidden sm:inline">
              {FINDING_IMPACT_LABELS[impact]}
            </span>
            <span className="font-mono tabular-nums">
              {loading ? '…' : count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
