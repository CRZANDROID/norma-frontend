import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { clientsApi, type Client } from '@/features/clients'
import { ReportDetailPanel } from '@/features/reports/components/ReportDetailPanel'
import { ReportListPanel } from '@/features/reports/components/ReportListPanel'
import { reportsApi } from '@/features/reports/api/reports-api'
import type {
  ReportDetail,
  ReportListItem,
  ReportStatus,
} from '@/features/reports/types/report'
import { mapApiError } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'
import { Label } from '@/shared/ui/label'
import { EmptyState, ErrorState } from '@/shared/ui/page'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

const STATUS_CHIPS: Array<{ id: ReportStatus; label: string }> = [
  { id: 'draft', label: 'Borradores' },
  { id: 'sent', label: 'Enviados' },
]

const selectOnNavy =
  'border-white/20 bg-white/8 text-white shadow-none hover:bg-white/14 hover:text-white focus-visible:border-norma-accent-soft focus-visible:ring-white/20 data-[state=open]:border-norma-accent-soft data-[state=open]:bg-white/12 data-[state=open]:ring-white/15 [&[data-placeholder]]:text-white/45 [&_svg]:text-white/70'

function asStatusParam(value: string | null): ReportStatus {
  if (value === 'sent') return 'sent'
  return 'draft'
}

