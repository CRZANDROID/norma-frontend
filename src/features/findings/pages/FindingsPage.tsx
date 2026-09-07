import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { clientsApi } from '@/features/clients/api/clients-api'
import type { Client } from '@/features/clients/types/client'
import { findingsApi } from '@/features/findings/api/findings-api'
import { sourcesApi } from '@/features/sources/api/sources-api'
import type { Source } from '@/features/sources/types/source'
import {
  FindingDateFilter,
  type DateRangeFilter,
} from '@/features/findings/components/FindingDateFilter'
import { FindingDetailCard } from '@/features/findings/components/FindingDetailCard'
import { FindingListPanel } from '@/features/findings/components/FindingListPanel'
import { FindingPageNav } from '@/features/findings/components/FindingPageNav'
import { ImpactFilter } from '@/features/findings/components/ImpactFilter'
import type {
  FindingDetail,
  FindingImpact,
  FindingListItem,
  FindingsListCounts,
} from '@/features/findings/types/finding'
import { FINDING_IMPACTS } from '@/features/findings/types/finding'
import {
  civilDateToday,
  formatCivilDateLabel,
  isCivilDate,
} from '@/features/findings/lib/civil-date'
import { countLabel } from '@/features/findings/lib/format'
import { emptyListCounts, IMPACT_LAMP } from '@/features/findings/lib/impact'
import { mapApiError } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'
import { Label } from '@/shared/ui/label'
import { EmptyState, ErrorState } from '@/shared/ui/page'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

const FILTER_ALL_SOURCES = '__all__'
const ALL_PAGE_LIMIT = 200
const PAGE_SIZES = [10, 25, 50] as const
type PageSize = (typeof PAGE_SIZES)[number] | 'all'

const selectOnNavy =
  'border-white/20 bg-white/8 text-white shadow-none hover:bg-white/14 hover:text-white focus-visible:border-norma-accent-soft focus-visible:ring-white/20 data-[state=open]:border-norma-accent-soft data-[state=open]:bg-white/12 data-[state=open]:ring-white/15 [&[data-placeholder]]:text-white/45 [&_svg]:text-white/70'

