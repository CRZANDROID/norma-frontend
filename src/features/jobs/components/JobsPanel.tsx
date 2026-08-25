import { DocumentsRegistry } from '@/features/documents'
import { JobsRunsPanel } from '@/features/jobs/components/JobsRunsPanel'
import { JobsStatusStrip } from '@/features/jobs/components/JobsStatusStrip'
import { useJobsDashboard } from '@/features/jobs/hooks/useJobsDashboard'

/** Composición apilada (por si se reusa fuera del dashboard). */
export function JobsPanel({
  canCrawl,
  canReadRuns,
}: {
  canCrawl: boolean
  canReadRuns: boolean
}) {
  const jobs = useJobsDashboard(canReadRuns)

  return (
    <div className="flex flex-col gap-4">
      <JobsStatusStrip
        status={jobs.status}
        inFlight={jobs.inFlight}
        live={jobs.live}
        loading={jobs.loading}
        error={jobs.error}
        crawling={jobs.crawling}
        canCrawl={canCrawl}
        onRetry={() => void jobs.load()}
        onCrawl={() => void jobs.crawlAll()}
      />
      <JobsRunsPanel
        latest={jobs.latest}
        olderRuns={jobs.olderRuns}
        sortedCount={jobs.sortedRuns.length}
        loading={jobs.loading}
        canReadRuns={canReadRuns}
      />
      {canReadRuns ? (
        <DocumentsRegistry
          documents={jobs.documents}
          error={jobs.documentsError}
        />
      ) : null}
    </div>
  )
}