export function ReportsPage() {
  const navigate = useNavigate()
  const { reportId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const clientFromUrl = searchParams.get('cliente') ?? ''
  const status = asStatusParam(searchParams.get('estado'))

  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState(clientFromUrl)
  const [items, setItems] = useState<ReportListItem[]>([])
  const [detail, setDetail] = useState<ReportDetail | null>(null)
  const [loadingClients, setLoadingClients] = useState(true)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [clientsError, setClientsError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [clientsEpoch, setClientsEpoch] = useState(0)
  const [listEpoch, setListEpoch] = useState(0)

  const listQueryString = useMemo(() => {
    const qs = searchParams.toString()
    return qs ? `?${qs}` : ''
  }, [searchParams])

  const selectedClient = clients.find((row) => row.id === clientId)
  const selectedName = selectedClient?.name ?? 'cliente'

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
        if (!cancelled) setClients(rows)
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
      setItems([])
      setLoadingList(false)
      return
    }
    let cancelled = false
    setLoadingList(true)
    setListError(null)
    void reportsApi
      .list({ clientId, status, limit: 50 })
      .then((page) => {
        if (!cancelled) setItems(page.items)
      })
      .catch((err) => {
        if (!cancelled) {
          setItems([])
          setListError(
            mapApiError(err, 'No se pudieron cargar los informes. Reintenta.'),
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false)
      })
    return () => {
      cancelled = true
    }
  }, [clientId, status, listEpoch])

  useEffect(() => {
    if (!reportId) {
      setDetail(null)
      setDetailError(null)
      return
    }
    let cancelled = false
    setLoadingDetail(true)
    setDetailError(null)
    void reportsApi
      .get(reportId)
      .then((row) => {
        if (!cancelled) setDetail(row)
      })
      .catch((err) => {
        if (!cancelled) {
          setDetail(null)
          setDetailError(
            mapApiError(err, 'No se pudo cargar el informe. Reintenta.'),
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false)
      })
    return () => {
      cancelled = true
    }
  }, [reportId])

  useEffect(() => {
    if (loadingList) return
    if (items.length === 0) return
    if (reportId && items.some((row) => row.id === reportId)) return
    const first = items[0]
    if (!first) return
    navigate(`/informes/${first.id}${listQueryString}`, { replace: true })
  }, [loadingList, items, reportId, listQueryString, navigate])

  function onClientChange(id: string) {
    setClientId(id)
    navigate(`/informes?cliente=${id}&estado=${status}`, { replace: true })
  }

  const clientOptions = clients.map((row) => ({
    value: row.id,
    label: row.name,
  }))

  const chipFocus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45'
  const chip =
    'inline-flex min-h-9 items-center rounded-full border-2 px-3 py-1 text-xs font-semibold transition-[background-color,border-color] duration-150'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 lg:gap-4">
      <div className="shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-accent">
          Sala de agentes
        </p>
        <h1 className="mt-1 font-display text-[1.75rem] font-semibold tracking-tight text-balance [@media(min-height:50rem)]:text-[2.35rem]">
          Informes
        </h1>
      </div>

      {loadingClients ? (
        <Skeleton className="min-h-0 w-full flex-1 rounded-3xl" />
      ) : clientsError && clients.length === 0 ? (
        <ErrorState
          message={clientsError}
          onRetry={() => setClientsEpoch((n) => n + 1)}
        />
      ) : clients.length === 0 ? (
        <EmptyState
          title="No hay clientes activos"
          description="Cuando exista un cliente, sus informes aparecerán aquí."
        />
      ) : listError ? (
        <ErrorState
          message={listError}
          onRetry={() => setListEpoch((n) => n + 1)}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border-2 border-norma-border bg-norma-surface shadow-[0_22px_48px_-24px_rgba(13,27,42,0.4)]">
          <header className="shrink-0 overflow-hidden bg-norma-navy text-white">
            <div className="px-5 py-3 [@media(min-height:50rem)]:py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-accent-soft">
                Mesa de informes
              </p>
              <p className="mt-1.5 font-display text-lg font-semibold tracking-tight">
                PDFs de {selectedName}
              </p>
              <p className="mt-1 hidden text-[11px] text-white/45 [@media(min-height:50rem)]:block">
                El lote se genera en Clasificación. Aquí se ve, descarga y
                regenera.
              </p>
              <div className="mt-3 max-w-md space-y-1 [@media(min-height:50rem)]:mt-4">
                <Label htmlFor="report-client" className="text-white/50">
                  Cliente
                </Label>
                <Select
                  id="report-client"
                  name="cliente"
                  value={clientId}
                  onValueChange={onClientChange}
                  options={clientOptions}
                  className={selectOnNavy}
                />
              </div>
            </div>
          </header>
          <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,42%)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,1fr)] lg:grid-rows-none">
            <section className="flex min-h-0 min-w-0 flex-col border-b-2 border-norma-border lg:border-r-2 lg:border-b-0">
              <div className="shrink-0 border-b border-norma-border px-4 py-2.5 md:px-5">
                <div
                  className="flex flex-wrap items-center gap-1.5"
                  role="group"
                  aria-label="Estado del informe"
                >
                  {STATUS_CHIPS.map((item) => {
                    const isOn = status === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={isOn}
                        onClick={() =>
                          patchSearch({
                            estado: item.id === 'draft' ? null : item.id,
                          })
                        }
                        className={cn(
                          chip,
                          chipFocus,
                          isOn
                            ? 'border-norma-accent/40 bg-norma-accent/10 text-norma-accent'
                            : 'border-norma-border bg-norma-surface text-norma-muted hover:bg-norma-raised',
                        )}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <ReportListPanel
                items={items}
                selectedId={reportId}
                loading={loadingList}
                itemTo={(id) => `/informes/${id}${listQueryString}`}
              />
            </section>
            <section className="relative flex min-h-0 flex-col overflow-hidden bg-norma-bg/60">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 md:p-7">
                {loadingList && !reportId ? (
                  <div className="space-y-4" aria-busy="true">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-10 w-3/4" />
                  </div>
                ) : items.length === 0 ? (
                  <EmptyState
                    title={
                      status === 'sent'
                        ? 'Aún no hay informes enviados'
                        : 'Aún no hay borradores'
                    }
                    description="Genera el PDF desde Clasificación con los hallazgos Incluidos."
                  />
                ) : !reportId ? (
                  <p className="max-w-sm text-sm leading-relaxed text-norma-muted">
                    Elige un informe para ver el lote y el archivo.
                  </p>
                ) : loadingDetail ? (
                  <div className="space-y-4" aria-busy="true">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : detailError && !detail ? (
                  <ErrorState
                    message={detailError}
                    onRetry={() => {
                      setDetailError(null)
                      setListEpoch((n) => n + 1)
                    }}
                  />
                ) : detail ? (
                  <ReportDetailPanel
                    report={detail}
                    onUpdated={(next) => {
                      setDetail(next)
                      setItems((prev) =>
                        prev.map((row) =>
                          row.id === next.id
                            ? {
                                ...row,
                                findingCount: next.findingCount,
                                counts: next.counts,
                                fileUrl: next.fileUrl,
                                generatedAt: next.generatedAt,
                              }
                            : row,
                        ),
                      )
                    }}
                  />
                ) : null}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
