import type {
  CrawlEnqueueResult,
  CrawlInput,
  JobRun,
  ListJobRunsParams,
} from '@/features/jobs/types/job'

const now = () => new Date().toISOString()

function delay(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let runs: JobRun[] = [
  {
    id: 'run_dof_ok',
    sourceCode: 'dof',
    sourceId: 'source_dof',
    status: 'SUCCESS',
    message: 'HTML crudo guardado (mock).',
    createdAt: '2026-08-18T12:01:00.000Z',
    startedAt: '2026-08-18T12:01:02.000Z',
    finishedAt: '2026-08-18T12:01:08.000Z',
  },
]

const crawledToday = new Set<string>()

function runId() {
  return `run_${Math.random().toString(36).slice(2, 10)}`
}

function enqueue(sourceCode: string, sourceId?: string): CrawlEnqueueResult {
  const key = sourceCode
  if (crawledToday.has(key)) {
    return {
      enqueued: false,
      skipped: true,
      reason: 'already-completed',
      sourceCode,
      sourceId,
    }
  }
  crawledToday.add(key)
  const stamp = now()
  const id = runId()
  const run: JobRun = {
    id,
    jobRunId: id,
    sourceCode,
    sourceId: sourceId ?? null,
    status: 'QUEUED',
    message: 'Encolado (mock).',
    createdAt: stamp,
  }
  runs = [run, ...runs]
  return {
    enqueued: true,
    skipped: false,
    idempotencyKey: `${sourceCode}:mock:admin`,
    jobRunId: id,
    sourceId,
    sourceCode,
  }
}

export const jobsMockApi = {
  async status() {
    await delay()
    return {
      configured: true,
      redis: 'up',
      worker: 'up',
      scheduler: 'up',
      storage: 'local',
      connectors: ['dof', 'diputados-gaceta', 'jalisco-congreso'],
    }
  },

  async listRuns(params?: ListJobRunsParams): Promise<JobRun[]> {
    await delay()
    let rows = [...runs]
    if (params?.sourceCode) {
      rows = rows.filter((r) => r.sourceCode === params.sourceCode)
    }
    if (params?.sourceId) {
      rows = rows.filter((r) => r.sourceId === params.sourceId)
    }
    const limit = params?.limit ?? 20
    return rows.slice(0, limit)
  },

  async crawl(input: CrawlInput): Promise<CrawlEnqueueResult> {
    await delay()
    const sourceCode = input.sourceCode ?? input.sourceId
    return enqueue(sourceCode, 'sourceId' in input ? input.sourceId : undefined)
  },

  async crawlAll(): Promise<{ enqueued: number }> {
    await delay()
    const codes = ['dof', 'diputados-gaceta', 'jalisco-congreso']
    let enqueued = 0
    for (const code of codes) {
      if (!enqueue(code).skipped) enqueued += 1
    }
    return { enqueued }
  },
}
