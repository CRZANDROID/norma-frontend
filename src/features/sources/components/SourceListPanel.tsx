import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { Source, SourceType } from '@/features/sources/types/source'
import {
  SOURCE_TYPE_LABELS,
  SOURCE_TYPES,
} from '@/features/sources/types/source'
import { StatusBadge } from '@/features/sources/components/chips'
import { duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

const TYPE_FILTER_ALL = '__all__'

const rowFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-norma-surface'

export function SourceListPanel({
  sources,
  selectedId,
  loading,
  query,
  includeInactive,
  typeFilter,
  jurisdictionFilter,
  canCreate,
  itemTo,
  onQueryChange,
  onIncludeInactiveChange,
  onTypeFilterChange,
  onJurisdictionFilterChange,
  onCreate,
}: {
  sources: Source[]
  selectedId?: string
  loading: boolean
  query: string
  includeInactive: boolean
  typeFilter: SourceType | ''
  jurisdictionFilter: string
  canCreate: boolean
  itemTo: (id: string) => string
  onQueryChange: (q: string) => void
  onIncludeInactiveChange: (v: boolean) => void
  onTypeFilterChange: (v: SourceType | '') => void
  onJurisdictionFilterChange: (v: string) => void
  onCreate: () => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-3xl border-2 border-norma-border bg-norma-surface shadow-[0_12px_32px_-18px_rgba(13,27,42,0.35)]">
      <div className="space-y-3 border-b-2 border-norma-border bg-norma-raised/80 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-semibold tracking-wide text-balance">
            Fuentes
          </h2>
          {canCreate ? (
            <Button size="sm" onClick={onCreate} aria-label="Nueva fuente">
              <Plus className="size-4" aria-hidden />
              Nueva
            </Button>
          ) : null}
        </div>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-norma-subtle"
            aria-hidden
          />
          <Input
            className="pl-9"
            type="search"
            name="source-search"
            autoComplete="off"
            spellCheck={false}
            aria-label="Buscar fuentes"
            placeholder="Buscar por nombre o código…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label className="sr-only" htmlFor="source-type-filter">
            Tipo
          </label>
          <Select
            id="source-type-filter"
            aria-label="Tipo"
            value={typeFilter || TYPE_FILTER_ALL}
            onValueChange={(v) =>
              onTypeFilterChange(
                v === TYPE_FILTER_ALL ? '' : (v as SourceType),
              )
            }
            options={[
              { value: TYPE_FILTER_ALL, label: 'Todos los tipos' },
              ...SOURCE_TYPES.map((t) => ({
                value: t,
                label: SOURCE_TYPE_LABELS[t],
              })),
            ]}
          />
          <label className="sr-only" htmlFor="source-jurisdiction-filter">
            Jurisdicción
          </label>
          <Input
            id="source-jurisdiction-filter"
            name="jurisdiction"
            autoComplete="off"
            spellCheck={false}
            aria-label="Filtrar por jurisdicción"
            placeholder="Jurisdicción (ej. federal, JAL)"
            value={jurisdictionFilter}
            onChange={(e) => onJurisdictionFilterChange(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-norma-muted">
          <input
            type="checkbox"
            className="size-3.5 rounded border-norma-border accent-norma-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/40"
            checked={includeInactive}
            onChange={(e) => onIncludeInactiveChange(e.target.checked)}
          />
          Incluir pausadas
        </label>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : sources.length === 0 ? (
          <p className="p-4 text-sm text-norma-muted">
            No hay fuentes con ese filtro.
          </p>
        ) : (
          <ul className="space-y-1">
            {sources.map((source, index) => {
              const active = source.id === selectedId
              return (
                <motion.li
                  key={source.id}
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: duration.ui,
                    ease: easeOut,
                    delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.2),
                  }}
                >
                  <Link
                    to={itemTo(source.id)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative block w-full rounded-2xl px-3 py-3 text-left transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
                      rowFocus,
                      active
                        ? 'bg-norma-accent/10 text-norma-fg'
                        : 'hover:bg-norma-raised',
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId={reduceMotion ? undefined : 'source-active'}
                        className="absolute inset-y-2 left-0 w-1 rounded-full bg-norma-accent"
                        transition={{ duration: duration.ui, ease: easeOut }}
                      />
                    ) : null}
                    <div className="flex items-start justify-between gap-2 pl-1">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {source.name}
                        </p>
                        <p className="truncate font-mono text-[11px] text-norma-subtle">
                          {source.code}
                          {source.jurisdiction
                            ? ` · ${source.jurisdiction}`
                            : ''}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-norma-muted">
                          {SOURCE_TYPE_LABELS[source.type]}
                        </p>
                      </div>
                      <StatusBadge status={source.status} />
                    </div>
                  </Link>
                </motion.li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
