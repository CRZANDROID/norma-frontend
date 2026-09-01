import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { clientsApi } from '@/features/clients/api/clients-api'
import type { Client } from '@/features/clients/types/client'
import { findingsApi } from '@/features/findings/api/findings-api'
import { sourcesApi } from '@/features/sources/api/sources-api'
import type { Source } from '@/features/sources/types/source'
import { FindingDetailCard } from '@/features/findings/components/FindingDetailCard'
import { FindingListPanel } from '@/features/findings/components/FindingListPanel'
import { ImpactFilter } from '@/features/findings/components/ImpactFilter'
import type {
  FindingDetail,
  FindingImpact,
  FindingListItem,
} from '@/features/findings/types/finding'
import { FINDING_IMPACTS } from '@/features/findings/types/finding'
import {
  countLabel,
  formatFindingWhen,
  latestCreatedAt,
} from '@/features/findings/lib/format'
import { IMPACT_LAMP } from '@/features/findings/lib/impact'
import { mapApiError } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'
import { Label } from '@/shared/ui/label'
import { EmptyState, ErrorState } from '@/shared/ui/page'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

const FILTER_ALL_SOURCES = '__all__'

function asImpactParam(value: string | null): FindingImpact | null {
  if (!value) return null
  const raw = value.toUpperCase()
  return FINDING_IMPACTS.includes(raw as FindingImpact)
    ? (raw as FindingImpact)
    : null
}

