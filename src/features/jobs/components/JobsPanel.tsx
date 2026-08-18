import { useCallback, useEffect, useState } from 'react'
import { Radio } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { jobsApi } from '@/features/jobs/api/jobs-api'
import type { JobRun, JobsStatus } from '@/features/jobs/types/job'
import { JOB_RUN_STATUS_LABELS } from '@/features/jobs/types/job'
import { mapApiError } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'
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

function runTone(status: JobRun['status']) {
  if (status === 'SUCCESS') return 'bg-norma-green'
  if (status === 'FAILED') return 'bg-norma-red'
  if (status === 'RUNNING' || status === 'QUEUED') return 'bg-norma-signal'
  return 'bg-norma-subtle'
}

function statusVariant(status: JobRun['status']) {
  if (status === 'SUCCESS') return 'active' as const
  if (status === 'FAILED') return 'accent' as const
  return 'signal' as const
}

function PulseDot({ live }: { live: boolean }) {
  const reduceMotion = useReducedMotion()
  return (
    <span className="relative inline-flex size-2.5">
      {live && !reduceMotion ? (
        <motion.span
          className="absolute inset-0 rounded-full bg-norma-accent-soft"
          animate={{ opacity: [0.15, 0.55, 0.15], scale: [1, 1.85, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}
      <span
        className={cn(
          'relative size-2.5 rounded-full',
          live ? 'bg-norma-accent-soft' : 'bg-white/35',
        )}
      />
    </span>
  )
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
        setRuns(await jobsApi.listRuns({ limit: 12 }))
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

  const live = status?.configured !== false
  const sortedRuns = [...runs].sort((a, b) => {
    const ta = new Date(a.finishedAt ?? a.startedAt ?? a.createdAt).getTime()
    const tb = new Date(b.finishedAt ?? b.startedAt ?? b.createdAt).getTime()
    return tb - ta
  })
  const latest = sortedRuns[0]
  const olderRuns = sortedRuns.slice(1)
  const inFlight = sortedRuns.filter(
    (run) => run.status === 'RUNNING' || run.status === 'QUEUED',
  ).length

  return (
    <section className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-3xl border-2 border-norma-border bg-norma-surface shadow-[0_18px_40px_-22px_rgba(13,27,42,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 bg-norma-navy px-5 py-4 text-white">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-xl bg-white/10">
            <Radio className="size-4 text-norma-accent-soft" aria-hidden />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-accent-soft">
                Rastreo
              </p>
              <PulseDot live={live} />
            </div>
            <p className="mt-1 text-sm text-white/70">
              HTML y PDF crudo. La extracción llega después.
            </p>
          </div>
        </div>
        {canCrawl ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/20 bg-white/8 text-white hover:bg-white/14"
            disabled={crawling || status?.configured === false}
            onClick={() => void crawlAll()}
          >
            {crawling ? 'Encolando…' : 'Rastrear todas'}
          </Button>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-5">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : (
          <>
            {status?.configured === false ? (
              <p className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Redis no configurado; el rastreo automático está apagado.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border-2 border-norma-border bg-norma-raised/80 px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
                    Redis
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold">
                    {status?.redis ?? 'configurado'}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-norma-border bg-norma-raised/80 px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
                    En curso
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold">
                    {inFlight > 0
                      ? `${inFlight} corrida${inFlight === 1 ? '' : 's'}`
                      : 'En espera'}
                  </p>
                </div>
              </div>
            )}

            {status?.connectors?.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {status.connectors.map((connector) => (
                  <Badge key={connector} variant="signal">
                    {connector}
                  </Badge>
                ))}
              </div>
            ) : null}

            {canReadRuns ? (
              <div className="mt-5 min-h-0 flex-1 overflow-y-auto">
                {latest ? (
                  <div className="mb-4 rounded-2xl border-2 border-norma-border bg-[radial-gradient(ellipse_at_top_right,rgba(105,88,248,0.1),transparent_55%)] px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
                      Última corrida
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xs">{latest.sourceCode || '—'}</p>
                      <Badge variant={statusVariant(latest.status)}>
                        {JOB_RUN_STATUS_LABELS[latest.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-norma-muted">
                      {latest.message ?? 'Sin mensaje'}
                    </p>
                    <p className="mt-1 text-[11px] text-norma-subtle">
                      {formatWhen(
                        latest.finishedAt ?? latest.startedAt ?? latest.createdAt,
                      )}
                    </p>
                  </div>
                ) : null}

                {sortedRuns.length === 0 ? (
                  <p className="py-4 text-sm text-norma-subtle">
                    Aún no hay corridas.
                  </p>
                ) : olderRuns.length === 0 ? null : (
                  <ol className="space-y-0">
                    {olderRuns.map((run, index) => (
                      <li key={run.id} className="flex gap-3">
                        <div className="flex w-3 flex-col items-center">
                          <span
                            className={cn(
                              'mt-1.5 size-2.5 shrink-0 rounded-full',
                              runTone(run.status),
                            )}
                          />
                          {index < olderRuns.length - 1 ? (
                            <span className="w-px flex-1 bg-norma-border" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1 border-b border-norma-border/70 py-1.5 pb-3">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="font-mono text-xs">{run.sourceCode || '—'}</p>
                            <p className="text-[11px] text-norma-subtle">
                              {formatWhen(
                                run.finishedAt ?? run.startedAt ?? run.createdAt,
                              )}
                            </p>
                          </div>
                          <p className="mt-0.5 text-xs text-norma-muted">
                            {JOB_RUN_STATUS_LABELS[run.status]}
                            {run.message ? ` · ${run.message}` : ''}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-norma-subtle">
                El historial de corridas está disponible para analistas y
                administradores.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
