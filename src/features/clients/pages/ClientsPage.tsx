import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import * as Tabs from '@radix-ui/react-tabs'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { clientsApi } from '@/features/clients/api/clients-api'
import {
  detailCrossfade,
  duration,
  easeOut,
  tabPanel,
} from '@/shared/lib/motion'
import type { Client, ClientDetail } from '@/features/clients/types/client'
import { ClientListPanel } from '@/features/clients/components/ClientListPanel'
import {
  ClientDataForm,
  ClientDetailHeader,
  CreateClientDialog,
} from '@/features/clients/components/ClientForms'
import {
  ProfileFormDialog,
  ProfileList,
} from '@/features/clients/components/ProfileList'
import { useDebouncedValue } from '@/features/clients/hooks/useDebouncedValue'
import { useAuthStore } from '@/store/auth-store'
import { mapApiError } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'
import { EmptyState, ErrorState, PageHeader } from '@/shared/ui/page'
import { Skeleton } from '@/shared/ui/skeleton'

const tabFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-norma-raised'

export function ClientsPage() {
  const navigate = useNavigate()
  const { clientId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'perfiles' ? 'perfiles' : 'datos'
  const query = searchParams.get('q') ?? ''
  const includeInactive = searchParams.get('inactive') === '1'
  const debouncedQuery = useDebouncedValue(query, 300)
  const reduceMotion = useReducedMotion()

  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role ?? 'ADMIN'
  const canManageClients = role === 'ADMIN'
  const canManageProfiles = role === 'ADMIN' || role === 'ANALYST'
  const canToggleProfiles = role === 'ADMIN'

  const [clients, setClients] = useState<Client[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [detail, setDetail] = useState<ClientDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const detailRef = useRef<ClientDetail | null>(null)
  detailRef.current = detail

  const [createOpen, setCreateOpen] = useState(false)
  const [profileCreateOpen, setProfileCreateOpen] = useState(false)

  const patchSearch = useCallback(
    (patch: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(patch)) {
            if (value === null || value === '') next.delete(key)
            else next.set(key, value)
          }
          if (!next.get('tab')) next.set('tab', tab)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams, tab],
  )

  const listQueryString = useMemo(() => {
    const p = new URLSearchParams(searchParams)
    if (!p.get('tab')) p.set('tab', tab)
    const qs = p.toString()
    return qs ? `?${qs}` : ''
  }, [searchParams, tab])

  const itemTo = useCallback(
    (id: string) => `/clientes/${id}${listQueryString}`,
    [listQueryString],
  )

  const loadList = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const rows = await clientsApi.list({
        status: includeInactive ? undefined : 'ACTIVE',
        q: debouncedQuery || undefined,
      })
      setClients(rows)
    } catch (err) {
      setListError(mapApiError(err, 'No se pudo cargar la lista de clientes.'))
    } finally {
      setListLoading(false)
    }
  }, [debouncedQuery, includeInactive])

  const loadDetail = useCallback(async (id: string) => {
    setDetailError(null)
    // Soft switch: keep shell + previous content; skeleton only on cold load.
    if (!detailRef.current) setDetailLoading(true)
    try {
      const data = await clientsApi.get(id)
      setDetail(data)
    } catch (err) {
      setDetail(null)
      setDetailError(mapApiError(err, 'No se pudo cargar el cliente.'))
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (!listLoading && !clientId && clients.length > 0) {
      navigate(`/clientes/${clients[0].id}${listQueryString}`, {
        replace: true,
      })
    }
  }, [listLoading, clientId, clients, navigate, listQueryString])

  useEffect(() => {
    if (!clientId) {
      setDetail(null)
      setDetailError(null)
      setDetailLoading(false)
      return
    }

    let cancelled = false

    void (async () => {
      setDetailError(null)
      if (!detailRef.current) setDetailLoading(true)
      try {
        const data = await clientsApi.get(clientId)
        if (!cancelled) setDetail(data)
      } catch (err) {
        if (!cancelled) {
          setDetail(null)
          setDetailError(mapApiError(err, 'No se pudo cargar el cliente.'))
        }
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [clientId])

  const selected = useMemo(
    () => clients.find((c) => c.id === clientId) ?? detail,
    [clients, clientId, detail],
  )

  const showBlockingSkeleton = detailLoading && !detail
  const contentKey = detail?.id ?? clientId ?? 'empty'

  function setTab(next: string) {
    patchSearch({ tab: next })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Clientes"
        description="Tenants del piloto y perfiles que alimentan al agente."
      />

      {listError ? (
        <ErrorState message={listError} onRetry={() => void loadList()} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <ClientListPanel
            clients={clients}
            selectedId={clientId}
            loading={listLoading}
            query={query}
            includeInactive={includeInactive}
            canCreate={canManageClients}
            itemTo={itemTo}
            onQueryChange={(q) => patchSearch({ q: q || null })}
            onIncludeInactiveChange={(v) =>
              patchSearch({ inactive: v ? '1' : null })
            }
            onCreate={() => setCreateOpen(true)}
          />

          {/* Stable shell — do not key by clientId (avoids remount / scroll jump). */}
          <section className="min-h-[520px] rounded-3xl border-2 border-norma-border bg-norma-surface p-5 shadow-[0_12px_32px_-18px_rgba(13,27,42,0.35)] md:p-6">
            {!clientId && !listLoading && clients.length === 0 ? (
              <EmptyState
                title="Aún no hay clientes"
                description="Crea el primero para el piloto."
                actionLabel={canManageClients ? 'Nuevo cliente' : undefined}
                onAction={
                  canManageClients ? () => setCreateOpen(true) : undefined
                }
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
                onRetry={() => clientId && void loadDetail(clientId)}
              />
            ) : detail && selected ? (
              <motion.div
                key={contentKey}
                initial={reduceMotion ? false : detailCrossfade.initial}
                animate={detailCrossfade.animate}
                transition={{ duration: duration.fast, ease: easeOut }}
              >
                <ClientDetailHeader client={detail} />
                <Tabs.Root value={tab} onValueChange={setTab} className="mt-4">
                  <Tabs.List className="relative flex gap-1 rounded-2xl border-2 border-norma-border bg-norma-raised p-1">
                    {[
                      { value: 'datos', label: 'Datos' },
                      { value: 'perfiles', label: 'Perfiles' },
                    ].map((item) => {
                      const active = tab === item.value
                      return (
                        <Tabs.Trigger
                          key={item.value}
                          value={item.value}
                          className={cn(
                            'relative z-10 flex-1 rounded-xl px-4 py-2 text-sm font-medium text-norma-muted transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
                            tabFocus,
                            active && 'text-norma-accent',
                          )}
                        >
                          {active ? (
                            <motion.span
                              layoutId={
                                reduceMotion ? undefined : 'client-tab-pill'
                              }
                              className="absolute inset-0 rounded-xl border border-norma-border bg-norma-surface shadow-sm"
                              transition={{
                                type: 'spring',
                                stiffness: 440,
                                damping: 36,
                                mass: 0.65,
                              }}
                            />
                          ) : null}
                          <span className="relative z-10">{item.label}</span>
                        </Tabs.Trigger>
                      )
                    })}
                  </Tabs.List>

                  <div className="relative mt-1 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      {tab === 'datos' ? (
                        <motion.div
                          key="datos"
                          role="tabpanel"
                          initial={reduceMotion ? false : tabPanel.initial}
                          animate={tabPanel.animate}
                          exit={reduceMotion ? undefined : tabPanel.exit}
                          transition={{
                            duration: duration.tab,
                            ease: easeOut,
                          }}
                        >
                          <ClientDataForm
                            client={detail}
                            canEdit={canManageClients}
                            onSaved={(updated) => {
                              setDetail({ ...detail, ...updated })
                              void loadList()
                            }}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="perfiles"
                          role="tabpanel"
                          initial={reduceMotion ? false : tabPanel.initial}
                          animate={tabPanel.animate}
                          exit={reduceMotion ? undefined : tabPanel.exit}
                          transition={{
                            duration: duration.tab,
                            ease: easeOut,
                          }}
                        >
                          <ProfileList
                            profiles={detail.profiles}
                            canEdit={canManageProfiles}
                            canToggleStatus={canToggleProfiles}
                            onCreate={() => setProfileCreateOpen(true)}
                            onChanged={() =>
                              clientId && void loadDetail(clientId)
                            }
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Tabs.Root>
              </motion.div>
            ) : (
              <p className="text-sm text-norma-muted">
                Selecciona un cliente.
              </p>
            )}
          </section>
        </div>
      )}

      <CreateClientDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(created) => {
          void loadList()
          navigate(`/clientes/${created.id}?tab=datos`)
        }}
      />

      <ProfileFormDialog
        open={profileCreateOpen}
        onOpenChange={setProfileCreateOpen}
        clientId={clientId ?? ''}
        onSaved={() => clientId && void loadDetail(clientId)}
      />
    </div>
  )
}