export function FindingsPage() {
  const navigate = useNavigate()
  const { findingId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const clientFromUrl = searchParams.get('cliente') ?? ''
  const sourceFromUrl = searchParams.get('fuente') ?? ''
  const impactFilter = asImpactParam(searchParams.get('impacto'))

  const [clients, setClients] = useState<Client[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [clientId, setClientId] = useState(clientFromUrl)
  const [sourceId, setSourceId] = useState(sourceFromUrl)
  const [items, setItems] = useState<FindingListItem[]>([])
  const [detail, setDetail] = useState<FindingDetail | null>(null)
  const [loadingClients, setLoadingClients] = useState(true)
  const [loadingSources, setLoadingSources] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [clientsError, setClientsError] = useState<string | null>(null)
  const [sourcesError, setSourcesError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [clientsEpoch, setClientsEpoch] = useState(0)
  const [listEpoch, setListEpoch] = useState(0)

  const listQueryString = useMemo(() => {
    const qs = searchParams.toString()
    return qs ? `?${qs}` : ''
  }, [searchParams])

  const visibleItems = useMemo(() => {
    if (!impactFilter) return items
    return items.filter((row) => row.impact === impactFilter)
  }, [items, impactFilter])

  const redCount = useMemo(
    () => items.filter((row) => row.impact === 'RED').length,
    [items],
  )
  const lastClassified = useMemo(() => latestCreatedAt(items), [items])

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

  useEffect(() => {
    let cancelled = false
    setLoadingClients(true)
    setClientsError(null)
    void clientsApi
      .list({ status: 'ACTIVE' })
      .then((rows) => {
        if (cancelled) return
        setClients(rows)
      })
      .catch((err) => {
        if (!cancelled) {
          setClients([])
          setClientsError(
            mapApiError(err, 'No se pudieron cargar los clientes. Reintenta.'),
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingClients(false)
      })
    return () => {
      cancelled = true
    }
  }, [clientsEpoch])

  useEffect(() => {
    if (clients.length === 0) return
    if (clientFromUrl && clients.some((row) => row.id === clientFromUrl)) {
      setClientId(clientFromUrl)
      return
    }
    const fallback = clients[0]?.id
    if (!fallback) return
    setClientId(fallback)
    if (!clientFromUrl) patchSearch({ cliente: fallback })
  }, [clientFromUrl, clients, patchSearch])

  useEffect(() => {
    if (!clientId) {
      setSources([])
      setSourceId('')
      setLoadingSources(false)
      setSourcesError(null)
      return
    }
    let cancelled = false
    setLoadingSources(true)
    setSourcesError(null)
    setSources([])
    void sourcesApi
      .list({ clientId, status: 'ACTIVE' })
      .then((rows) => {
        if (cancelled) return
        const ordered = [...rows].sort((a, b) =>
          a.name.localeCompare(b.name, 'es'),
        )
        setSources(ordered)
      })
      .catch((err) => {
        if (!cancelled) {
          setSources([])
          setSourcesError(
            mapApiError(err, 'No se pudieron cargar las fuentes. Reintenta.'),
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSources(false)
      })
    return () => {
      cancelled = true
    }
  }, [clientId])

  useEffect(() => {
    if (!sourceFromUrl) {
      setSourceId('')
      return
    }
    if (loadingSources) return
    if (sources.some((row) => row.id === sourceFromUrl)) {
      setSourceId(sourceFromUrl)
      return
    }
    setSourceId('')
    patchSearch({ fuente: null })
  }, [sourceFromUrl, sources, loadingSources, patchSearch])

  useEffect(() => {
    if (!clientId) {
      setItems([])
      setLoadingList(false)
      return
    }
    let cancelled = false
    setLoadingList(true)
    setListError(null)
    void findingsApi
      .list({
        clientId,
        sourceId: sourceId || undefined,
        status: 'OPEN',
        limit: 200,
      })
      .then((rows) => {
        if (!cancelled) setItems(rows)
      })
      .catch((err) => {
        if (!cancelled) {
          setItems([])
          setListError(
            mapApiError(err, 'No se pudieron cargar los hallazgos. Reintenta.'),
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false)
      })
    return () => {
      cancelled = true
    }
  }, [clientId, sourceId, listEpoch])

  useEffect(() => {
    if (!findingId) {
      setDetail(null)
      setDetailError(null)
      return
    }
    let cancelled = false
    setLoadingDetail(true)
    setDetailError(null)
    void findingsApi
      .get(findingId)
      .then((row) => {
        if (!cancelled) setDetail(row)
      })
      .catch((err) => {
        if (!cancelled) {
          setDetail(null)
          setDetailError(
            mapApiError(err, 'No se pudo cargar el hallazgo. Reintenta.'),
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false)
      })
    return () => {
      cancelled = true
    }
  }, [findingId])

  function onClientChange(id: string) {
    setClientId(id)
    setSourceId('')
    const next = new URLSearchParams()
    if (id) next.set('cliente', id)
    if (impactFilter) next.set('impacto', impactFilter)
    const qs = next.toString()
    navigate(qs ? `/alertas?${qs}` : '/alertas', { replace: true })
  }

  function onSourceChange(id: string) {
    const selected = id === FILTER_ALL_SOURCES ? '' : id
    setSourceId(selected)
    const next = new URLSearchParams()
    if (clientId) next.set('cliente', clientId)
    if (selected) next.set('fuente', selected)
    if (impactFilter) next.set('impacto', impactFilter)
    const qs = next.toString()
    navigate(qs ? `/alertas?${qs}` : '/alertas', { replace: true })
  }

  function itemTo(id: string) {
    return `/alertas/${id}${listQueryString}`
  }

  const clientOptions = clients.map((row) => ({
    value: row.id,
    label: row.name,
  }))
  const sourceOptions = [
    { value: FILTER_ALL_SOURCES, label: 'Todas las fuentes' },
    ...sources.map((row) => ({ value: row.id, label: row.name })),
  ]

  const emptyList = !loadingList && items.length === 0
  const emptyImpact =
    !loadingList && items.length > 0 && visibleItems.length === 0
  const dossierWash = detail ? IMPACT_LAMP[detail.impact].wash : null
  const dossierBar = detail ? IMPACT_LAMP[detail.impact].fill : null

  return (
    <div>

      {loadingClients ? (
        <div aria-busy="true" aria-label="Cargando clientes">
          <Skeleton className="h-[70vh] w-full rounded-3xl" />
        </div>
      ) : clientsError && clients.length === 0 ? (
        <ErrorState
          message={clientsError}
          onRetry={() => setClientsEpoch((n) => n + 1)}
        />
      ) : clients.length === 0 ? (
        <EmptyState
          title="No hay clientes activos"
          description="Cuando exista un cliente con fuentes en rastreo, las clasificaciones aparecerán aquí."
        />
      ) : (
        <div className="flex h-[calc(100dvh-8.5rem)] max-h-[calc(100dvh-8.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-norma-border bg-norma-surface">
          <header className="shrink-0 border-b-2 border-norma-border px-4 py-3 md:px-5">
            <div className="flex flex-wrap items-end gap-4">
              <div className="mr-auto min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-accent">
                  Alertas
                </p>
                <p className="font-display text-lg font-semibold tracking-tight">
                  Semáforo
                </p>
              </div>
              <div className="grid min-w-0 flex-1 gap-3 sm:max-w-xl sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="finding-client">Cliente</Label>
                  <Select
                    id="finding-client"
                    name="cliente"
                    value={clientId}
                    onValueChange={onClientChange}
                    options={clientOptions}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="finding-source">Fuente</Label>
                  <Select
                    id="finding-source"
                    name="fuente"
                    value={sourceId || FILTER_ALL_SOURCES}
                    onValueChange={onSourceChange}
                    options={sourceOptions}
                    disabled={loadingSources}
                  />
                </div>
              </div>
              <p
                className="w-full font-mono text-xs leading-relaxed text-norma-muted lg:w-auto lg:max-w-xs lg:text-right"
                aria-live="polite"
              >
                {loadingList
                  ? 'Cargando hallazgos…'
                  : [
                      countLabel(items.length, 'abierto', 'abiertos'),
                      countLabel(redCount, 'alerta', 'alertas'),
                      lastClassified
                        ? formatFindingWhen(lastClassified)
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
              </p>
            </div>
            {loadingSources ? (
              <p className="mt-2 text-xs text-norma-subtle">Cargando fuentes…</p>
            ) : sourcesError ? (
              <p className="mt-2 text-xs text-norma-red">{sourcesError}</p>
            ) : sources.length === 0 ? (
              <p className="mt-2 text-xs text-norma-subtle">
                Este cliente no tiene fuentes activas.
              </p>
            ) : null}
          </header>

          <p className="sr-only" aria-live="polite">
            {loadingList
              ? 'Cargando hallazgos…'
              : `${visibleItems.length} hallazgos visibles`}
          </p>

          {listError ? (
            <div className="min-h-0 flex-1 overflow-auto p-5">
              <ErrorState
                message={listError}
                onRetry={() => setListEpoch((n) => n + 1)}
              />
            </div>
          ) : (
            <>
              <div className="shrink-0 bg-norma-navy text-white">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-accent-soft">
                    Distribución
                  </h2>
                  <p className="hidden font-mono text-[11px] text-white/55 sm:block">
                    Elige un color para filtrar la lista
                  </p>
                </div>
                <ImpactFilter
                  items={items}
                  selected={impactFilter}
                  onSelect={(impact) =>
                    patchSearch({ impacto: impact ?? null })
                  }
                />
              </div>

              <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,38%)_minmax(0,1fr)] lg:grid-cols-[minmax(240px,20rem)_minmax(0,1fr)] lg:grid-rows-none">
                <FindingListPanel
                  items={visibleItems}
                  selectedId={findingId}
                  loading={loadingList}
                  itemTo={itemTo}
                />

                <section
                  aria-labelledby="finding-classification-heading"
                  className={cn(
                    'relative min-h-0 overflow-y-auto overscroll-contain border-t-2 border-norma-border p-5 md:p-8 lg:border-l-2 lg:border-t-0',
                    dossierWash ?? 'bg-norma-bg',
                  )}
                >
                  {dossierBar ? (
                    <span
                      className={cn(
                        'absolute inset-y-0 left-0 hidden w-1 lg:block',
                        dossierBar,
                      )}
                      aria-hidden
                    />
                  ) : null}
                  <h2
                    id="finding-classification-heading"
                    className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-subtle"
                  >
                    Clasificación
                  </h2>
                {loadingList && !findingId ? (
                  <div
                    className="space-y-4"
                    aria-busy="true"
                    aria-label="Cargando clasificación"
                  >
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : emptyList ? (
                  <EmptyState
                    title="Aún no hay clasificaciones"
                    description={
                      sourceId
                        ? 'NORMA no ha clasificado normas abiertas en esa fuente.'
                        : 'Cuando el rastreo clasifique documentos de este cliente, aparecerán aquí.'
                    }
                  />
                ) : emptyImpact ? (
                  <EmptyState
                    title="Nada con ese impacto"
                    description="No hay hallazgos abiertos de ese color con el cliente y la fuente actuales."
                  />
                ) : !findingId ? (
                  <p className="max-w-sm text-sm leading-relaxed text-norma-muted">
                    Elige un hallazgo. La clasificación de NORMA se lee aquí,
                    junto al documento original.
                  </p>
                ) : loadingDetail ? (
                  <div
                    className="space-y-4"
                    aria-busy="true"
                    aria-label="Cargando clasificación"
                  >
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : detailError && !detail ? (
                  <ErrorState
                    message={detailError}
                    onRetry={() => {
                      setDetailError(null)
                      setLoadingDetail(true)
                      void findingsApi
                        .get(findingId)
                        .then(setDetail)
                        .catch((err) => {
                          setDetail(null)
                          setDetailError(
                            mapApiError(
                              err,
                              'No se pudo cargar el hallazgo. Reintenta.',
                            ),
                          )
                        })
                        .finally(() => setLoadingDetail(false))
                    }}
                  />
                ) : detail ? (
                  <FindingDetailCard finding={detail} />
                ) : null}
              </section>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
