export const PILOT_SOURCE_CODES = [
  'dof',
  'diputados-gaceta',
  'jalisco-congreso',
  'congreso-agu',
  'congreso-bcn',
  'congreso-bcs',
  'congreso-cam',
  'congreso-chh',
] as const

export type PilotSourceCode = (typeof PILOT_SOURCE_CODES)[number]

export type DocumentProcessingStatus =
  | 'RECEIVED'
  | 'EXTRACTED'
  | 'NORMALIZED'
  | 'HASHED'
  | 'DEDUPED'
  | 'READY_FOR_AI'
  | 'CLASSIFIED'
  | 'FAILED'
  | 'DISCARDED'

export const DOCUMENT_STATUS_LABELS: Record<DocumentProcessingStatus, string> = {
  RECEIVED: 'Recibido',
  EXTRACTED: 'Extraído',
  NORMALIZED: 'Normalizado',
  HASHED: 'Con huella',
  DEDUPED: 'Duplicado',
  READY_FOR_AI: 'Registrado',
  CLASSIFIED: 'Clasificada',
  FAILED: 'Falló',
  DISCARDED: 'Descartado',
}

export type DocumentListItem = {
  id: string
  sourceId: string | null
  sourceCode: string | null
  sourceName: string | null
  filename: string
  mimeType: string | null
  processingStatus: DocumentProcessingStatus
  contentHash: string | null
  canonicalDocumentId: string | null
  lastError: string | null
  jobRunId: string | null
  textPreview: string | null
  url: string | null
  createdAt: string
  updatedAt: string
}

export type DocumentDetail = DocumentListItem & {
  extractedText: string | null
}

export type ListDocumentsParams = {
  sourceId?: string
  sourceCode?: string
  processingStatus?: DocumentProcessingStatus
  pilotOnly?: boolean
  limit?: number
  date?: string
}

export type DocumentProgressSource = {
  sourceId: string
  sourceName: string
  status: string
  label: string
  headline: string | null
  note: string | null
}

export type DocumentsProgress = {
  date: string
  sources: DocumentProgressSource[]
}
