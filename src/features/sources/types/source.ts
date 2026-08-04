export type EntityStatus = 'ACTIVE' | 'INACTIVE'

/** Enum Prisma `SourceCategory` — FRONTEND-SOURCES-V2 */
export type SourceCategory = 'OFFICIAL' | 'MEDIA' | 'SOCIAL'

export const SOURCE_CATEGORIES: SourceCategory[] = [
  'OFFICIAL',
  'MEDIA',
  'SOCIAL',
]

export const SOURCE_CATEGORY_LABELS: Record<SourceCategory, string> = {
  OFFICIAL: 'Oficial',
  MEDIA: 'Noticiero / medios',
  SOCIAL: 'Red social',
}

/** Enum Prisma `SourcePlatform` */
export type SourcePlatform =
  | 'WEB'
  | 'YOUTUBE'
  | 'X'
  | 'TIKTOK'
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'OTHER'

export const SOURCE_PLATFORMS: SourcePlatform[] = [
  'WEB',
  'YOUTUBE',
  'X',
  'TIKTOK',
  'FACEBOOK',
  'INSTAGRAM',
  'OTHER',
]

export const SOURCE_PLATFORM_LABELS: Record<SourcePlatform, string> = {
  WEB: 'Web',
  YOUTUBE: 'YouTube',
  X: 'X',
  TIKTOK: 'TikTok',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  OTHER: 'Otra',
}

/** Cliente embebido en respuestas de fuente (`clients`). */
export type SourceClientRef = {
  id: string
  name: string
  slug: string
  status: EntityStatus
}

/** Path de secciones, p.ej. `["Comunicados","Normatividad","Alertas sanitarias"]`. */
export type SourceSectionPath = string[]

export type Source = {
  id: string
  name: string
  code: string
  category: SourceCategory
  platform: SourcePlatform
  url: string | null
  frequency: string | null
  sections: SourceSectionPath[]
  keywordsGuide: string[]
  status: EntityStatus
  createdAt: string
  updatedAt: string
  clients?: SourceClientRef[]
}

export type CreateSourceInput = {
  name: string
  code: string
  category: SourceCategory
  platform: SourcePlatform
  url?: string
  frequency?: string
  sections?: SourceSectionPath[]
  keywordsGuide?: string[]
  /** Solo en create; PATCH no acepta clientIds. */
  clientIds?: string[]
}

export type UpdateSourceInput = {
  name?: string
  category?: SourceCategory
  platform?: SourcePlatform
  url?: string | null
  frequency?: string | null
  sections?: SourceSectionPath[]
  keywordsGuide?: string[]
}

export type ListSourcesParams = {
  status?: EntityStatus
  category?: SourceCategory
  platform?: SourcePlatform
  q?: string
  clientId?: string
}

export function formatSectionPath(path: SourceSectionPath): string {
  return path.join(' › ')
}

export function parseSectionPathInput(raw: string): SourceSectionPath | null {
  const parts = raw
    .split(/>|›|\//)
    .map((p) => p.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : null
}

export function sectionsEqual(
  a: SourceSectionPath[],
  b: SourceSectionPath[],
): boolean {
  if (a.length !== b.length) return false
  return a.every(
    (path, i) =>
      path.length === b[i].length && path.every((seg, j) => seg === b[i][j]),
  )
}
