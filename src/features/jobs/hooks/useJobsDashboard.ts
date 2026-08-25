import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { documentsApi } from '@/features/documents'
import type { DocumentListItem } from '@/features/documents'
import { jobsApi } from '@/features/jobs/api/jobs-api'
import type { JobRun, JobsStatus } from '@/features/jobs/types/job'
import { mapApiError } from '@/shared/lib/api-error'

export function useJobsDashboard(canReadRuns: boolean) {
  const [status, setStatus] = useState<JobsStatus | null>(null)
  const [runs, setRuns] = useState<JobRun[]>([])
  const [documents, setDocuments] = useState<DocumentListItem[]>([])
  const [documentsError, setDocumentsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [crawling, setCrawling] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setDocumentsError(null)
    try {
      const nextStatus = await jobsApi.status()
      setStatus(nextStatus)
      if (canReadRuns) {
        const [nextRuns, nextDocs] = await Promise.all([
          jobsApi.listRuns({ limit: 12 }),
          documentsApi.list({ pilotOnly: true, limit: 8 }).catch((err) => {
            setDocumentsError(
              mapApiError(err, 'No se pudo cargar el registro documental.'),
            )
            return [] as DocumentListItem[]
          }),
        ])
        setRuns(nextRuns)
        setDocuments(nextDocs)
      } else {
        setRuns([])
        setDocuments([])
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

  const crawlAll = useCallback(async () => {
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
  }, [load])

  const sortedRuns = useMemo(() => {
    return [...runs].sort((a, b) => {
      const ta = new Date(a.finishedAt ?? a.startedAt ?? a.createdAt).getTime()
      const tb = new Date(b.finishedAt ?? b.startedAt ?? b.createdAt).getTime()
      return tb - ta
    })
  }, [runs])

  const latest = sortedRuns[0] ?? null
  const olderRuns = sortedRuns.slice(1)
  const inFlight = sortedRuns.filter(
    (run) => run.status === 'RUNNING' || run.status === 'QUEUED',
  ).length

  return {
    status,
    documents,
    documentsError,
    loading,
    error,
    crawling,
    latest,
    olderRuns,
    sortedRuns,
    inFlight,
    live: status?.configured !== false,
    load,
    crawlAll,
  }
}
