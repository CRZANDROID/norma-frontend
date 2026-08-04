import { useEffect, useId, useMemo, useState } from 'react'
import { Check, ChevronDown, Link2, Search, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'

export type EntityLinkOption = {
  id: string
  title: string
  subtitle?: string
  meta?: string
}

type EntityLinkPickerProps = {
  label: string
  helper?: string
  options: EntityLinkOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  loading?: boolean
  disabled?: boolean
  emptyLabel?: string
  searchPlaceholder?: string
  /** Compacto en modales de creación */
  compact?: boolean
  /** Si true, el catálogo arranca abierto */
  defaultOpen?: boolean
}

function idsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((id) => set.has(id))
}

export function EntityLinkPicker({
  label,
  helper,
  options,
  selectedIds,
  onChange,
  loading = false,
  disabled = false,
  emptyLabel = 'No hay opciones disponibles.',
  searchPlaceholder = 'Buscar…',
  compact = false,
  defaultOpen = false,
}: EntityLinkPickerProps) {
  const reduceMotion = useReducedMotion()
  const searchId = useId()
  const listId = useId()
  const panelId = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(defaultOpen)

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        (o.subtitle?.toLowerCase().includes(q) ?? false) ||
        (o.meta?.toLowerCase().includes(q) ?? false),
    )
  }, [options, query])

  const selectedOptions = useMemo(
    () => options.filter((o) => selectedSet.has(o.id)),
    [options, selectedSet],
  )

  useEffect(() => {
    if (query.trim() && !open) setOpen(true)
  }, [query, open])

  function toggle(id: string) {
    if (disabled) return
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((x) => x !== id))
      return
    }
    onChange([...selectedIds, id])
  }

  function selectAllVisible() {
    if (disabled) return
    const next = new Set(selectedIds)
    for (const o of filtered) next.add(o.id)
    onChange([...next])
  }

  function clearAll() {
    if (disabled) return
    onChange([])
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <Label htmlFor={searchId}>{label}</Label>
          {helper ? (
            <p className="text-xs text-norma-subtle">{helper}</p>
          ) : null}
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums',
            selectedIds.length > 0
              ? 'bg-norma-signal/12 text-norma-signal ring-1 ring-norma-signal/20'
              : 'bg-norma-navy/6 text-norma-subtle',
          )}
          aria-live="polite"
        >
          <Link2 className="size-3" aria-hidden />
          {selectedIds.length}{' '}
          {selectedIds.length === 1 ? 'vinculado' : 'vinculados'}
        </span>
      </div>

      {/* Superficie única: búsqueda fija + chips debajo (sin empujar el input) */}
      <div
        className={cn(
          'overflow-hidden rounded-2xl border-2 border-norma-border bg-norma-raised/50',
          disabled && 'opacity-60',
        )}
      >
        <div className="flex min-h-11 items-stretch">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-norma-subtle"
              aria-hidden
            />
            <input
              id={searchId}
              name="entity-link-search"
              type="search"
              autoComplete="off"
              value={query}
              disabled={disabled || loading}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (!disabled) setOpen(true)
              }}
              placeholder={searchPlaceholder}
              aria-controls={listId}
              aria-expanded={open}
              className="h-11 w-full border-0 bg-transparent pr-3 pl-9 text-sm text-norma-fg outline-none placeholder:text-norma-subtle disabled:cursor-not-allowed"
            />
          </div>

          {!disabled && options.length > 0 ? (
            <div className="flex shrink-0 items-center gap-0.5 border-l border-norma-border/80 px-1">
              <button
                type="button"
                disabled={filtered.length === 0 || !open}
                onClick={selectAllVisible}
                className="rounded-xl px-2 py-1.5 text-[11px] font-medium text-norma-signal transition-colors hover:bg-norma-signal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45 disabled:opacity-35"
              >
                Todas
              </button>
              <button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={clearAll}
                className="rounded-xl px-2 py-1.5 text-[11px] font-medium text-norma-muted transition-colors hover:bg-norma-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45 disabled:opacity-35"
              >
                Limpiar
              </button>
            </div>
          ) : null}

          <button
            type="button"
            disabled={disabled || loading}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex min-w-11 items-center justify-center border-l border-norma-border/80 text-norma-muted transition-colors hover:bg-norma-surface hover:text-norma-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-norma-accent/45 disabled:opacity-40"
            aria-label={open ? 'Ocultar catálogo' : 'Mostrar catálogo'}
          >
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: duration.fast, ease: easeOut }}
              className="inline-flex"
            >
              <ChevronDown className="size-4" aria-hidden />
            </motion.span>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {!disabled && selectedOptions.length > 0 ? (
            <motion.div
              key="selected-chips"
              initial={
                reduceMotion
                  ? false
                  : { height: 0, opacity: 0 }
              }
              animate={{ height: 'auto', opacity: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      height: 0,
                      opacity: 0,
                      transition: {
                        height: { duration: duration.fast, ease: easeOut },
                        opacity: { duration: 0.12, ease: easeOut },
                      },
                    }
              }
              transition={{
                height: { duration: duration.ui, ease: easeOut },
                opacity: { duration: duration.fast, ease: easeOut },
              }}
              className="overflow-hidden border-t border-norma-border/80"
            >
              <div
                className="flex flex-wrap gap-1.5 px-3 py-2.5"
                aria-label="Selección actual"
              >
                <AnimatePresence initial={false}>
                  {selectedOptions.map((opt) => (
                    <motion.button
                      key={opt.id}
                      type="button"
                      initial={
                        reduceMotion ? false : { opacity: 0, y: 3 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        reduceMotion
                          ? undefined
                          : {
                              opacity: 0,
                              transition: { duration: 0.1, ease: easeOut },
                            }
                      }
                      transition={{ duration: 0.16, ease: easeOut }}
                      className="inline-flex min-h-8 items-center gap-1 rounded-full bg-norma-signal/14 px-2.5 py-1 text-[11px] font-semibold text-norma-signal ring-1 ring-norma-signal/20 transition-colors duration-150 hover:bg-norma-signal/22 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
                      onClick={() => toggle(opt.id)}
                      aria-label={`Quitar ${opt.title}`}
                    >
                      {opt.title}
                      <X className="size-3 opacity-80" aria-hidden />
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id={panelId}
              key="catalog"
              initial={
                reduceMotion ? false : { height: 0, opacity: 0 }
              }
              animate={{ height: 'auto', opacity: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { height: 0, opacity: 0 }
              }
              transition={{ duration: duration.ui, ease: easeOut }}
              className="overflow-hidden border-t border-norma-border/80"
            >
              <div
                id={listId}
                role="group"
                aria-label={label}
                className={cn(
                  'overflow-y-auto overscroll-contain bg-norma-surface/40 p-1.5',
                  compact ? 'max-h-40' : 'max-h-52',
                )}
              >
                {loading ? (
                  <div className="space-y-2 p-1.5">
                    <Skeleton className="h-11 w-full rounded-xl" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="px-3 py-5 text-center text-sm text-norma-muted">
                    {options.length === 0 ? emptyLabel : 'Sin coincidencias.'}
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {filtered.map((opt, index) => {
                      const selected = selectedSet.has(opt.id)
                      return (
                        <li key={opt.id}>
                          <motion.button
                            type="button"
                            disabled={disabled}
                            initial={
                              reduceMotion ? false : { opacity: 0, y: 4 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: duration.fast,
                              ease: easeOut,
                              delay: reduceMotion
                                ? 0
                                : Math.min(index * 0.02, 0.16),
                            }}
                            whileTap={
                              disabled || reduceMotion
                                ? undefined
                                : { scale: 0.985 }
                            }
                            onClick={() => toggle(opt.id)}
                            aria-pressed={selected}
                            className={cn(
                              'flex w-full min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-[background-color,box-shadow,border-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45',
                              'disabled:cursor-not-allowed disabled:opacity-50',
                              selected
                                ? 'border border-norma-signal/35 bg-norma-signal/10'
                                : 'border border-transparent hover:bg-norma-raised/80',
                            )}
                          >
                            <span
                              className={cn(
                                'flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-[background-color,border-color] duration-150',
                                selected
                                  ? 'border-norma-signal bg-norma-signal text-norma-navy'
                                  : 'border-norma-border bg-norma-raised text-transparent',
                              )}
                              aria-hidden
                            >
                              <Check className="size-3 stroke-[3]" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-norma-fg">
                                {opt.title}
                              </span>
                              {opt.subtitle ? (
                                <span className="mt-0.5 block truncate font-mono text-[11px] text-norma-subtle">
                                  {opt.subtitle}
                                </span>
                              ) : null}
                            </span>
                            {opt.meta ? (
                              <span className="shrink-0 rounded-full bg-norma-accent/12 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-norma-accent">
                                {opt.meta}
                              </span>
                            ) : null}
                          </motion.button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {!open && !disabled ? (
        <p className="text-[11px] text-norma-subtle">
          Despliega el catálogo o escribe para buscar y vincular.
        </p>
      ) : null}
    </div>
  )
}

/** Compara sets de IDs sin importar el orden (para dirty checks). */
export function linkIdsDirty(current: string[], baseline: string[]) {
  return !idsEqual(current, baseline)
}
