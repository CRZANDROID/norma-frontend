export type EntityStatus = 'ACTIVE' | 'INACTIVE'

/** Enum Prisma `SourceType` — SPRINT-3-BACKEND §7.4 */
export type SourceType =
  | 'CONGRESS_STATE'
  | 'CONGRESS_FEDERAL'
  | 'DOF'
  | 'AUTHORITY'
  | 'MEDIA'
  | 'TRANSCRIPT'
  | 'MANUAL'
  | 'API'
  | 'FEED'
  | 'WEBHOOK'

export const SOURCE_TYPES: SourceType[] = [
  'CONGRESS_STATE',
  'CONGRESS_FEDERAL',
  'DOF',
  'AUTHORITY',
  'MEDIA',
  'TRANSCRIPT',
  'MANUAL',
  'API',
  'FEED',
  'WEBHOOK',
]

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  CONGRESS_STATE: 'Congreso estatal',
  CONGRESS_FEDERAL: 'Congreso federal',
  DOF: 'DOF',
  AUTHORITY: 'Autoridad',
  MEDIA: 'Medios',
  TRANSCRIPT: 'Transcripción',
  MANUAL: 'Manual',
  API: 'API',
  FEED: 'Feed',
  WEBHOOK: 'Webhook',
}

/** Cliente embebido en respuestas de fuente (`clients`). */
export type SourceClientRef = {
  id: string
  name: string
  slug: string
  status: EntityStatus
}

export type Source = {
  id: string
  name: string
  code: string
  type: SourceType
  url: string | null
  section: string | null
  jurisdiction: string | null
  frequency: string | null
  keywordsGuide: string[]
  config: Record<string, unknown> | null
  status: EntityStatus
  createdAt: string
  updatedAt: string
  clients?: SourceClientRef[]
}

export type CreateSourceInput = {
  name: string
  code: string
  type: SourceType
  url?: string
  section?: string
  jurisdiction?: string
  frequency?: string
  keywordsGuide?: string[]
  config?: Record<string, unknown> | null
  /** Solo en create; PATCH no acepta clientIds. */
  clientIds?: string[]
}

export type UpdateSourceInput = {
  name?: string
  type?: SourceType
  url?: string | null
  section?: string | null
  jurisdiction?: string | null
  frequency?: string | null
  keywordsGuide?: string[]
  config?: Record<string, unknown> | null
}

export type ListSourcesParams = {
  status?: EntityStatus
  type?: SourceType
  jurisdiction?: string
  q?: string
  clientId?: string
}
