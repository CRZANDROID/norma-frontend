import type { DocumentListItem, ListDocumentsParams } from '@/features/documents/types/document'

function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const now = new Date().toISOString()

const rows: DocumentListItem[] = [
  {
    id: 'doc_dof_ready',
    sourceId: 'source_dof',
    sourceCode: 'dof',
    sourceName: 'Diario Oficial de la Federación',
    filename: 'page.html',
    mimeType: 'text/html',
    processingStatus: 'READY_FOR_AI',
    contentHash: 'a'.repeat(64),
    canonicalDocumentId: null,
    lastError: null,
    jobRunId: 'run_dof_ok',
    textPreview:
      'Decreto por el que se reforman disposiciones en materia de comercio exterior (mock).',
    createdAt: '2026-08-18T12:01:10.000Z',
    updatedAt: now,
  },
  {
    id: 'doc_diputados_dup',
    sourceId: 'source_diputados',
    sourceCode: 'diputados-gaceta',
    sourceName: 'Gaceta Diputados',
    filename: 'page.html',
    mimeType: 'text/html',
    processingStatus: 'DEDUPED',
    contentHash: 'a'.repeat(64),
    canonicalDocumentId: 'doc_dof_ready',
    lastError: null,
    jobRunId: 'run_diputados_ok',
    textPreview: 'Misma ficha que un registro anterior (mock).',
    createdAt: '2026-08-18T12:02:10.000Z',
    updatedAt: now,
  },
  {
    id: 'doc_jalisco_extracted',
    sourceId: 'source_jalisco',
    sourceCode: 'jalisco-congreso',
    sourceName: 'Congreso de Jalisco',
    filename: 'page.html',
    mimeType: 'text/html',
    processingStatus: 'EXTRACTED',
    contentHash: null,
    canonicalDocumentId: null,
    lastError: null,
    jobRunId: 'run_jalisco_ok',
    textPreview: 'Gaceta del Congreso de Jalisco con iniciativas del día (mock).',
    createdAt: '2026-08-18T12:03:10.000Z',
    updatedAt: now,
  },
]

export const documentsMockApi = {
  async list(params?: ListDocumentsParams): Promise<DocumentListItem[]> {
    await delay()
    let next = [...rows]
    if (params?.sourceCode) {
      next = next.filter((row) => row.sourceCode === params.sourceCode)
    }
    if (params?.processingStatus) {
      next = next.filter((row) => row.processingStatus === params.processingStatus)
    }
    const limit = params?.limit ?? 20
    return next.slice(0, limit)
  },
}
