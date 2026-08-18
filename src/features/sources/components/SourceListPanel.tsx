import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Plus, Search } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type {
  Source,
  SourceCategory,
  SourcePlatform,
} from '@/features/sources/types/source'
import {
  SOURCE_CATEGORIES,
  SOURCE_CATEGORY_LABELS,
  SOURCE_PLATFORM_LABELS,
  SOURCE_PLATFORMS,
} from '@/features/sources/types/source'
import {
  FEDERAL_STATE_VALUE,
  MEXICAN_STATES,
  stateCodeLabel,
} from '@/features/sources/lib/mexican-states'
import { StatusBadge } from '@/features/sources/components/chips'
import { duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

const FILTER_ALL = '__all__'

const rowFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-norma-surface'

export function SourceListPanel({
  sources,
  selectedId,
  loading,
  query,
  includeInactive,
  categoryFilter,
  platformFilter,
  stateFilter,
  canCreate,
  itemTo,
  onQueryChange,
  onIncludeInactiveChange,
  onCategoryFilterChange,
  onPlatformFilterChange,
  onStateFilterChange,
  onCreate,
  maxHeight,
}: {
  sources: Source[]
  selectedId?: string
  loading: boolean
  query: string
  includeInactive: boolean
  categoryFilter: SourceCategory | ''
  platformFilter: SourcePlatform | ''
  stateFilter: string
  canCreate: boolean
  itemTo: (id: string) => string
  onQueryChange: (q: string) => void
  onIncludeInactiveChange: (v: boolean) => void
  onCategoryFilterChange: (v: SourceCategory | '') => void
  onPlatformFilterChange: (v: SourcePlatform | '') => void
  onStateFilterChange: (v: string) => void
  onCreate: () => void
  /** Si la lista supera esta altura (p. ej. del detalle), hace scroll interno. */
  maxHeight?: number | null
}) {
  const reduceMotion = useReducedMotion()
  const [listOpen, setListOpen] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div
      className="flex w-full flex-col self-start overflow-hidden rounded-3xl border-2 border-norma-border bg-norma-surface shadow-[0_12px_32px_-18px_rgba(13,27,42,0.35)]"
      style={
        maxHeight != null && maxHeight > 0
          ? { maxHeight: `${Math.round(maxHeight)}px` }
          : undefined
      }
    >
      <div className="shrink-0 space-y-3 border-b-2 border-norma-border bg-norma-raised/80 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-semibold tracking-wide text-balance">
            Fuentes
          </h2>
          <div className="flex items-center gap-1.5">
            {canCreate ? (
              <Button size="sm" onClick={onCreate} aria-label="Nueva fuente">
                <Plus className="size-4" aria-hidden />
                Nueva
              </Button>
            ) : null}
            <button
              type="button"
              aria-expanded={listOpen}
              aria-controls="source-list-body"
              onClick={() => setListOpen((v) => !v)}
              className={cn(
                'inline-flex size-9 items-center justify-center rounded-xl border-2 border-norma-border bg-norma-surface text-norma-muted transition-colors hover:text-norma-fg',
                rowFocus,
              )}
              aria-label={listOpen ? 'Ocultar lista' : 'Mostrar lista'}
            >
              <motion.span
                animate={{ rotate: listOpen ? 180 : 0 }}
                transition={{ duration: duration.fast, ease: easeOut }}
                className="inline-flex"
              >
                <ChevronDown className="size-4" aria-hidden />
              </motion.span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-norma-border bg-norma-surface/60">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-norma-subtle"
              aria-hidden
            />
            <input
              className="h-11 w-full border-0 bg-transparent pr-3 pl-9 text-sm text-norma-fg outline-none placeholder:text-norma-subtle"
              type="search"
              name="source-search"
              autoComplete="off"
              spellCheck={false}
              aria-label="Buscar fuentes"
              placeholder="Buscar por nombre o identificador…"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onFocus={() => setListOpen(true)}
            />
          </div>
          <div className="space-y-2 border-t border-norma-border/80 p-2">
            <label className="sr-only" htmlFor="source-category-filter">
              Categoría
            </label>
            <Select
              id="source-category-filter"
              aria-label="Categoría"
              value={categoryFilter || FILTER_ALL}
              onValueChange={(v) =>
                onCategoryFilterChange(
                  v === FILTER_ALL ? '' : (v as SourceCategory),
                )
              }
              options={[
                { value: FILTER_ALL, label: 'Todas las categorías' },
                ...SOURCE_CATEGORIES.map((c) => ({
                  value: c,
                  label: SOURCE_CATEGORY_LABELS[c],
                })),
              ]}
            />
            <label className="sr-only" htmlFor="source-platform-filter">
              Plataforma
            </label>
            <Select
              id="source-platform-filter"
              aria-label="Plataforma"
              value={platformFilter || FILTER_ALL}
              onValueChange={(v) =>
                onPlatformFilterChange(
                  v === FILTER_ALL ? '' : (v as SourcePlatform),
                )
              }
              options={[
                { value: FILTER_ALL, label: 'Todas las plataformas' },
                ...SOURCE_PLATFORMS.map((p) => ({
                  value: p,
                  label: SOURCE_PLATFORM_LABELS[p],
                })),
              ]}
            />
            <label className="sr-only" htmlFor="source-state-filter">
              Entidad federativa
            </label>
            <Select
              id="source-state-filter"
              aria-label="Entidad federativa"
              value={stateFilter || FILTER_ALL}
              onValueChange={(v) =>
                onStateFilterChange(v === FILTER_ALL ? '' : v)
              }
              options={[
                { value: FILTER_ALL, label: 'Todas las entidades' },
                { value: FEDERAL_STATE_VALUE, label: 'Federal' },
                ...MEXICAN_STATES.map((s) => ({
                  value: s.code,
                  label: s.name,
                })),
              ]}
            />
            <label className="flex min-h-9 cursor-pointer items-center gap-2 px-1 text-xs text-norma-muted">
              <input
                type="checkbox"
                className="size-3.5 rounded border-norma-border accent-norma-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/40"
                checked={includeInactive}
                onChange={(e) => onIncludeInactiveChange(e.target.checked)}
              />
              Incluir pausadas
            </label>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {listOpen ? (
          <motion.div
            id="source-list-body"
            key="list"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: duration.ui, ease: easeOut }}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            <div className="p-2">
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
                    const clients = source.clients ?? []
                    const expanded = expandedIds.has(source.id)
                    return (
                      <motion.li
                        key={source.id}
                        initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: duration.ui,
                          ease: easeOut,
                          delay: reduceMotion
                            ? 0
                            : Math.min(index * 0.04, 0.2),
                        }}
                        className={cn(
                          'overflow-hidden rounded-2xl',
                          active && 'bg-norma-accent/10',
                        )}
                      >
                        <div className="relative flex items-stretch">
                          {active ? (
                            <motion.span
                              layoutId={
                                reduceMotion ? undefined : 'source-active'
                              }
                              className="absolute inset-y-2 left-0 w-1 rounded-full bg-norma-accent"
                              transition={{
                                duration: duration.ui,
                                ease: easeOut,
                              }}
                            />
                          ) : null}
                          <Link
                            to={itemTo(source.id)}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'min-w-0 flex-1 rounded-2xl px-3 py-3 pl-4 text-left transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
                              rowFocus,
                              !active && 'hover:bg-norma-raised',
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                  {source.name}
                                </p>
                                <p className="truncate font-mono text-[11px] text-norma-subtle">
                                  {source.code}
                                  {clients.length > 0
                                    ? ` · ${clients.length} cliente${clients.length === 1 ? '' : 's'}`
                                    : ''}
                                </p>
                                <p className="mt-0.5 truncate text-[11px] text-norma-muted">
                                  {stateCodeLabel(source.stateCode)}
                                  {' · '}
                                  {SOURCE_CATEGORY_LABELS[source.category]}
                                  {' · '}
                                  {SOURCE_PLATFORM_LABELS[source.platform]}
                                </p>
                              </div>
                              <StatusBadge status={source.status} />
                            </div>
                          </Link>
                          <button
                            type="button"
                            aria-expanded={expanded}
                            aria-label={
                              expanded
                                ? `Ocultar clientes de ${source.name}`
                                : `Ver clientes de ${source.name}`
                            }
                            onClick={() => toggleExpanded(source.id)}
                            className={cn(
                              'm-1 inline-flex size-9 shrink-0 items-center justify-center self-center rounded-xl text-norma-muted transition-colors hover:bg-norma-raised hover:text-norma-fg',
                              rowFocus,
                            )}
                          >
                            <motion.span
                              animate={{ rotate: expanded ? 180 : 0 }}
                              transition={{
                                duration: duration.fast,
                                ease: easeOut,
                              }}
                              className="inline-flex"
                            >
                              <ChevronDown className="size-4" aria-hidden />
                            </motion.span>
                          </button>
                        </div>

                        <AnimatePresence initial={false}>
                          {expanded ? (
                            <motion.div
                              key="links"
                              initial={
                                reduceMotion
                                  ? false
                                  : { height: 0, opacity: 0 }
                              }
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={
                                reduceMotion
                                  ? { opacity: 0 }
                                  : { height: 0, opacity: 0 }
                              }
                              transition={{
                                duration: duration.fast,
                                ease: easeOut,
                              }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-norma-border/60 px-3 pt-2 pb-3 pl-4">
                                {clients.length === 0 ? (
                                  <p className="text-[11px] text-norma-subtle">
                                    Sin clientes vinculados.
                                  </p>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5">
                                    {clients.map((client) => (
                                      <Link
                                        key={client.id}
                                        to={`/clientes/${client.id}?tab=datos`}
                                        className="inline-flex max-w-full truncate rounded-full bg-norma-accent/12 px-2.5 py-1 text-[11px] font-semibold text-norma-accent ring-1 ring-norma-accent/15 transition-colors hover:bg-norma-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
                                      >
                                        {client.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </motion.li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        ) : (
          <p className="px-4 py-3 text-[11px] text-norma-subtle">
            Lista oculta — despliega para ver fuentes.
          </p>
        )}
      </AnimatePresence>
    </div>
  )
}
