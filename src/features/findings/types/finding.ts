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
  GREEN: 'Informativo',
  YELLOW: 'Medio',
  ORANGE: 'Alto',
  RED: 'Crítico',
}

/** Orden del semáforo en filtros (más grave primero). */
export const FINDING_IMPACT_FILTER_ORDER: FindingImpact[] = [
  'RED',
  'ORANGE',
  'YELLOW',
  'GREEN',
]

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
  excludedFromNextReport: boolean
  justificationShort: string
  client: FindingRef
  source: FindingRef | null
  document: FindingDocumentRef
  createdAt: string
  updatedAt: string
}

export type FindingAiRewrite = {
  at: string
  model: string | null
  promptVersion: string | null
  prompt: string | null
  note: string | null
  changed: boolean | null
}

export type FindingAiMeta = {
  model: string | null
  promptVersion: string | null
  relevant: boolean | null
  lastRewrite: FindingAiRewrite | null
}

export type FindingDetail = FindingListItem & {
  justification: string
  description: string | null
  aiMeta: FindingAiMeta | null
}

export type PatchFindingBody = {
  title?: string
  justification?: string
  impact?: FindingImpact
}

/** `POST /findings/:id/rewrite`. `rewriteNote` / `rewriteChanged` no viven en GET. */
export type FindingRewriteResult = FindingDetail & {
  rewriteNote: string | null
  rewriteChanged: boolean
}

export type ListFindingsParams = {
  clientId?: string
  sourceId?: string
  documentId?: string
  impact?: FindingImpact
  status?: FindingStatus
  /** Recorta items/total. No recorta counts. */
  excluded?: boolean
  limit?: number
  page?: number
  /** Inicio de rango YYYY-MM-DD. Omitir = sin piso. */
  dateFrom?: string
  /** Fin de rango YYYY-MM-DD (inclusive). Omitir = sin techo. */
  dateTo?: string
}

export type FindingsListCounts = {
  total: number
  red: number
  orange: number
  yellow: number
  green: number
}

export type FindingsListPage = {
  dateFrom: string | null
  dateTo: string | null
  page: number
  limit: number
  total: number
  totalPages: number
  counts: FindingsListCounts
  items: FindingListItem[]
}

export type FindingImpactCounts = {
  red: number
  orange: number
  yellow: number
  green: number
}

export type FindingProgressSource = {
  sourceId: string
  sourceName: string
  status: string
  label: string
  note: string | null
  counts: FindingImpactCounts
}

export type FindingsProgress = {
  date: string
  sources: FindingProgressSource[]
}
