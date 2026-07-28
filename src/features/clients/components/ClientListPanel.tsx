import { Plus, Search } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { Client } from '@/features/clients/types/client'
import { StatusBadge } from '@/features/clients/components/chips'
import { duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'

export function ClientListPanel({
  clients,
  selectedId,
  loading,
  query,
  includeInactive,
  canCreate,
  onQueryChange,
  onIncludeInactiveChange,
  onSelect,
  onCreate,
}: {
  clients: Client[]
  selectedId?: string
  loading: boolean
  query: string
  includeInactive: boolean
  canCreate: boolean
  onQueryChange: (q: string) => void
  onIncludeInactiveChange: (v: boolean) => void
  onSelect: (id: string) => void
  onCreate: () => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-3xl border-2 border-norma-border bg-norma-surface shadow-[0_12px_32px_-18px_rgba(13,27,42,0.35)]">
      <div className="space-y-3 border-b-2 border-norma-border bg-norma-raised/80 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-semibold tracking-wide">
            Clientes
          </h2>
          {canCreate ? (
            <Button size="sm" onClick={onCreate} aria-label="Nuevo cliente">
              <Plus className="size-4" />
              Nuevo
            </Button>
          ) : null}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-norma-subtle" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre o slug…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-norma-muted">
          <input
            type="checkbox"
            className="size-3.5 rounded border-norma-border accent-norma-accent"
            checked={includeInactive}
            onChange={(e) => onIncludeInactiveChange(e.target.checked)}
          />
          Incluir inactivos
        </label>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : clients.length === 0 ? (
          <p className="p-4 text-sm text-norma-muted">
            No hay clientes con ese filtro.
          </p>
        ) : (
          <ul className="space-y-1">
            {clients.map((client, index) => {
              const active = client.id === selectedId
              return (
                <motion.li
                  key={client.id}
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: duration.ui,
                    ease: easeOut,
                    delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.2),
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(client.id)}
                    className={cn(
                      'relative w-full rounded-2xl px-3 py-3 text-left transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
                      active
                        ? 'bg-norma-accent/10 text-norma-fg'
                        : 'hover:bg-norma-raised',
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId={reduceMotion ? undefined : 'client-active'}
                        className="absolute inset-y-2 left-0 w-1 rounded-full bg-norma-accent"
                        transition={{ duration: duration.ui, ease: easeOut }}
                      />
                    ) : null}
                    <div className="flex items-start justify-between gap-2 pl-1">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {client.name}
                        </p>
                        <p className="truncate font-mono text-[11px] text-norma-subtle">
                          {client.slug}
                        </p>
                      </div>
                      <StatusBadge status={client.status} />
                    </div>
                  </button>
                </motion.li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
