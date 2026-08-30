import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, FileSearch, Radar } from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from 'motion/react'
import type { AgentSourceJourney, StepTone } from '@/features/dashboard/lib/agent-watch'
import {
  clipHeadline,
  formatClock,
  formatDay,
  splitPagesByKind,
  stepTone,
} from '@/features/dashboard/lib/agent-watch'
import { ExtractedPageModal, ExtractedPages } from '@/features/dashboard/components/ExtractedPages'
import { documentsApi, type DocumentListItem } from '@/features/documents'
import { duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ErrorState } from '@/shared/ui/page'
import { Skeleton } from '@/shared/ui/skeleton'

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

function toneDot(tone: StepTone) {
  if (tone === 'done') return 'bg-norma-green'
  if (tone === 'live') return 'bg-norma-signal'
  if (tone === 'warn') return 'bg-norma-amber'
  if (tone === 'fail') return 'bg-norma-red'
  return 'bg-norma-subtle/50'
}

function badgeFor(tone: StepTone) {
  if (tone === 'done') return 'active' as const
  if (tone === 'live') return 'signal' as const
  if (tone === 'warn') return 'caution' as const
  if (tone === 'fail') return 'danger' as const
  return 'inactive' as const
}

function PhaseMeter({
  label,
  done,
  total,
  accent,
}: {
  label: string
  done: number
  total: number
  accent: 'signal' | 'accent'
}) {
  const reduceMotion = useReducedMotion()
  const ratio = total === 0 ? 0 : done / total
  return (
    <div className="rounded-2xl border border-white/12 bg-white/6 px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
        {label}
      </p>
      <p className="mt-1 font-display text-lg font-semibold tabular-nums">
        {done}
        <span className="text-white/45"> / {total || '—'}</span>
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/12">
        <motion.span
          className={cn(
            'block h-full w-full origin-left rounded-full',
            accent === 'signal' ? 'bg-norma-signal' : 'bg-norma-accent-soft',
          )}
          initial={false}
          animate={{ scaleX: ratio }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: duration.modal, ease: easeOut }
          }
        />
      </div>
    </div>
  )
}

function StatusRailDot({ tone }: { tone: StepTone }) {
  const reduceMotion = useReducedMotion()
  const controls = useAnimationControls()
  const prevTone = useRef(tone)
  const hasMounted = useRef(false)

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      prevTone.current = tone
      return
    }
    if (prevTone.current === tone) return
    prevTone.current = tone

    if (reduceMotion) {
      if (tone !== 'live') {
        void controls.start({
          opacity: [1, 0.7, 1],
          transition: { duration: duration.fast, ease: easeOut },
        })
      }
      return
    }

    void controls.start({
      transform: ['scale(1)', 'scale(1.18)', 'scale(1)'],
      transition: { duration: duration.ui, ease: easeOut },
    })
  }, [tone, controls, reduceMotion])

  return (
    <motion.span
      initial={false}
      animate={controls}
      className={cn(
        'mt-1 size-2.5 shrink-0 origin-center rounded-full',
        toneDot(tone),
        tone === 'live' && 'motion-safe:animate-pulse',
      )}
    />
  )
}

function StepRow({
  icon: Icon,
  title,
  label,
  tone,
  meta,
  body,
  last,
}: {
  icon: typeof Radar
  title: string
  label: string
  tone: StepTone
  meta?: string | null
  body?: string | null
  last?: boolean
}) {
  return (
    <li className="flex gap-3">
      <div className="flex w-5 flex-col items-center">
        <StatusRailDot tone={tone} />
        {last ? null : (
          <span className="mt-1 w-px flex-1 bg-norma-border/80" />
        )}
      </div>
      <div className={cn('min-w-0 flex-1', last ? 'pb-0' : 'pb-4')}>
        <div className="flex flex-wrap items-center gap-2">
          <Icon className="size-3.5 text-norma-subtle" aria-hidden />
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-norma-subtle">
            {title}
          </p>
          <span className="inline-grid">
            <AnimatePresence initial={false}>
              <motion.span
                key={`${tone}-${label}`}
                className="col-start-1 row-start-1 inline-flex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.fast, ease: easeOut }}
              >
                <Badge variant={badgeFor(tone)}>{label}</Badge>
              </motion.span>
            </AnimatePresence>
          </span>
          {meta ? (
            <p className="text-[11px] text-norma-subtle">{meta}</p>
          ) : null}
        </div>
        {body ? (
          <p className="mt-1.5 text-sm leading-relaxed text-norma-muted">{body}</p>
        ) : null}
      </div>
    </li>
  )
}

