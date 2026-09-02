import type {
  DocumentListItem,
  DocumentProgressSource,
  DocumentsProgress,
} from '@/features/documents'
import type {
  FindingImpactCounts,
  FindingProgressSource,
  FindingsProgress,
} from '@/features/findings'
import type { JobProgressSource, JobsProgress } from '@/features/jobs'

export type AgentSourceJourney = {
  sourceId: string
  sourceName: string
  crawl: JobProgressSource | null
  extract: DocumentProgressSource | null
  analysis: FindingProgressSource | null
}

export type StepTone = 'done' | 'live' | 'warn' | 'fail' | 'wait'

const LIVE = new Set([
  'running',
  'crawling',
  'queued',
  'extracting',
  'processing',
  'in_progress',
  'classifying',
])
const DONE_CRAWL = new Set([
  'crawled',
  'success',
  'done',
  'ok',
  'complete',
  'completed',
])
const DONE_EXTRACT = new Set([
  'ready',
  'extracted',
  'classified',
  'unchanged',
  'ok',
  'done',
])
const WARN_EXTRACT = new Set(['unread', 'empty', 'skipped', 'thin'])
const DONE_ANALYSIS = new Set(['classified'])
const WARN_ANALYSIS = new Set(['skipped'])
const FAIL = new Set(['failed', 'error', 'fail'])
const CRAWL_TERMINAL = new Set([
  'crawled',
  'failed',
  'skipped',
  'success',
  'done',
  'ok',
  'complete',
  'completed',
])

export function stepTone(
  kind: 'crawl' | 'extract' | 'analysis',
  status: string | undefined,
): StepTone {
  if (!status) return 'wait'
  const value = status.toLowerCase()
  if (FAIL.has(value)) return 'fail'
  if (LIVE.has(value)) return 'live'
  if (kind === 'crawl' && DONE_CRAWL.has(value)) return 'done'
  if (kind === 'extract' && DONE_EXTRACT.has(value)) return 'done'
  if (kind === 'extract' && WARN_EXTRACT.has(value)) return 'warn'
  if (kind === 'analysis' && DONE_ANALYSIS.has(value)) return 'done'
  if (kind === 'analysis' && WARN_ANALYSIS.has(value)) return 'warn'
  return 'wait'
}

/** Crawl de una fuente acaba de cerrar: hay que pedir extract/análisis ya, no en el próximo ciclo. */
export function crawlBecameTerminal(
  prev: JobsProgress | null,
  next: JobsProgress | null,
): boolean {
  if (!prev || !next) return false
  const before = new Map(
    prev.sources.map((row) => [row.sourceId, row.status.toLowerCase()]),
  )
  return next.sources.some((row) => {
    const prior = before.get(row.sourceId)
    if (!prior || CRAWL_TERMINAL.has(prior)) return false
    return CRAWL_TERMINAL.has(row.status.toLowerCase())
  })
}

function emptyJourney(
  sourceId: string,
  sourceName: string,
): AgentSourceJourney {
  return {
    sourceId,
    sourceName,
    crawl: null,
    extract: null,
    analysis: null,
  }
}

export function mergeJourneys(
  crawl: JobsProgress | null,
  extract: DocumentsProgress | null,
  analysis: FindingsProgress | null,
): AgentSourceJourney[] {
  const byId = new Map<string, AgentSourceJourney>()

  for (const source of crawl?.sources ?? []) {
    byId.set(source.sourceId, {
      ...emptyJourney(source.sourceId, source.sourceName),
      crawl: source,
    })
  }

  for (const source of extract?.sources ?? []) {
    const existing = byId.get(source.sourceId)
    if (existing) {
      existing.extract = source
    } else {
      byId.set(source.sourceId, {
        ...emptyJourney(source.sourceId, source.sourceName),
        extract: source,
      })
    }
  }

  for (const source of analysis?.sources ?? []) {
    const existing = byId.get(source.sourceId)
    if (existing) {
      existing.analysis = source
    } else {
      byId.set(source.sourceId, {
        ...emptyJourney(source.sourceId, source.sourceName),
        analysis: source,
      })
    }
  }

  const seen = new Set<string>()
  const ordered: AgentSourceJourney[] = []
  for (const id of [
    ...(crawl?.sources ?? []).map((row) => row.sourceId),
    ...(extract?.sources ?? []).map((row) => row.sourceId),
    ...(analysis?.sources ?? []).map((row) => row.sourceId),
  ]) {
    if (seen.has(id)) continue
    seen.add(id)
    const row = byId.get(id)
    if (row) ordered.push(row)
  }
  return ordered
}

