import { cn } from '@/shared/lib/utils'
import type {
  FindingImpact,
  FindingLote,
  FindingsListCounts,
} from '@/features/findings/types/finding'
import {
  FINDING_IMPACT_FILTER_ORDER,
  FINDING_IMPACT_HINTS,
  FINDING_IMPACT_LABELS,
} from '@/features/findings/types/finding'
import {
  IMPACT_COUNT_KEY,
  IMPACT_LAMP,
} from '@/features/findings/lib/impact'

const LOTES: Array<{
  id: FindingLote
  label: string
  hint: string
  countKey: 'included' | 'excluded' | 'sent'
}> = [
  {
    id: 'incluidos',
    label: 'Incluidos',
    hint: 'Van al próximo informe',
    countKey: 'included',
  },
  {
    id: 'excluidos',
    label: 'Excluidos',
    hint: 'Aparcados a mano',
    countKey: 'excluded',
  },
  {
    id: 'enviados',
    label: 'Enviados',
    hint: 'Ya salieron en un PDF enviado',
    countKey: 'sent',
  },
]

export function ImpactFilter({
  counts,
  selected,
  onSelect,
  loading = false,
  lote = null,
  onLoteChange,
}: {
  counts: FindingsListCounts
  selected: FindingImpact | null
  onSelect: (impact: FindingImpact | null) => void
  loading?: boolean
  lote?: FindingLote | null
  onLoteChange?: (next: FindingLote | null) => void
}) {
  const allOn = selected === null
  const chipFocus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45'
  const chip =
    'inline-flex min-h-9 items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-semibold transition-[background-color,border-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]'

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="Filtros de semáforo"
      >
        <button
          type="button"
          aria-pressed={allOn}
          aria-label={`Todos. ${loading ? 'Cargando' : `${counts.total} hallazgos`}`}
          onClick={() => onSelect(null)}
          className={cn(
            chip,
            chipFocus,
            'motion-safe:active:scale-[0.99]',
            allOn
              ? 'border-norma-accent/40 bg-norma-accent/10 text-norma-accent'
              : 'border-norma-border bg-norma-surface text-norma-muted hover:bg-norma-raised',
          )}
        >
          Todos
          <span className="font-mono tabular-nums">
            {loading ? '…' : counts.total}
          </span>
        </button>
        {FINDING_IMPACT_FILTER_ORDER.map((impact) => {
          const lamp = IMPACT_LAMP[impact]
          const isOn = selected === impact
          const count = counts[IMPACT_COUNT_KEY[impact]]
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
                chip,
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
      {onLoteChange ? (
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filtros del próximo informe"
        >
          <span className="pr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-norma-subtle">
            Informe
          </span>
          {LOTES.map((item) => {
            const isOn = lote === item.id
            const count = counts[item.countKey]
            return (
              <button
                key={item.id}
                type="button"
                title={item.hint}
                aria-pressed={isOn}
                aria-label={`${item.label}. ${item.hint}. ${loading ? 'Cargando' : `${count}`}`}
                onClick={() => onLoteChange(isOn ? null : item.id)}
                className={cn(
                  chip,
                  chipFocus,
                  'motion-safe:active:scale-[0.99]',
                  isOn
                    ? 'border-norma-navy/25 bg-norma-navy/8 text-norma-navy'
                    : 'border-norma-border bg-norma-surface text-norma-muted hover:bg-norma-raised',
                )}
              >
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.label.slice(0, 3)}</span>
                <span className="font-mono tabular-nums">
                  {loading ? '…' : count}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
