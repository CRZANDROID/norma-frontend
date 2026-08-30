import type {
  DocumentListItem,
  DocumentProgressSource,
  DocumentsProgress,
} from '@/features/documents'
import type { JobProgressSource, JobsProgress } from '@/features/jobs'

export type AgentSourceJourney = {
  sourceId: string
  sourceName: string
  crawl: JobProgressSource | null
  extract: DocumentProgressSource | null
}

export type StepTone = 'done' | 'live' | 'warn' | 'fail' | 'wait'

const LIVE = new Set([
  'running',
  'crawling',
  'queued',
  'extracting',
  'processing',
  'in_progress',
])
const DONE_CRAWL = new Set([
  'crawled',
  'success',
  'done',
  'ok',
  'complete',
  'completed',
])
const DONE_EXTRACT = new Set(['ready', 'extracted', 'ok', 'done'])
const WARN_EXTRACT = new Set(['unread', 'empty', 'skipped', 'thin'])
const FAIL = new Set(['failed', 'error', 'fail'])

export function stepTone(
  kind: 'crawl' | 'extract',
  status: string | undefined,
): StepTone {
  if (!status) return 'wait'
  const value = status.toLowerCase()
  if (FAIL.has(value)) return 'fail'
  if (LIVE.has(value)) return 'live'
  if (kind === 'crawl' && DONE_CRAWL.has(value)) return 'done'
  if (kind === 'extract' && DONE_EXTRACT.has(value)) return 'done'
  if (kind === 'extract' && WARN_EXTRACT.has(value)) return 'warn'
  return 'wait'
}

export function mergeJourneys(
  crawl: JobsProgress | null,
  extract: DocumentsProgress | null,
): AgentSourceJourney[] {
  const byId = new Map<string, AgentSourceJourney>()

  for (const source of crawl?.sources ?? []) {
    byId.set(source.sourceId, {
      sourceId: source.sourceId,
      sourceName: source.sourceName,
      crawl: source,
      extract: null,
    })
  }

  for (const source of extract?.sources ?? []) {
    const existing = byId.get(source.sourceId)
    if (existing) {
      existing.extract = source
    } else {
      byId.set(source.sourceId, {
        sourceId: source.sourceId,
        sourceName: source.sourceName,
        crawl: null,
        extract: source,
      })
    }
  }

  const seen = new Set<string>()
  const ordered: AgentSourceJourney[] = []
  for (const id of [
    ...(crawl?.sources ?? []).map((row) => row.sourceId),
    ...(extract?.sources ?? []).map((row) => row.sourceId),
  ]) {
    if (seen.has(id)) continue
    seen.add(id)
    const row = byId.get(id)
    if (row) ordered.push(row)
  }
  return ordered
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
