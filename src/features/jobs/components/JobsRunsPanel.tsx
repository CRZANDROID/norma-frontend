import type { JobRun } from '@/features/jobs/types/job'
import { JOB_RUN_STATUS_LABELS } from '@/features/jobs/types/job'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
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

export function JobsRunsPanel({
  latest,
  olderRuns,
  sortedCount,
  loading,
  canReadRuns,
}: {
  latest: JobRun | null
  olderRuns: JobRun[]
  sortedCount: number
  loading: boolean
  canReadRuns: boolean
}) {
  return (
    <section className="flex max-h-[min(68dvh,40rem)] min-h-[22rem] flex-col overflow-hidden rounded-3xl border-2 border-norma-border bg-norma-surface shadow-[0_18px_40px_-22px_rgba(13,27,42,0.35)]">
      <header className="shrink-0 border-b-2 border-norma-border px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-subtle">
          Corridas
        </p>
        <p className="mt-1 text-sm text-norma-muted">
          Historial reciente de rastreo, sin mezclarlo con el chat.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !canReadRuns ? (
          <p className="text-sm text-norma-subtle">
            El historial de corridas está disponible para analistas y
            administradores.
          </p>
        ) : sortedCount === 0 ? (
          <p className="text-sm text-norma-subtle">Aún no hay corridas.</p>
        ) : (
          <>
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

            {olderRuns.length === 0 ? null : (
              <ol>
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
                        <p className="font-mono text-xs">
                          {run.sourceCode || '—'}
                        </p>
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
          </>
        )}
      </div>
    </section>
  )
}
