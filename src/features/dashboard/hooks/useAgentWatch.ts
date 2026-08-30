import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { documentsApi } from '@/features/documents'
import type { DocumentListItem, DocumentsProgress } from '@/features/documents'
import { jobsApi } from '@/features/jobs'
import type { JobsProgress } from '@/features/jobs'
import {
  groupPagesBySource,
  mergeJourneys,
  stepTone,
} from '@/features/dashboard/lib/agent-watch'
import { mapApiError } from '@/shared/lib/api-error'

const POLL_MS = 8000

export function useAgentWatch(canRead: boolean) {
  const [crawl, setCrawl] = useState<JobsProgress | null>(null)
  const [extract, setExtract] = useState<DocumentsProgress | null>(null)
  const [pages, setPages] = useState<DocumentListItem[]>([])
  const [crawlError, setCrawlError] = useState<string | null>(null)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [pagesError, setPagesError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagesLoading, setPagesLoading] = useState(true)
  const [crawling, setCrawling] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const loadProgress = useCallback(
    async (quiet = false) => {
      if (!canRead) {
        setCrawl(null)
        setExtract(null)
        setCrawlError(null)
        setExtractError(null)
        setLoading(false)
        return
      }
      if (!quiet) setLoading(true)
      const [crawlResult, extractResult] = await Promise.allSettled([
        jobsApi.progress(),
        documentsApi.progress(),
      ])

      if (crawlResult.status === 'fulfilled') {
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

      setUpdatedAt(Date.now())
      setLoading(false)
    },
    [canRead],
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
      } catch (err) {
        setPagesError(
          mapApiError(err, 'No se pudieron listar las páginas extraídas.'),
        )
        if (!quiet) setPages([])
      } finally {
        setUpdatedAt(Date.now())
        setPagesLoading(false)
      }
    },
    [canRead],
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

  useEffect(() => {
    if (!canRead) return
    const id = window.setInterval(() => {
      if (document.hidden) return
      void loadProgress(true)
      void loadPages(true)
    }, POLL_MS)
    return () => window.clearInterval(id)
  }, [canRead, loadProgress, loadPages])

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
  const journeys = useMemo(
    () => mergeJourneys(crawl, extract),
    [crawl, extract],
  )

  const crawledCount = journeys.filter(
    (row) => stepTone('crawl', row.crawl?.status) === 'done',
  ).length
  const extractCount = journeys.filter(
    (row) => stepTone('extract', row.extract?.status) !== 'wait',
  ).length
  const live = journeys.some(
    (row) =>
      stepTone('crawl', row.crawl?.status) === 'live' ||
      stepTone('extract', row.extract?.status) === 'live',
  )

  return {
    crawl,
    extract,
    journeys,
    pagesBySource,
    pageCount: pages.length,
    date: crawl?.date || extract?.date || '',
    crawledCount,
    extractCount,
    live,
    crawlError,
    extractError,
    pagesError,
    loading,
    pagesLoading,
    crawling,
    updatedAt,
    load,
    crawlAll,
  }
}
