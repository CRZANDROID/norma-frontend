import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { jobsApi } from '@/features/jobs/api/jobs-api'
import type { JobRun, JobsStatus } from '@/features/jobs/types/job'
import { JOB_RUN_STATUS_LABELS } from '@/features/jobs/types/job'
import { mapApiError } from '@/shared/lib/api-error'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ErrorState } from '@/shared/ui/page'
import { Skeleton } from '@/shared/ui/skeleton'

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function statusVariant(status: JobRun['status']) {
  if (status === 'SUCCESS') return 'active' as const
  if (status === 'FAILED') return 'accent' as const
  return 'signal' as const
}

export function JobsPanel({
  canCrawl,
  canReadRuns,
}: {
  canCrawl: boolean
  canReadRuns: boolean
}) {
  const [status, setStatus] = useState<JobsStatus | null>(null)
  const [runs, setRuns] = useState<JobRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [crawling, setCrawling] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const nextStatus = await jobsApi.status()
      setStatus(nextStatus)
      if (canReadRuns) {
        setRuns(await jobsApi.listRuns({ limit: 20 }))
      } else {
        setRuns([])
      }
    } catch (err) {
      setError(mapApiError(err, 'No se pudo cargar el estado de rastreo.'))
    } finally {
      setLoading(false)
    }
  }, [canReadRuns])

  useEffect(() => {
    void load()
  }, [load])

  async function crawlAll() {
    setCrawling(true)
    try {
      await jobsApi.crawlAll()
      toast.success('Rastreo de fuentes activas encolado.')
      await load()
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo encolar el rastreo.'))
    } finally {
      setCrawling(false)
    }
  }

  return (
    <section className="rounded-3xl border-2 border-norma-border bg-norma-surface p-6 shadow-[0_12px_32px_-18px_rgba(13,27,42,0.3)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Rastreo
          </h2>
          <p className="mt-1 text-sm text-norma-muted">
            El worker guarda HTML/PDF crudo. La extracción llega en un sprint
            posterior.
          </p>
        </div>
        {canCrawl ? (
          <Button
            type="button"
            variant="outline"
            disabled={crawling || status?.configured === false}
            onClick={() => void crawlAll()}
          >
            {crawling ? 'Encolando…' : 'Rastrear todas'}
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <div className="mt-4">
          <ErrorState message={error} onRetry={() => void load()} />
        </div>
      ) : (
        <>
          {status?.configured === false ? (
            <p className="mt-4 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Redis no configurado; el rastreo automático está apagado.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="active">
                Redis {status?.redis ?? 'configurado'}
              </Badge>
              {status?.connectors?.length ? (
                <Badge variant="signal">
                  {status.connectors.length} conectores
                </Badge>
              ) : null}
            </div>
          )}

          {canReadRuns ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-norma-border text-[11px] font-semibold uppercase tracking-[0.12em] text-norma-subtle">
                    <th className="py-2 pr-3">Fuente</th>
                    <th className="py-2 pr-3">Estado</th>
                    <th className="py-2 pr-3">Mensaje</th>
                    <th className="py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 text-norma-subtle"
                      >
                        Aún no hay corridas.
                      </td>
                    </tr>
                  ) : (
                    runs.map((run) => (
                      <tr
                        key={run.id}
                        className="border-b border-norma-border/70 align-top"
                      >
                        <td className="py-2.5 pr-3 font-mono text-xs">
                          {run.sourceCode || '—'}
                        </td>
                        <td className="py-2.5 pr-3">
                          <Badge variant={statusVariant(run.status)}>
                            {JOB_RUN_STATUS_LABELS[run.status]}
                          </Badge>
                        </td>
                        <td className="py-2.5 pr-3 text-norma-muted">
                          {run.message ?? '—'}
                        </td>
                        <td className="py-2.5 text-norma-subtle">
                          {formatWhen(run.finishedAt ?? run.startedAt ?? run.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-norma-subtle">
              El historial de corridas está disponible para analistas y
              administradores.
            </p>
          )}
        </>
      )}
    </section>
  )
}
