import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, FileText, MessageSquare, Trash2 } from 'lucide-react'
import type { AlertLevel } from '@/features/clients/types/client'
import { LEVEL_COPY, type PreviewFinding } from '@/features/alerts/lib/preview-findings'
import { detailCrossfade, duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

const RAIL: Record<AlertLevel, string> = {
  GREEN: 'bg-norma-green',
  YELLOW: 'bg-norma-amber',
  ORANGE: 'bg-norma-coral',
  RED: 'bg-norma-red',
}

const TONE: Record<AlertLevel, string> = {
  GREEN: 'text-norma-green',
  YELLOW: 'text-norma-amber',
  ORANGE: 'text-norma-coral',
  RED: 'text-norma-red',
}

function formatWhen(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function FindingBoard({
  findings,
  selectedId,
  onSelect,
}: {
  findings: PreviewFinding[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const reduceMotion = useReducedMotion()
  const selected = findings.find((item) => item.id === selectedId) ?? findings[0]

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <ol className="space-y-2" aria-label="Hallazgos de ejemplo">
        {findings.map((item, index) => {
          const active = item.id === selected?.id
          return (
            <li key={item.id}>
              <motion.button
                type="button"
                onClick={() => onSelect(item.id)}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: duration.fast,
                  ease: easeOut,
                  delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.2),
                }}
                className={cn(
                  'flex w-full gap-3 rounded-2xl border-2 bg-norma-surface p-3.5 text-left transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45',
                  active
                    ? 'border-norma-navy/25 shadow-[0_10px_28px_-18px_rgba(13,27,42,0.4)]'
                    : 'border-transparent hover:border-norma-border hover:bg-norma-raised/80',
                )}
              >
                <span
                  className={cn('mt-1 h-10 w-1.5 shrink-0 rounded-full', RAIL[item.level])}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className={cn('text-[11px] font-semibold uppercase tracking-[0.14em]', TONE[item.level])}>
                    {LEVEL_COPY[item.level].label}
                  </span>
                  <span className="mt-1 block font-display text-sm font-semibold leading-snug text-balance">
                    {item.title}
                  </span>
                  <span className="mt-1.5 block truncate font-mono text-[10px] text-norma-subtle">
                    {item.sourceCode} · {formatWhen(item.publishedAt)}
                  </span>
                </span>
              </motion.button>
            </li>
          )
        })}
      </ol>

      <section className="min-h-[28rem] rounded-3xl border-2 border-norma-border bg-norma-surface p-5 shadow-[0_12px_32px_-18px_rgba(13,27,42,0.35)] md:p-6">
        <AnimatePresence mode="wait" initial={false}>
          {selected ? (
            <motion.div
              key={selected.id}
              initial={reduceMotion ? false : detailCrossfade.initial}
              animate={detailCrossfade.animate}
              exit={reduceMotion ? undefined : detailCrossfade.exit}
              transition={{ duration: duration.fast, ease: easeOut }}
              className="flex h-full flex-col"
            >
              <p className={cn('text-[11px] font-semibold uppercase tracking-[0.16em]', TONE[selected.level])}>
                {LEVEL_COPY[selected.level].tempo} · {selected.clientName}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-balance">
                {selected.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-norma-muted">
                {selected.excerpt}
              </p>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl bg-norma-raised/80 px-3.5 py-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
                    Fuente
                  </dt>
                  <dd className="mt-1 font-medium">
                    {selected.sourceName}
                    <span className="ml-1.5 font-mono text-[11px] text-norma-subtle">
                      {selected.sourceCode}
                    </span>
                  </dd>
                </div>
                <div className="rounded-2xl bg-norma-raised/80 px-3.5 py-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
                    Publicado
                  </dt>
                  <dd className="mt-1 font-medium">{formatWhen(selected.publishedAt)}</dd>
                </div>
              </dl>

              <figure className="mt-5 rounded-2xl border-l-4 border-norma-accent bg-norma-raised/60 px-4 py-3">
                <figcaption className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-accent">
                  Por qué este color
                </figcaption>
                <blockquote className="mt-2 text-sm leading-relaxed text-norma-fg">
                  {selected.justification}
                </blockquote>
              </figure>

              <p className="mt-4 text-sm text-norma-muted">
                <span className="font-semibold text-norma-fg">Si esto fuera real: </span>
                {selected.suggestedAction}
              </p>

              <div className="mt-auto border-t-2 border-norma-border pt-4">
                <p className="mb-3 text-[11px] text-norma-subtle">
                  Acciones del inbox humano (Sprint 8). Aquí solo se ensaya el gesto.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" disabled>
                    <FileText className="size-3.5" aria-hidden />
                    Avanzar a borrador
                  </Button>
                  <Button type="button" variant="outline" disabled>
                    <MessageSquare className="size-3.5" aria-hidden />
                    Pedir revisión
                  </Button>
                  <Button type="button" variant="ghost" disabled>
                    <Trash2 className="size-3.5" aria-hidden />
                    Descartar
                  </Button>
                </div>
                <Link
                  to="/clientes"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-norma-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
                >
                  Las reglas de aviso por color se configuran en cada cliente
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </motion.div>
          ) : (
            <p className="text-sm text-norma-muted">Elige un hallazgo de la lista.</p>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}
