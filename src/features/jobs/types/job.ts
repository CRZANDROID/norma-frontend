export type JobRunStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'SKIPPED'

export const JOB_RUN_STATUS_LABELS: Record<JobRunStatus, string> = {
  QUEUED: 'En cola',
  RUNNING: 'En curso',
  SUCCESS: 'Completado',
  FAILED: 'Falló',
  SKIPPED: 'Omitido',
}

export type JobsStatus = {
  configured: boolean
  redis?: string
  worker?: string | boolean
  scheduler?: string | boolean
  storage?: string
  connectors?: string[]
}

export type JobRun = {
  id: string
  jobRunId?: string
  sourceId?: string | null
  sourceCode: string
  status: JobRunStatus
  message: string | null
  createdAt: string
  startedAt?: string | null
  finishedAt?: string | null
  updatedAt?: string
}

export type CrawlEnqueueResult = {
  enqueued: boolean
  skipped: boolean
  reason?: string
  idempotencyKey?: string
  jobRunId?: string
  sourceId?: string
  sourceCode?: string
}

export type ListJobRunsParams = {
  sourceCode?: string
  sourceId?: string
  limit?: number
}

export type CrawlInput =
  | { sourceId: string; sourceCode?: never }
  | { sourceCode: string; sourceId?: never }
