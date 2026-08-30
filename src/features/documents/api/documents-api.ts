import { api } from '@/shared/lib/axios'
import { useApiMock } from '@/shared/lib/utils'
import { documentsMockApi } from '@/features/documents/api/documents-mock'
import type {
  DocumentDetail,
  DocumentListItem,
  DocumentProcessingStatus,
  DocumentProgressSource,
  DocumentsProgress,
  ListDocumentsParams,
} from '@/features/documents/types/document'

const STATUSES: DocumentProcessingStatus[] = [
  'RECEIVED',
  'EXTRACTED',
  'NORMALIZED',
  'HASHED',
  'DEDUPED',
  'READY_FOR_AI',
  'FAILED',
  'DISCARDED',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (isRecord(data)) {
    if (Array.isArray(data.items)) return data.items
    if (Array.isArray(data.documents)) return data.documents
    if (Array.isArray(data.data)) return data.data
  }
  return data ? [data] : []
}

function displayText(value: unknown): string | null {
  if (value == null || value === '') return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return null
}

function normalizeDocument(raw: unknown): DocumentListItem | null {
  if (!isRecord(raw)) return null
  const id = displayText(raw.id)
  const status = String(raw.processingStatus ?? '') as DocumentProcessingStatus
  if (!id || !STATUSES.includes(status)) return null
  return {
    id,
    sourceId: displayText(raw.sourceId),
    sourceCode: displayText(raw.sourceCode),
    sourceName: displayText(raw.sourceName),
    filename: displayText(raw.filename) ?? 'page.html',
    mimeType: displayText(raw.mimeType),
    processingStatus: status,
    contentHash: displayText(raw.contentHash),
    canonicalDocumentId: displayText(raw.canonicalDocumentId),
    lastError: displayText(raw.lastError),
    jobRunId: displayText(raw.jobRunId),
    textPreview: displayText(raw.textPreview),
    url: displayText(raw.url) ?? displayText(raw.finalUrl),
    createdAt: displayText(raw.createdAt) ?? '',
    updatedAt: displayText(raw.updatedAt) ?? '',
  }
}

function unwrapSources(data: unknown): unknown[] {
  if (isRecord(data) && Array.isArray(data.sources)) return data.sources
  if (Array.isArray(data)) return data
  return []
}

function normalizeProgressSource(raw: unknown): DocumentProgressSource | null {
  if (!isRecord(raw)) return null
  const sourceId = displayText(raw.sourceId)
  const sourceName = displayText(raw.sourceName)
  if (!sourceId || !sourceName) return null
  return {
    sourceId,
    sourceName,
    status: String(raw.status ?? '').trim() || 'unknown',
    label: displayText(raw.label) ?? String(raw.status ?? 'En curso'),
    headline: displayText(raw.headline),
    note: displayText(raw.note),
  }
}

function normalizeDocumentsProgress(raw: unknown): DocumentsProgress {
  if (!isRecord(raw)) return { date: '', sources: [] }
  return {
    date: displayText(raw.date) ?? '',
    sources: unwrapSources(raw)
      .map(normalizeProgressSource)
      .filter((row): row is DocumentProgressSource => !!row),
  }
}

/** Registro documental S6 (`GET /documents`). No pinta HTML crudo. */
export const documentsApi = {
  list(params?: ListDocumentsParams): Promise<DocumentListItem[]> {
    if (useApiMock) return documentsMockApi.list(params)
    return api
      .get<unknown>('/documents', { params })
      .then((r) =>
        unwrapList(r.data)
          .map(normalizeDocument)
          .filter((row): row is DocumentListItem => !!row),
      )
  },

  progress(): Promise<DocumentsProgress> {
    const raw = useApiMock
      ? documentsMockApi.progress()
      : api.get<unknown>('/documents/progress').then((r) => r.data)
    return Promise.resolve(raw).then(normalizeDocumentsProgress)
  },

  get(id: string): Promise<DocumentDetail> {
    if (useApiMock) return documentsMockApi.get(id)
    return api.get<unknown>(`/documents/${id}`).then((r) => {
      const item = normalizeDocument(r.data)
      if (!item) {
        throw new Error('Documento inválido')
      }
      const extracted = isRecord(r.data)
        ? displayText(r.data.extractedText)
        : null
      return { ...item, extractedText: extracted }
    })
  },
}