function SourceCard({
  journey,
  index,
  pageCount,
  pdfCount,
  wordCount,
  htmlCount,
  pagesLoading,
  onOpen,
}: {
  journey: AgentSourceJourney
  index: number
  pageCount: number
  pdfCount: number
  wordCount: number
  htmlCount: number
  pagesLoading: boolean
  onOpen: () => void
}) {
  const reduceMotion = useReducedMotion()
  const crawlTone = stepTone('crawl', journey.crawl?.status)
  const extractTone = stepTone('extract', journey.extract?.status)
  const clock = formatClock(journey.crawl?.at ?? null)
  const headline = journey.extract?.headline
    ? clipHeadline(journey.extract.headline)
    : null

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: duration.ui,
        ease: easeOut,
        delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.28),
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-stretch gap-2 rounded-2xl border-2 border-norma-border bg-norma-raised/80 px-4 py-3.5 text-left hover:border-norma-navy/25 hover:bg-norma-raised"
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[0.95rem] font-semibold tracking-tight text-balance">
            {journey.sourceName}
          </h3>
          <ol className="mt-3">
            <StepRow
              icon={Radar}
              title="Rastreo"
              label={journey.crawl?.label ?? 'En espera'}
              tone={crawlTone}
              meta={clock ? `a las ${clock}` : null}
              body={journey.crawl?.note}
            />
            <StepRow
              icon={FileSearch}
              title="Extracción"
              label={journey.extract?.label ?? 'Esperando su turno'}
              tone={extractTone}
              body={
                journey.extract?.note ??
                (headline ? `Leyó: ${headline}` : null)
              }
              last
            />
          </ol>
          <p className="mt-2 text-[12px] text-norma-subtle">
            {pagesLoading && pageCount === 0
              ? 'Cargando documentos…'
              : pageCount === 0
                ? 'Sin documentos aún'
                : `${pdfCount} PDF${wordCount ? ` · ${wordCount} Word` : ''} · ${htmlCount} HTML`}
          </p>
        </div>
        <ChevronRight
          className="mt-1 size-4 shrink-0 text-norma-subtle"
          aria-hidden
        />
        <span className="sr-only">Ver documentos extraídos</span>
      </button>
    </motion.article>
  )
}

function SourceDetail({
  journey,
  pages,
  pagesLoading,
  onBack,
  onOpenPage,
}: {
  journey: AgentSourceJourney
  pages: DocumentListItem[]
  pagesLoading: boolean
  onBack: () => void
  onOpenPage: (doc: DocumentListItem) => void
}) {
  const crawlTone = stepTone('crawl', journey.crawl?.status)
  const extractTone = stepTone('extract', journey.extract?.status)
  const clock = formatClock(journey.crawl?.at ?? null)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
            <ChevronLeft className="size-4" aria-hidden />
            Fuentes
          </Button>
          <h3 className="min-w-0 flex-1 font-display text-xl font-semibold tracking-tight text-balance">
            {journey.sourceName}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={badgeFor(crawlTone)}>
            {journey.crawl?.label ?? 'En espera'}
          </Badge>
          {clock ? (
            <span className="text-xs text-norma-subtle">a las {clock}</span>
          ) : null}
          <Badge variant={badgeFor(extractTone)}>
            {journey.extract?.label ?? 'Esperando su turno'}
          </Badge>
        </div>
        {journey.crawl?.note || journey.extract?.note ? (
          <p className="text-sm leading-relaxed text-norma-muted">
            {[journey.crawl?.note, journey.extract?.note]
              .filter(Boolean)
              .join(' ')}
          </p>
        ) : null}
      </div>
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto border-t border-norma-border/80 pt-4">
        <ExtractedPages
          pages={pages}
          loading={pagesLoading}
          onOpen={onOpenPage}
        />
      </div>
    </div>
  )
}