export function hasImpactCounts(
  counts: FindingImpactCounts | null | undefined,
): boolean {
  if (!counts) return false
  return counts.red + counts.orange + counts.yellow + counts.green > 0
}

export function groupPagesBySource(
  documents: DocumentListItem[],
): Map<string, DocumentListItem[]> {
  const grouped = new Map<string, DocumentListItem[]>()
  for (const doc of documents) {
    const key = doc.sourceId || doc.sourceCode || 'unknown'
    const bucket = grouped.get(key)
    if (bucket) {
      bucket.push(doc)
    } else {
      grouped.set(key, [doc])
    }
  }
  return grouped
}

export function isPdfPage(doc: DocumentListItem): boolean {
  const name = (doc.filename || '').toLowerCase()
  const mime = (doc.mimeType || '').toLowerCase()
  const url = (doc.url || '').toLowerCase()
  return (
    name.endsWith('.pdf') ||
    mime.includes('pdf') ||
    /\.pdf(?:$|\?)/i.test(url)
  )
}

export function isWordPage(doc: DocumentListItem): boolean {
  if (isPdfPage(doc)) return false
  const name = (doc.filename || '').toLowerCase()
  const mime = (doc.mimeType || '').toLowerCase()
  const url = (doc.url || '').toLowerCase()
  return (
    name.endsWith('.docx') ||
    name.endsWith('.doc') ||
    mime.includes('msword') ||
    mime.includes('wordprocessingml') ||
    mime.includes('officedocument.word') ||
    /nota_to_doc\.php/i.test(url) ||
    /\.docx?(?:$|\?)/i.test(url)
  )
}

export function splitPagesByKind(pages: DocumentListItem[]): {
  pdf: DocumentListItem[]
  word: DocumentListItem[]
  html: DocumentListItem[]
  other: DocumentListItem[]
} {
  const pdf: DocumentListItem[] = []
  const word: DocumentListItem[] = []
  const html: DocumentListItem[] = []
  const other: DocumentListItem[] = []
  for (const doc of pages) {
    if (doc.processingStatus === 'DISCARDED') {
      continue
    }
    if (isPdfPage(doc)) {
      pdf.push(doc)
      continue
    }
    if (isWordPage(doc)) {
      word.push(doc)
      continue
    }
    const name = (doc.filename || '').toLowerCase()
    const mime = (doc.mimeType || '').toLowerCase()
    if (
      name.endsWith('.json') ||
      mime.includes('json') ||
      mime.includes('xml') ||
      name.endsWith('.xml')
    ) {
      other.push(doc)
      continue
    }
    html.push(doc)
  }
  return { pdf, word, html, other }
}

export function pagePathLabel(url: string | null, filename: string): string {
  if (!url) return filename
  try {
    const parsed = new URL(url)
    const path = `${parsed.pathname}${parsed.search}`
    if (path === '/' || path === '') return parsed.hostname.replace(/^www\./, '')
    const clipped = path.length > 110 ? `${path.slice(0, 109)}…` : path
    return clipped
  } catch {
    return filename
  }
}

export function decodeHtml(value: string): string {
  if (typeof document === 'undefined') return value
  const node = document.createElement('textarea')
  node.innerHTML = value
  return node.value
}

export function clipHeadline(value: string, max = 110): string {
  const text = decodeHtml(value).replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

export function formatClock(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDay(date: string): string | null {
  if (!date) return null
  const parts = date.split('-').map(Number)
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return date
  const [year, month, day] = parts
  return new Date(year, month - 1, day).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