function PulseDot({ live }: { live: boolean }) {
  const reduceMotion = useReducedMotion()
  return (
    <span className="relative inline-flex size-2.5" aria-hidden>
      {live && !reduceMotion ? (
        <motion.span
          className="absolute inset-0 rounded-full bg-norma-signal"
          animate={{ opacity: [0.2, 0.55, 0.2], scale: [1, 1.9, 1] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}
      <span
        className={cn(
          'relative size-2.5 rounded-full',
          live ? 'bg-norma-signal' : 'bg-white/45',
        )}
      />
    </span>
  )
}

function asImpactParam(value: string | null): FindingImpact | null {
  if (!value) return null
  const raw = value.toUpperCase()
  return FINDING_IMPACTS.includes(raw as FindingImpact)
    ? (raw as FindingImpact)
    : null
}

function parseCivilParam(value: string | null): string | null {
  if (!value || !isCivilDate(value)) return null
  return value
}

function parsePageSize(value: string | null): PageSize {
  if (value === 'all') return 'all'
  const n = Number(value)
  if (n === 10 || n === 25 || n === 50) return n
  return 50
}

function parsePageNumber(value: string | null): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.floor(n)
}

function tamanoQueryValue(size: PageSize): string | null {
  if (size === 50) return null
  return String(size)
}

function orderedRange(
  dateFrom: string | null,
  dateTo: string | null,
): DateRangeFilter {
  if (dateFrom && dateTo && dateFrom > dateTo) {
    return { dateFrom: dateTo, dateTo: dateFrom }
  }
  return { dateFrom, dateTo }
}

function asFindingRows(value: unknown): FindingListItem[] {
  if (Array.isArray(value)) {
    const nested = (value as { items?: unknown }).items
    if (Array.isArray(nested)) return nested as FindingListItem[]
    return value as FindingListItem[]
  }
  if (value && typeof value === 'object') {
    const nested = (value as { items?: unknown }).items
    if (Array.isArray(nested)) return nested as FindingListItem[]
  }
  return []
}

export function FindingsPage() {
  const navigate = useNavigate()
  const { findingId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const today = civilDateToday()
  const clientFromUrl = searchParams.get('cliente') ?? ''
  const sourceFromUrl = searchParams.get('fuente') ?? ''
  const impactFilter = asImpactParam(searchParams.get('impacto'))
  const dateFrom = parseCivilParam(searchParams.get('desde'))
  const dateTo = parseCivilParam(searchParams.get('hasta'))
  const dateRange = useMemo(
    () => orderedRange(dateFrom, dateTo),
    [dateFrom, dateTo],
  )
  const pageSize = parsePageSize(searchParams.get('tamano'))
  const paged = pageSize !== 'all'
  const requestedPage = paged
    ? parsePageNumber(searchParams.get('pagina'))
    : 1
  const apiLimit = paged ? pageSize : ALL_PAGE_LIMIT

  const [clients, setClients] = useState<Client[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [clientId, setClientId] = useState(clientFromUrl)
  const [sourceId, setSourceId] = useState(sourceFromUrl)
  const [profileName, setProfileName] = useState<string | null>(null)
  const [items, setItems] = useState<FindingListItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [counts, setCounts] = useState<FindingsListCounts>(emptyListCounts)
  const [detail, setDetail] = useState<FindingDetail | null>(null)
  const [loadingClients, setLoadingClients] = useState(true)
  const [loadingSources, setLoadingSources] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [turningPage, setTurningPage] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [clientsError, setClientsError] = useState<string | null>(null)
  const [sourcesError, setSourcesError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [moreError, setMoreError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [clientsEpoch, setClientsEpoch] = useState(0)
  const [listEpoch, setListEpoch] = useState(0)

  const listQueryString = useMemo(() => {
    const qs = searchParams.toString()
    return qs ? `?${qs}` : ''
  }, [searchParams])

  const findingRows = useMemo(() => asFindingRows(items), [items])
  const hasMore = !paged && page < totalPages
  const hasDateRange = Boolean(dateRange.dateFrom || dateRange.dateTo)

  const selectedClient = clients.find((row) => row.id === clientId)
  const selectedName = selectedClient?.name ?? 'cliente'

  const listParams = useMemo(
    () => ({
      clientId,
      sourceId: sourceId || undefined,
      impact: impactFilter ?? undefined,
      status: 'OPEN' as const,
      limit: apiLimit,
      dateFrom: dateRange.dateFrom ?? undefined,
      dateTo: dateRange.dateTo ?? undefined,
    }),
    [clientId, sourceId, impactFilter, apiLimit, dateRange],
  )

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

  const buildSearch = useCallback(
    (overrides: {
      cliente?: string
      fuente?: string | null
      impacto?: FindingImpact | null
      desde?: string | null
      hasta?: string | null
      tamano?: string | null
    }) => {
      const cliente = overrides.cliente ?? clientId
      const fuente =
        overrides.fuente === undefined ? sourceId || null : overrides.fuente
      const impacto =
        overrides.impacto === undefined ? impactFilter : overrides.impacto
      const desde =
        overrides.desde === undefined ? dateRange.dateFrom : overrides.desde
      const hasta =
        overrides.hasta === undefined ? dateRange.dateTo : overrides.hasta
      const tamano =
        overrides.tamano === undefined
          ? tamanoQueryValue(pageSize)
          : overrides.tamano
      const next = new URLSearchParams()
      if (cliente) next.set('cliente', cliente)
      if (fuente) next.set('fuente', fuente)
      if (impacto) next.set('impacto', impacto)
      if (desde) next.set('desde', desde)
      if (hasta) next.set('hasta', hasta)
      if (tamano) next.set('tamano', tamano)
      const qs = next.toString()
      return qs ? `?${qs}` : ''
    },
    [clientId, sourceId, impactFilter, dateRange, pageSize],
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
      setProfileName(null)
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
    void clientsApi
      .get(clientId)
      .then((detailRow) => {
        if (cancelled) return
        const profile =
          detailRow.profiles.find((row) => row.status === 'ACTIVE') ??
          detailRow.profiles[0]
        setProfileName(profile?.name ?? null)
      })
      .catch(() => {
        if (!cancelled) setProfileName(null)
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
      setPage(1)
      setTotal(0)
      setTotalPages(1)
      setCounts(emptyListCounts())
      setLoadingList(false)
      setTurningPage(false)
      return
    }
    let cancelled = false
    const pageToLoad = paged ? requestedPage : 1
    const showSkeleton = !paged || pageToLoad === 1
    setListError(null)
    setMoreError(null)
    if (showSkeleton) {
      setLoadingList(true)
      setPage(1)
    } else {
      setTurningPage(true)
    }
    void findingsApi
      .list({ ...listParams, page: pageToLoad })
      .then((result) => {
        if (cancelled) return
        setItems(asFindingRows(result))
        setPage(result.page)
        setTotal(result.total)
        setTotalPages(result.totalPages)
        setCounts(result.counts)
        if (
          paged &&
          result.totalPages > 0 &&
          pageToLoad > result.totalPages
        ) {
          patchSearch({
            pagina: result.totalPages <= 1 ? null : String(result.totalPages),
          })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setItems([])
          setPage(1)
          setTotal(0)
          setTotalPages(1)
          setCounts(emptyListCounts())
          setListError(
            mapApiError(err, 'No se pudieron cargar los hallazgos. Reintenta.'),
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingList(false)
          setTurningPage(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [clientId, listParams, listEpoch, paged, requestedPage, patchSearch])

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

  useEffect(() => {
    if (loadingList) return
    if (findingRows.length === 0) return
    if (findingId && findingRows.some((row) => row.id === findingId)) return
    const first = findingRows[0]
    if (!first) return
    navigate(`/alertas/${first.id}${listQueryString}`, { replace: true })
  }, [findingId, listQueryString, loadingList, navigate, findingRows])

  function onClientChange(id: string) {
    setClientId(id)
    setSourceId('')
    navigate(`/alertas${buildSearch({ cliente: id, fuente: null })}`, {
      replace: true,
    })
  }

  function onSourceChange(id: string) {
    const selected = id === FILTER_ALL_SOURCES ? '' : id
    setSourceId(selected)
    patchSearch({ fuente: selected || null, pagina: null })
  }

  function onDateRangeChange(next: DateRangeFilter) {
    const ordered = orderedRange(next.dateFrom, next.dateTo)
    patchSearch({
      desde: ordered.dateFrom,
      hasta: ordered.dateTo,
      pagina: null,
    })
  }

  const loadMore = useCallback(() => {
    if (paged) return
    if (!clientId || loadingMore || loadingList) return
    if (page >= totalPages) return
    const nextPage = page + 1
    setLoadingMore(true)
    setMoreError(null)
    void findingsApi
      .list({ ...listParams, page: nextPage })
      .then((result) => {
        const extra = asFindingRows(result)
        if (extra.length === 0) {
          setTotalPages(page)
          return
        }
        setItems((prev) => {
          const rows = asFindingRows(prev)
          const seen = new Set(rows.map((row) => row.id))
          return [...rows, ...extra.filter((row) => !seen.has(row.id))]
        })
        setPage(result.page)
        setTotal(result.total)
        setTotalPages(result.totalPages)
        setCounts(result.counts)
      })
      .catch((err) => {
        setMoreError(
          mapApiError(err, 'No se pudo cargar la siguiente página. Reintenta.'),
        )
      })
      .finally(() => setLoadingMore(false))
  }, [clientId, listParams, loadingList, loadingMore, page, paged, totalPages])

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
  const pageSizeOptions = [
    ...PAGE_SIZES.map((size) => ({
      value: String(size),
      label: `${size} por página`,
    })),
    { value: 'all', label: 'Todos' },
  ]

  const emptyList = !loadingList && findingRows.length === 0 && !impactFilter
  const emptyImpact =
    !loadingList && findingRows.length === 0 && Boolean(impactFilter)
  const dossierWash = detail ? IMPACT_LAMP[detail.impact].wash : null
  const shiftLabel = loadingList
    ? 'Leyendo'
    : findingRows.length > 0
      ? 'En turno'
      : 'En mesa'

  const scopeLabel = !hasDateRange
    ? 'Toda la lista'
    : dateRange.dateFrom && dateRange.dateTo
      ? dateRange.dateFrom === dateRange.dateTo
        ? dateRange.dateFrom === today
          ? 'Hoy'
          : formatCivilDateLabel(dateRange.dateFrom)
        : `${formatCivilDateLabel(dateRange.dateFrom)} — ${formatCivilDateLabel(dateRange.dateTo)}`
      : dateRange.dateFrom
        ? `Desde ${formatCivilDateLabel(dateRange.dateFrom)}`
        : `Hasta ${formatCivilDateLabel(dateRange.dateTo ?? '')}`

  const emptyDescription = sourceId
    ? 'El agente no ha clasificado normas abiertas en esa fuente.'
    : hasDateRange
      ? 'No hay clasificaciones abiertas en ese rango.'
      : 'Cuando el agente clasifique documentos de este cliente, aparecerán aquí.'

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-accent">
          Sala de agentes
        </p>
        <h1 className="mt-1 font-display text-[2rem] font-semibold tracking-tight text-balance md:text-[2.35rem]">
          Clasificación
        </h1>
      </div>

      {loadingClients ? (
        <div aria-busy="true" aria-label="Cargando clientes">
          <Skeleton className="h-[min(calc(100dvh-13rem),52rem)] min-h-[28rem] w-full rounded-3xl" />
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
      ) : listError ? (
        <ErrorState
          message={listError}
          onRetry={() => setListEpoch((n) => n + 1)}
        />
      ) : (
        <div className="flex h-[min(calc(100dvh-13rem),52rem)] min-h-[28rem] flex-col overflow-hidden rounded-3xl border-2 border-norma-border bg-norma-surface shadow-[0_22px_48px_-24px_rgba(13,27,42,0.4)]">
          <header className="shrink-0 overflow-hidden bg-norma-navy text-white">
            <div className="bg-[radial-gradient(ellipse_80%_60%_at_12%_-20%,rgba(0,190,208,0.28),transparent_55%),radial-gradient(ellipse_at_90%_0%,rgba(105,88,248,0.32),transparent_50%)] px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-accent-soft">
                      Agente de clasificación
                    </p>
                    <PulseDot live={!loadingList && findingRows.length > 0} />
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80">
                      {shiftLabel}
                    </span>
                  </div>
                  <p className="mt-2 font-display text-lg font-semibold tracking-tight">
                    Hallazgos para {selectedName}
                  </p>
                  <p
                    className="mt-1 text-[11px] text-white/45"
                    aria-live="polite"
                  >
                    {loadingList
                      ? 'Leyendo la clasificación…'
                      : [
                          scopeLabel,
                          countLabel(
                            total,
                            'documento clasificado',
                            'documentos clasificados',
                          ),
                          findingRows.length < total
                            ? `${findingRows.length} en pantalla`
                            : null,
                          profileName ? `perfil: ${profileName}` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                  </p>
                </div>
                <div className="grid min-w-0 w-full gap-3 sm:max-w-xl sm:grid-cols-2 lg:w-[28rem]">
                  <div className="space-y-1">
                    <Label htmlFor="finding-client" className="text-white/50">
                      Cliente
                    </Label>
                    <Select
                      id="finding-client"
                      name="cliente"
                      value={clientId}
                      onValueChange={onClientChange}
                      options={clientOptions}
                      className={selectOnNavy}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="finding-source" className="text-white/50">
                      Fuente
                    </Label>
                    <Select
                      id="finding-source"
                      name="fuente"
                      value={sourceId || FILTER_ALL_SOURCES}
                      onValueChange={onSourceChange}
                      options={sourceOptions}
                      disabled={loadingSources}
                      className={selectOnNavy}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <FindingDateFilter
                  range={dateRange}
                  today={today}
                  onChange={onDateRangeChange}
                />
              </div>
              {loadingSources ? (
                <p className="mt-2 text-[11px] text-white/40">
                  Cargando fuentes…
                </p>
              ) : sourcesError ? (
                <p className="mt-2 text-[11px] text-norma-coral">
                  {sourcesError}
                </p>
              ) : sources.length === 0 ? (
                <p className="mt-2 text-[11px] text-white/40">
                  Este cliente no tiene fuentes en turno.
                </p>
              ) : null}
            </div>
          </header>

          <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,42%)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,1fr)] lg:grid-rows-none">
            <section className="flex min-h-0 min-w-0 flex-col border-b-2 border-norma-border lg:border-r-2 lg:border-b-0">
            <div className="shrink-0 border-b border-norma-border px-4 py-2.5 md:px-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-norma-subtle">
                  Impacto
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {paged ? (
                    <FindingPageNav
                      page={page}
                      totalPages={totalPages}
                      disabled={loadingList || turningPage}
                      onPrev={() =>
                        patchSearch({
                          pagina: page <= 2 ? null : String(page - 1),
                        })
                      }
                      onNext={() =>
                        patchSearch({
                          pagina: String(Math.min(totalPages, page + 1)),
                        })
                      }
                    />
                  ) : null}
                  <div className="w-[11rem]">
                    <Select
                      id="finding-page-size"
                      name="tamano"
                      aria-label="Tamaño de página"
                      value={String(pageSize)}
                      onValueChange={(value) =>
                        patchSearch({
                          tamano: tamanoQueryValue(
                            value === 'all'
                              ? 'all'
                              : parsePageSize(value),
                          ),
                          pagina: null,
                        })
                      }
                      options={pageSizeOptions}
                    />
                  </div>
                </div>
              </div>
              <ImpactFilter
                counts={counts}
                selected={impactFilter}
                loading={loadingList}
                onSelect={(impact) =>
                  patchSearch({
                    impacto: impact ?? null,
                    pagina: null,
                  })
                }
              />
            </div>
            <FindingListPanel
              items={findingRows}
              selectedId={findingId}
              loading={loadingList}
              itemTo={itemTo}
              hasMore={hasMore}
              loadingMore={loadingMore}
              infiniteScroll={!paged}
              onLoadMore={loadMore}
            />
            {moreError ? (
              <p className="shrink-0 px-4 pb-3 text-[11px] text-norma-coral md:px-5">
                {moreError}
              </p>
            ) : null}
          </section>

          <section
            aria-labelledby="finding-classification-heading"
            className={cn(
              'min-h-0 overflow-y-auto overscroll-contain p-5 md:p-7',
              dossierWash ?? 'bg-norma-bg/60',
            )}
          >
            <h2 id="finding-classification-heading" className="sr-only">
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
                description={emptyDescription}
              />
            ) : emptyImpact ? (
              <EmptyState
                title="Nada con ese impacto"
                description="No hay hallazgos abiertos de ese color con los filtros actuales."
              />
            ) : !findingId ? (
              <p className="max-w-sm text-sm leading-relaxed text-norma-muted">
                Elige un hallazgo. Aquí se lee lo que el agente clasificó y la
                acción que sugiere, junto al documento original.
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
        </div>
      )}
    </div>
  )
}