export function AgentWatch({
  canRead,
  canCrawl,
  journeys,
  pagesBySource,
  date,
  crawledCount,
  extractCount,
  pageCount,
  live,
  crawlError,
  extractError,
  pagesError,
  loading,
  pagesLoading,
  crawling,
  onRetry,
  onCrawl,
  onDetailChange,
}: {
  canRead: boolean
  canCrawl: boolean
  journeys: AgentSourceJourney[]
  pagesBySource: Map<string, DocumentListItem[]>
  date: string
  crawledCount: number
  extractCount: number
  pageCount: number
  live: boolean
  crawlError: string | null
  extractError: string | null
  pagesError: string | null
  loading: boolean
  pagesLoading: boolean
  crawling: boolean
  onRetry: () => void
  onCrawl: () => void
  onDetailChange?: (sourceId: string | null) => void
}) {
  const [openDoc, setOpenDoc] = useState<DocumentListItem | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [fetchedSourcePages, setFetchedSourcePages] = useState<
    DocumentListItem[] | null
  >(null)
  const reduceMotion = useReducedMotion()
  const day = formatDay(date)
  const total = journeys.length
  const fatal = Boolean(crawlError && extractError && journeys.length === 0)
  const selected = selectedId
    ? (journeys.find((row) => row.sourceId === selectedId) ?? null)
    : null
  const cachedPages = selected
    ? (pagesBySource.get(selected.sourceId) ?? [])
    : []
  const selectedPages =
    cachedPages.length > 0 ? cachedPages : (fetchedSourcePages ?? [])
  const sourcePagesLoading =
    Boolean(selected) && cachedPages.length === 0 && fetchedSourcePages === null

  const selectSource = useCallback(
    (id: string | null) => {
      setSelectedId(id)
      onDetailChange?.(id)
    },
    [onDetailChange],
  )

  useEffect(() => {
    if (!selectedId) {
      setFetchedSourcePages(null)
      return
    }
    const cached = pagesBySource.get(selectedId) ?? []
    if (cached.length > 0) {
      setFetchedSourcePages(null)
      return
    }
    let cancelled = false
    void documentsApi
      .list({ sourceId: selectedId, limit: 80 })
      .then((rows) => {
        if (!cancelled) setFetchedSourcePages(rows)
      })
      .catch(() => {
        if (!cancelled) setFetchedSourcePages([])
      })
    return () => {
      cancelled = true
    }
  }, [selectedId, pagesBySource])

  useEffect(() => {
    if (!selectedId) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !openDoc) {
        selectSource(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, openDoc, selectSource])

  return (
    <section
      className={cn(
        'flex h-[min(calc(100dvh-13rem),52rem)] min-h-[28rem] flex-col overflow-hidden rounded-3xl border-2 border-norma-border bg-norma-surface shadow-[0_22px_48px_-24px_rgba(13,27,42,0.4)]',
      )}
    >
      <header className="shrink-0 overflow-hidden bg-norma-navy text-white">
        <div
          className={cn(
            'bg-[radial-gradient(ellipse_80%_60%_at_12%_-20%,rgba(0,190,208,0.28),transparent_55%),radial-gradient(ellipse_at_90%_0%,rgba(105,88,248,0.32),transparent_50%)] px-5',
            selected ? 'py-3' : 'py-4',
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-accent-soft">
                  Agentes en turno
                </p>
                <PulseDot live={live} />
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80">
                  {live ? 'Trabajando' : 'En mesa'}
                </span>
              </div>
              {selected ? null : day ? (
                <p className="mt-2 text-[11px] capitalize text-white/45">
                  Ronda del {day}
                </p>
              ) : null}
              {selected ? null : (
                <p className="mt-1 text-[10px] text-white/40">
                  {pagesLoading && pageCount === 0
                    ? 'Cargando documentos de la ronda…'
                    : `${pageCount} documento${pageCount === 1 ? '' : 's'} en la ronda.`}{' '}
                  Abre una fuente para ver PDF, Word y HTML.
                </p>
              )}
            </div>
            {canCrawl ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-white/20 bg-white/8 text-white hover:bg-white/14"
                disabled={crawling}
                onClick={onCrawl}
              >
                {crawling ? 'Saliendo…' : 'Poner a rastrear'}
              </Button>
            ) : null}
          </div>

          {selected || !canRead ? null : loading ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Skeleton className="h-[4.75rem] w-full bg-white/10" />
              <Skeleton className="h-[4.75rem] w-full bg-white/10" />
            </div>
          ) : (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <PhaseMeter
                label="Agente de rastreo"
                done={crawledCount}
                total={total}
                accent="signal"
              />
              <PhaseMeter
                label="Agente de extracción"
                done={extractCount}
                total={total}
                accent="accent"
              />
            </div>
          )}
        </div>
      </header>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-5"
      >
        {!canRead ? (
          <p className="text-sm text-norma-subtle">
            El seguimiento de los agentes está disponible para analistas y
            administradores.
          </p>
        ) : loading ? (
          <div className="space-y-2">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : fatal ? (
          <ErrorState
            message={crawlError ?? extractError ?? 'No se pudo seguir a los agentes.'}
            onRetry={onRetry}
          />
        ) : (
          <>
            {crawlError ? (
              <p className="mb-3 rounded-2xl border border-norma-coral/25 bg-norma-coral/8 px-3 py-2 text-sm text-norma-coral" role="alert">
                {crawlError}
              </p>
            ) : null}
            {extractError ? (
              <p className="mb-3 rounded-2xl border border-norma-coral/25 bg-norma-coral/8 px-3 py-2 text-sm text-norma-coral" role="alert">
                {extractError}
              </p>
            ) : null}
            {pagesError ? (
              <p className="mb-3 rounded-2xl border border-norma-coral/25 bg-norma-coral/8 px-3 py-2 text-sm text-norma-coral" role="alert">
                {pagesError}
              </p>
            ) : null}
            {total === 0 ? (
              <p className="text-sm leading-relaxed text-norma-subtle">
                Aún no hay fuentes en la ronda de hoy. Cuando el agente salga a
                rastrear, aquí verás cada visita y si pudo extraer texto.
              </p>
            ) : (
              <div className="relative min-h-0 flex-1">
                <AnimatePresence initial={false}>
                  {selected ? (
                    <motion.div
                      key="source-detail"
                      className="absolute inset-0 flex flex-col overflow-hidden"
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { duration: duration.ui, ease: easeOut }
                      }
                    >
                      <SourceDetail
                        journey={selected}
                        pages={selectedPages}
                        pagesLoading={sourcePagesLoading}
                        onBack={() => selectSource(null)}
                        onOpenPage={setOpenDoc}
                      />
                    </motion.div>
                  ) : (
                    <motion.ul
                      key="source-list"
                      className="absolute inset-0 space-y-2.5 overflow-y-auto"
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { duration: duration.ui, ease: easeOut }
                      }
                    >
                      {journeys.map((journey, index) => {
                        const pages = pagesBySource.get(journey.sourceId) ?? []
                        const kinds = splitPagesByKind(pages)
                        return (
                          <li key={journey.sourceId}>
                            <SourceCard
                              journey={journey}
                              index={index}
                              pageCount={
                                kinds.pdf.length +
                                kinds.word.length +
                                kinds.html.length
                              }
                              pdfCount={kinds.pdf.length}
                              wordCount={kinds.word.length}
                              htmlCount={kinds.html.length}
                              pagesLoading={pagesLoading}
                              onOpen={() => selectSource(journey.sourceId)}
                            />
                          </li>
                        )
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )}
            <ExtractedPageModal
              doc={openDoc}
              onClose={() => setOpenDoc(null)}
            />
          </>
        )}
      </div>
    </section>
  )
}
