import { api } from '@/shared/lib/axios'
import { useApiMock } from '@/shared/lib/utils'
import { jobsMockApi } from '@/features/jobs/api/jobs-mock'
import type {
  CrawlEnqueueResult,
  CrawlInput,
  JobRun,
  JobRunStatus,
  JobsStatus,
  ListJobRunsParams,
} from '@/features/jobs/types/job'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

const RUN_STATUSES: JobRunStatus[] = [
  'QUEUED',
  'RUNNING',
  'SUCCESS',
  'FAILED',
  'SKIPPED',
]

function normalizeRun(raw: unknown): JobRun | null {
  if (!isRecord(raw)) return null
  const status = String(raw.status ?? '') as JobRunStatus
  if (!RUN_STATUSES.includes(status)) return null
  const id = String(raw.id ?? raw.jobRunId ?? '')
  if (!id) return null
  return {
    id,
    jobRunId: typeof raw.jobRunId === 'string' ? raw.jobRunId : id,
    sourceId: typeof raw.sourceId === 'string' ? raw.sourceId : null,
    sourceCode: String(raw.sourceCode ?? ''),
    status,
    message: typeof raw.message === 'string' ? raw.message : null,
    createdAt: String(raw.createdAt ?? ''),
    startedAt: typeof raw.startedAt === 'string' ? raw.startedAt : null,
    finishedAt: typeof raw.finishedAt === 'string' ? raw.finishedAt : null,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
  }
}

function unwrapRuns(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (isRecord(data)) {
    if (Array.isArray(data.items)) return data.items
    if (Array.isArray(data.runs)) return data.runs
    if (Array.isArray(data.data)) return data.data
  }
  return data ? [data] : []
}

/** Jobs / crawl contra Nest (`docs/jobs-crawl.md`). */
export const jobsApi = {
  status(): Promise<JobsStatus> {
    if (useApiMock) return jobsMockApi.status()
    return api.get<JobsStatus>('/jobs/status').then((r) => r.data)
  },

  listRuns(params?: ListJobRunsParams): Promise<JobRun[]> {
    if (useApiMock) return jobsMockApi.listRuns(params)
    return api
      .get<unknown>('/jobs/runs', { params })
      .then((r) => unwrapRuns(r.data).map(normalizeRun).filter((row): row is JobRun => !!row))
  },

  crawl(input: CrawlInput): Promise<CrawlEnqueueResult> {
    if (useApiMock) return jobsMockApi.crawl(input)
    return api.post<CrawlEnqueueResult>('/jobs/crawl', input).then((r) => r.data)
  },

  crawlAll(): Promise<unknown> {
    if (useApiMock) return jobsMockApi.crawlAll()
    return api.post('/jobs/crawl/all').then((r) => r.data)
  },
}
