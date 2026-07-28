import { Search } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { NormaUser } from '@/features/users/types/user'
import { USER_ROLE_LABELS } from '@/features/users/types/user'
import { RoleBadge, StatusBadge } from '@/features/users/components/chips'
import { duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'

export function UserListPanel({
  users,
  selectedId,
  loading,
  query,
  includeInactive,
  onQueryChange,
  onIncludeInactiveChange,
  onSelect,
}: {
  users: NormaUser[]
  selectedId?: string
  loading: boolean
  query: string
  includeInactive: boolean
  onQueryChange: (q: string) => void
  onIncludeInactiveChange: (v: boolean) => void
  onSelect: (id: string) => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-3xl border-2 border-norma-border bg-norma-surface shadow-[0_12px_32px_-18px_rgba(13,27,42,0.35)]">
      <div className="space-y-3 border-b-2 border-norma-border bg-norma-raised/80 p-4">
        <h2 className="font-display text-sm font-semibold tracking-wide">
          Usuarios
        </h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-norma-subtle" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre o correo…"
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
        ) : users.length === 0 ? (
          <p className="p-4 text-sm text-norma-muted">
            No hay usuarios con ese filtro.
          </p>
        ) : (
          <ul className="space-y-1">
            {users.map((user, index) => {
              const active = user.id === selectedId
              return (
                <motion.li
                  key={user.id}
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
                    onClick={() => onSelect(user.id)}
                    className={cn(
                      'relative w-full rounded-2xl px-3 py-3 text-left transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
                      active
                        ? 'bg-norma-accent/10 text-norma-fg'
                        : 'hover:bg-norma-raised',
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId={reduceMotion ? undefined : 'user-active'}
                        className="absolute inset-y-2 left-0 w-1 rounded-full bg-norma-accent"
                        transition={{ duration: duration.ui, ease: easeOut }}
                      />
                    ) : null}
                    <div className="flex items-start justify-between gap-2 pl-1">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {user.name}
                        </p>
                        <p className="truncate text-[11px] text-norma-subtle">
                          {user.email}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-norma-muted">
                          {USER_ROLE_LABELS[user.role]}
                          {user.memberships.length > 0
                            ? ` · ${user.memberships.length} membresía${user.memberships.length === 1 ? '' : 's'}`
                            : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <StatusBadge status={user.status} />
                        <RoleBadge role={user.role} />
                      </div>
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
