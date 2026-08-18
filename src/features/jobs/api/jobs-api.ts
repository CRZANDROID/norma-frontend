import { api } from '@/shared/lib/axios'
import { useApiMock } from '@/shared/lib/utils'
import { jobsMockApi } from '@/features/jobs/api/jobs-mock'
import type {
  CrawlEnqueueResult,
  CrawlInput,
  JobConnector,
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
    sourceCode: displayText(raw.sourceCode) ?? '',
    status,
    message: displayText(raw.message) ?? null,
    createdAt: String(raw.createdAt ?? ''),
    startedAt: typeof raw.startedAt === 'string' ? raw.startedAt : null,
    finishedAt: typeof raw.finishedAt === 'string' ? raw.finishedAt : null,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
  }
}

function displayText(value: unknown): string | undefined {
  if (value == null || value === '') return undefined
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (isRecord(value)) {
    const label = value.label ?? value.code ?? value.name ?? value.status
    if (typeof label === 'string' || typeof label === 'number') return String(label)
  }
  return undefined
}

function normalizeConnector(raw: unknown): JobConnector | null {
  if (typeof raw === 'string' && raw.trim()) {
    return { code: raw, label: raw }
  }
  if (!isRecord(raw)) return null
  const code = displayText(raw.code) ?? displayText(raw.id) ?? ''
  const label = displayText(raw.label) ?? displayText(raw.name) ?? code
  if (!code && !label) return null
  return { code: code || label, label: label || code }
}

function normalizeStatus(raw: unknown): JobsStatus {
  if (!isRecord(raw)) return { configured: false, connectors: [] }
  const connectors = Array.isArray(raw.connectors)
    ? raw.connectors
        .map(normalizeConnector)
        .filter((row): row is JobConnector => !!row)
    : []
  return {
    configured: raw.configured !== false,
    redis: displayText(raw.redis),
    worker: displayText(raw.worker),
    scheduler: displayText(raw.scheduler),
    storage: displayText(raw.storage),
    connectors,
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
    const raw = useApiMock
      ? jobsMockApi.status()
      : api.get<unknown>('/jobs/status').then((r) => r.data)
    return Promise.resolve(raw).then(normalizeStatus)
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
