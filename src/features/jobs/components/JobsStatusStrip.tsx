import { Radio } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { JobsStatus } from '@/features/jobs/types/job'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ErrorState } from '@/shared/ui/page'
import { Skeleton } from '@/shared/ui/skeleton'

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

export function JobsStatusStrip({
  status,
  inFlight,
  live,
  loading,
  error,
  crawling,
  canCrawl,
  onRetry,
  onCrawl,
}: {
  status: JobsStatus | null
  inFlight: number
  live: boolean
  loading: boolean
  error: string | null
  crawling: boolean
  canCrawl: boolean
  onRetry: () => void
  onCrawl: () => void
}) {
  return (
    <section className="overflow-hidden rounded-3xl border-2 border-norma-border bg-norma-navy text-white shadow-[0_18px_40px_-22px_rgba(13,27,42,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Radio className="size-4 text-norma-accent-soft" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-accent-soft">
                Pulso de rastreo
              </p>
              <PulseDot live={live} />
            </div>
            <p className="mt-0.5 truncate text-xs text-white/65">
              Estado de Redis, colas y conectores — separado de la consulta al
              catálogo.
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
            onClick={onCrawl}
          >
            {crawling ? 'Encolando…' : 'Rastrear todas'}
          </Button>
        ) : null}
      </div>

      <div className="border-t border-white/10 bg-norma-navy/80 px-5 py-3">
        {loading ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <Skeleton className="h-14 w-full bg-white/10" />
            <Skeleton className="h-14 w-full bg-white/10" />
            <Skeleton className="h-14 w-full bg-white/10" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-1">
            <ErrorState message={error} onRetry={onRetry} />
          </div>
        ) : status?.configured === false ? (
          <p className="rounded-2xl border border-amber-200/40 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
            Redis no configurado; el rastreo automático está apagado.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                Redis
              </p>
              <p className="mt-1 font-display text-sm font-semibold">
                {status?.redis ?? 'configurado'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                En curso
              </p>
              <p className="mt-1 font-display text-sm font-semibold">
                {inFlight > 0
                  ? `${inFlight} corrida${inFlight === 1 ? '' : 's'}`
                  : 'En espera'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                Conectores
              </p>
              {status?.connectors?.length ? (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {status.connectors.map((connector) => (
                    <Badge key={connector.code} variant="signal">
                      {connector.label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-1 font-display text-sm font-semibold">—</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
