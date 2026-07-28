import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { usersApi } from '@/features/users/api/users-api'
import {
  UserDetailHeader,
  UserMemberships,
  UserRoleForm,
} from '@/features/users/components/UserForms'
import { UserListPanel } from '@/features/users/components/UserListPanel'
import { useDebouncedValue } from '@/features/users/hooks/useDebouncedValue'
import type { NormaUser } from '@/features/users/types/user'
import { detailCrossfade, duration, easeOut } from '@/shared/lib/motion'
import { useAuthStore } from '@/store/auth-store'
import { EmptyState, ErrorState, PageHeader } from '@/shared/ui/page'
import { Skeleton } from '@/shared/ui/skeleton'

export function UsersPage() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const reduceMotion = useReducedMotion()

  const query = searchParams.get('q') ?? ''
  const includeInactive = searchParams.get('inactive') === '1'
  const debouncedQuery = useDebouncedValue(query, 300)

  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role ?? 'ADMIN'
  const canManage = role === 'ADMIN'

  const [users, setUsers] = useState<NormaUser[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [detail, setDetail] = useState<NormaUser | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const detailRef = useRef<NormaUser | null>(null)
  detailRef.current = detail
  const usersRef = useRef(users)
  usersRef.current = users

  const patchSearch = useCallback(
    (patch: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(patch)) {
            if (value === null || value === '') next.delete(key)
            else next.set(key, value)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const listQueryString = useMemo(() => {
    const qs = searchParams.toString()
    return qs ? `?${qs}` : ''
  }, [searchParams])

  const itemTo = useCallback(
    (id: string) => `/usuarios/${id}${listQueryString}`,
    [listQueryString],
  )

  const loadList = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const rows = await usersApi.list({
        status: includeInactive ? undefined : 'ACTIVE',
        q: debouncedQuery || undefined,
      })
      setUsers(rows)
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'No se pudo cargar.')
    } finally {
      setListLoading(false)
    }
  }, [debouncedQuery, includeInactive])

  const loadDetail = useCallback(async (id: string) => {
    setDetailError(null)
    if (detailRef.current?.id !== id) {
      const fromList = usersRef.current.find((u) => u.id === id)
      if (fromList) setDetail(fromList)
      else if (!detailRef.current) setDetailLoading(true)
    }
    try {
      const data = await usersApi.get(id)
      setDetail(data)
    } catch (err) {
      setDetail(null)
      setDetailError(err instanceof Error ? err.message : 'No se pudo cargar.')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (!listLoading && !userId && users.length > 0) {
      navigate(`/usuarios/${users[0].id}${listQueryString}`, {
        replace: true,
      })
    }
  }, [listLoading, userId, users, navigate, listQueryString])

  useEffect(() => {
    if (!userId) {
      setDetail(null)
      setDetailError(null)
      setDetailLoading(false)
      return
    }

    let cancelled = false

    void (async () => {
      setDetailError(null)
      if (detailRef.current?.id !== userId) {
        const fromList = usersRef.current.find((u) => u.id === userId)
        if (fromList) setDetail(fromList)
        else if (!detailRef.current) setDetailLoading(true)
      }
      try {
        const data = await usersApi.get(userId)
        if (!cancelled) setDetail(data)
      } catch (err) {
        if (!cancelled) {
          setDetail(null)
          setDetailError(
            err instanceof Error ? err.message : 'No se pudo cargar.',
          )
        }
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  const selected = useMemo(
    () => users.find((u) => u.id === userId) ?? detail,
    [users, userId, detail],
  )

  const showBlockingSkeleton = detailLoading && !detail
  const contentKey = detail?.id ?? userId ?? 'empty'

  function handleUserSaved(updated: NormaUser) {
    setDetail(updated)
    setUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
    )
  }

  if (!canManage) {
    return (
      <div>
        <PageHeader
          eyebrow="Administración"
          title="Usuarios"
          description="Roles globales y membresías por cliente."
        />
        <ErrorState message="Solo administradores pueden gestionar usuarios." />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        description="Roles globales y membresías por cliente del panel."
      />

      {listError ? (
        <ErrorState message={listError} onRetry={() => void loadList()} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <UserListPanel
            users={users}
            selectedId={userId}
            loading={listLoading}
            query={query}
            includeInactive={includeInactive}
            itemTo={itemTo}
            onQueryChange={(q) => patchSearch({ q: q || null })}
            onIncludeInactiveChange={(v) =>
              patchSearch({ inactive: v ? '1' : null })
            }
          />

          <section className="min-h-[520px] rounded-3xl border-2 border-norma-border bg-norma-surface p-5 shadow-[0_12px_32px_-18px_rgba(13,27,42,0.35)] md:p-6">
            {!userId && !listLoading && users.length === 0 ? (
              <EmptyState
                title="Aún no hay usuarios"
                description="Aparecen cuando alguien inicia sesión por primera vez."
              />
            ) : showBlockingSkeleton ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : detailError && !detail ? (
              <ErrorState
                message={detailError}
                onRetry={() => userId && void loadDetail(userId)}
              />
            ) : detail && selected ? (
              <motion.div
                key={contentKey}
                initial={reduceMotion ? false : detailCrossfade.initial}
                animate={detailCrossfade.animate}
                transition={{ duration: duration.fast, ease: easeOut }}
              >
                <UserDetailHeader user={detail} />
                <UserRoleForm
                  user={detail}
                  canEdit={canManage}
                  onSaved={(updated) => {
                    handleUserSaved(updated)
                    void loadList()
                  }}
                />
                <UserMemberships
                  user={detail}
                  canEdit={canManage}
                  onUserChange={(updated) => {
                    handleUserSaved(updated)
                    void loadList()
                  }}
                />
              </motion.div>
            ) : (
              <p className="text-sm text-norma-muted">
                Selecciona un usuario.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
