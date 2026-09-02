import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { documentsApi } from '@/features/documents'
import type { DocumentListItem, DocumentsProgress } from '@/features/documents'
import { findingsApi } from '@/features/findings'
import type { FindingsProgress } from '@/features/findings'
import { jobsApi } from '@/features/jobs'
import type { JobsProgress } from '@/features/jobs'
import {
  crawlBecameTerminal,
  groupPagesBySource,
  mergeJourneys,
  stepTone,
} from '@/features/dashboard/lib/agent-watch'
import { isApiCapacityError, mapApiError } from '@/shared/lib/api-error'

const POLL_LIVE_MS = 15_000
const POLL_IDLE_MS = 45_000
const POLL_FOLLOWUP_MS = 500
const HANDOFF_MS = 20_000
const BACKOFF_START_MS = 20_000
const BACKOFF_MAX_MS = 120_000

export function useAgentWatch(canRead: boolean) {
  const [crawl, setCrawl] = useState<JobsProgress | null>(null)
  const [extract, setExtract] = useState<DocumentsProgress | null>(null)
  const [analysis, setAnalysis] = useState<FindingsProgress | null>(null)
  const [pages, setPages] = useState<DocumentListItem[]>([])
  const [crawlError, setCrawlError] = useState<string | null>(null)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [pagesError, setPagesError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagesLoading, setPagesLoading] = useState(true)
  const [crawling, setCrawling] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const inFlight = useRef(false)
  const backoffMs = useRef(0)
  const backoffUntil = useRef(0)
  const crawlSnapshot = useRef<JobsProgress | null>(null)
  const followUp = useRef(false)
  const handoffUntil = useRef(0)

  const markCapacity = useCallback(() => {
    const next = backoffMs.current
      ? Math.min(backoffMs.current * 2, BACKOFF_MAX_MS)
      : BACKOFF_START_MS
    backoffMs.current = next
    backoffUntil.current = Date.now() + next
  }, [])

  const clearCapacity = useCallback(() => {
    backoffMs.current = 0
    backoffUntil.current = 0
  }, [])

  const loadProgress = useCallback(
    async (quiet = false) => {
      if (!canRead) {
        setCrawl(null)
        setExtract(null)
        setAnalysis(null)
        setCrawlError(null)
        setExtractError(null)
        setAnalysisError(null)
        crawlSnapshot.current = null
        followUp.current = false
        handoffUntil.current = 0
        setLoading(false)
        return
      }
      if (!quiet) setLoading(true)
      const [crawlResult, extractResult, analysisResult] =
        await Promise.allSettled([
          jobsApi.progress(),
          documentsApi.progress(),
          findingsApi.progress(),
        ])

      const capacity =
        (crawlResult.status === 'rejected' &&
          isApiCapacityError(crawlResult.reason)) ||
        (extractResult.status === 'rejected' &&
          isApiCapacityError(extractResult.reason)) ||
        (analysisResult.status === 'rejected' &&
          isApiCapacityError(analysisResult.reason))

      if (crawlResult.status === 'fulfilled') {
        if (crawlBecameTerminal(crawlSnapshot.current, crawlResult.value)) {
          followUp.current = true
          handoffUntil.current = Date.now() + HANDOFF_MS
        }
        crawlSnapshot.current = crawlResult.value
        setCrawl(crawlResult.value)
        setCrawlError(null)
      } else {
        setCrawlError(
          mapApiError(crawlResult.reason, 'No se pudo seguir el rastreo.'),
        )
        if (!quiet) setCrawl(null)
      }

      if (extractResult.status === 'fulfilled') {
        setExtract(extractResult.value)
        setExtractError(null)
      } else {
        setExtractError(
          mapApiError(extractResult.reason, 'No se pudo seguir la extracción.'),
        )
        if (!quiet) setExtract(null)
      }

      if (analysisResult.status === 'fulfilled') {
        setAnalysis(analysisResult.value)
        setAnalysisError(null)
      } else {
        setAnalysisError(
          mapApiError(analysisResult.reason, 'No se pudo seguir el análisis.'),
        )
        if (!quiet) setAnalysis(null)
      }

      if (capacity) markCapacity()
      else if (
        crawlResult.status === 'fulfilled' &&
        extractResult.status === 'fulfilled' &&
        analysisResult.status === 'fulfilled'
      ) {
        clearCapacity()
      }

      setUpdatedAt(Date.now())
      setLoading(false)
    },
    [canRead, clearCapacity, markCapacity],
  )

  const loadPages = useCallback(
    async (quiet = false) => {
      if (!canRead) {
        setPages([])
        setPagesError(null)
        setPagesLoading(false)
        return
      }
      if (!quiet) setPagesLoading(true)
      try {
        const rows = await documentsApi.list({ pilotOnly: true, limit: 800 })
        setPages(rows)
        setPagesError(null)
        clearCapacity()
      } catch (err) {
        setPagesError(
          mapApiError(err, 'No se pudieron listar las páginas extraídas.'),
        )
        if (!quiet) setPages([])
        if (isApiCapacityError(err)) markCapacity()
      } finally {
        setUpdatedAt(Date.now())
        setPagesLoading(false)
      }
    },
    [canRead, clearCapacity, markCapacity],
  )

  const load = useCallback(
    async (quiet = false) => {
      await Promise.all([loadProgress(quiet), loadPages(quiet)])
    },
    [loadProgress, loadPages],
  )

  useEffect(() => {
    void loadProgress()
    void loadPages()
  }, [loadProgress, loadPages])

  const journeys = useMemo(
    () => mergeJourneys(crawl, extract, analysis),
    [crawl, extract, analysis],
  )
  const live = journeys.some(
    (row) =>
      stepTone('crawl', row.crawl?.status) === 'live' ||
      stepTone('extract', row.extract?.status) === 'live' ||
      stepTone('analysis', row.analysis?.status) === 'live',
  )
  const liveRef = useRef(live)
  liveRef.current = live

  useEffect(() => {
    if (!canRead) return
    let cancelled = false
    let timer = 0

    const nextDelay = () => {
      if (followUp.current) return POLL_FOLLOWUP_MS
      const retryWait = Math.max(0, backoffUntil.current - Date.now())
      if (retryWait > 0) return retryWait
      const hot = liveRef.current || Date.now() < handoffUntil.current
      return hot ? POLL_LIVE_MS : POLL_IDLE_MS
    }

    const schedule = (ms: number) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        void tick()
      }, ms)
    }

    const tick = async () => {
      if (cancelled) return
      followUp.current = false
      if (document.hidden) {
        schedule(POLL_IDLE_MS)
        return
      }
      const wait = backoffUntil.current - Date.now()
      if (wait > 0) {
        schedule(wait)
        return
      }
      if (inFlight.current) {
        schedule(2000)
        return
      }
      inFlight.current = true
      try {
        await loadProgress(true)
      } finally {
        inFlight.current = false
        if (!cancelled) schedule(nextDelay())
      }
    }

    schedule(nextDelay())
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [canRead, live, loadProgress])

  const crawlAll = useCallback(async () => {
    setCrawling(true)
    try {
      await jobsApi.crawlAll()
      toast.success('El agente de rastreo ya salió a las fuentes.')
      await load(true)
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo poner a rastrear.'))
    } finally {
      setCrawling(false)
    }
  }, [load])

  const pagesBySource = useMemo(() => groupPagesBySource(pages), [pages])

  const crawledCount = journeys.filter(
    (row) => stepTone('crawl', row.crawl?.status) === 'done',
  ).length
  const extractCount = journeys.filter(
    (row) => stepTone('extract', row.extract?.status) !== 'wait',
  ).length
  const analysisCount = journeys.filter(
    (row) => stepTone('analysis', row.analysis?.status) === 'done',
  ).length

  return {
    crawl,
    extract,
    analysis,
    journeys,
    pagesBySource,
    pageCount: pages.length,
    date: crawl?.date || extract?.date || analysis?.date || '',
    crawledCount,
    extractCount,
    analysisCount,
    live,
    crawlError,
    extractError,
    analysisError,
    pagesError,
    loading,
    pagesLoading,
    crawling,
    updatedAt,
    load,
    crawlAll,
  }
}
