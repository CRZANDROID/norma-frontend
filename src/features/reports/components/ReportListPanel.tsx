import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { ReportListItem } from '@/features/reports/types/report'
import {
  formatReportPeriod,
  reportStatusLabel,
} from '@/features/reports/lib/period'
import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

const rowFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-norma-surface'

export function ReportListPanel({
  items,
  selectedId,
  loading,
  itemTo,
}: {
  items: ReportListItem[]
  selectedId?: string
  loading: boolean
  itemTo: (id: string) => string
}) {
  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-5"
      aria-label="Informes"
      aria-busy={loading}
    >
      {loading ? (
        <div
          className="space-y-2.5"
          aria-busy="true"
          aria-label="Cargando informes"
        >
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm leading-relaxed text-norma-subtle">
          Nada con esos filtros. Genera un PDF desde Clasificación.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => {
            const active = item.id === selectedId
            return (
              <li key={item.id}>
                <Link
                  to={itemTo(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex w-full items-stretch gap-2 overflow-hidden rounded-2xl border-2 py-3.5 pr-3 pl-4 text-left transition-[background-color,border-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
                    rowFocus,
                    active
                      ? 'border-norma-navy/30 bg-norma-raised'
                      : 'border-norma-border bg-norma-raised/80 hover:border-norma-navy/25 hover:bg-norma-raised',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          item.status === 'sent'
                            ? 'bg-norma-green/12 text-norma-green'
                            : 'bg-norma-amber/15 text-norma-amber',
                        )}
                      >
                        {reportStatusLabel(item.status)}
                      </span>
                      <span className="text-[11px] text-norma-subtle">
                        {formatReportPeriod(item.dateFrom, item.dateTo)}
                      </span>
                    </span>
                    <span className="mt-2 block font-display text-[0.95rem] font-semibold tracking-tight">
                      {item.client.name}
                    </span>
                    <span className="mt-1.5 block text-sm text-norma-muted">
                      {item.findingCount} hallazgo
                      {item.findingCount === 1 ? '' : 's'}
                      {' · '}
                      {item.counts.red} crítico
                      {' · '}
                      {item.counts.orange} alto
                      {' · '}
                      {item.counts.yellow} medio
                    </span>
                  </span>
                  <ChevronRight
                    className="mt-1 size-4 shrink-0 text-norma-subtle"
                    aria-hidden
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
