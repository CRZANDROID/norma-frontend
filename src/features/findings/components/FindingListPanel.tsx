import { Link } from 'react-router-dom'
import type { FindingListItem } from '@/features/findings/types/finding'
import { FINDING_IMPACT_LABELS } from '@/features/findings/types/finding'
import { IMPACT_LAMP } from '@/features/findings/lib/impact'
import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

const rowFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45 focus-visible:ring-inset'

export function FindingListPanel({
  items,
  selectedId,
  loading,
  itemTo,
}: {
  items: FindingListItem[]
  selectedId?: string
  loading: boolean
  itemTo: (id: string) => string
}) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col bg-norma-surface">
      <div className="shrink-0 border-b border-norma-border px-3 py-2.5">
        <h2 className="font-display text-sm font-semibold tracking-tight">
          Hallazgos
        </h2>
        <p className="mt-0.5 font-mono text-xs tabular-nums text-norma-subtle">
          {loading ? 'Cargando…' : items.length}
        </p>
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        aria-label="Hallazgos"
        aria-busy={loading}
      >
        {loading ? (
          <div
            className="space-y-2 p-3"
            aria-busy="true"
            aria-label="Cargando hallazgos"
          >
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-norma-muted">
            No hay hallazgos con ese filtro.
          </p>
        ) : (
          <ul>
            {items.map((item) => {
              const active = item.id === selectedId
              const lamp = IMPACT_LAMP[item.impact]
              return (
                <li key={item.id} className="[content-visibility:auto]">
                  <Link
                    to={itemTo(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center gap-2.5 border-b border-norma-border/70 px-3 py-2 text-left transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
                      rowFocus,
                      active
                        ? 'bg-norma-raised'
                        : 'hover:bg-norma-raised/70',
                    )}
                  >
                    <span
                      className={cn(
                        'size-2 shrink-0 rounded-full',
                        lamp.fill,
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-norma-subtle">
                        {FINDING_IMPACT_LABELS[item.impact]}
                        {item.source ? ` · ${item.source.name}` : ''}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
