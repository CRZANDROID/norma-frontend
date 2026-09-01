export type FindingImpact = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'

export type FindingStatus =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'RESOLVED'
  | 'DISMISSED'

export const FINDING_IMPACTS: FindingImpact[] = [
  'GREEN',
  'YELLOW',
  'ORANGE',
  'RED',
]

export const FINDING_IMPACT_LABELS: Record<FindingImpact, string> = {
  GREEN: 'Verde',
  YELLOW: 'Amarillo',
  ORANGE: 'Naranja',
  RED: 'Rojo',
}

export const FINDING_IMPACT_HINTS: Record<FindingImpact, string> = {
  GREEN: 'Contexto / poco impacto',
  YELLOW: 'Seguimiento',
  ORANGE: 'Nota y monitoreo',
  RED: 'Alerta',
}

export type FindingRef = {
  id: string
  name: string
  slug?: string
  code?: string
}

export type FindingDocumentRef = {
  id: string
  filename: string
  processingStatus: string
  /** Página o PDF de donde salió el texto. No es la portada de la fuente. */
  url: string | null
}

export type FindingListItem = {
  id: string
  title: string
  impact: FindingImpact
  status: FindingStatus
  suggestedAction: string | null
  justificationShort: string
  client: FindingRef
  source: FindingRef | null
  document: FindingDocumentRef
  createdAt: string
  updatedAt: string
}

export type FindingAiMeta = {
  model: string | null
  promptVersion: string | null
  relevant: boolean | null
}

export type FindingDetail = FindingListItem & {
  justification: string
  description: string | null
  aiMeta: FindingAiMeta | null
}

export type ListFindingsParams = {
  clientId?: string
  sourceId?: string
  documentId?: string
  impact?: FindingImpact
  status?: FindingStatus
  limit?: number
}
