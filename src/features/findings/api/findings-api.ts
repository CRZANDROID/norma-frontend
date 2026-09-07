import { api } from '@/shared/lib/axios'
import { useApiMock } from '@/shared/lib/utils'
import { findingsMockApi } from '@/features/findings/api/findings-mock'
import type {
  FindingAiMeta,
  FindingDetail,
  FindingDocumentRef,
  FindingImpact,
  FindingImpactCounts,
  FindingListItem,
  FindingProgressSource,
  FindingRef,
  FindingStatus,
  FindingsListCounts,
  FindingsListPage,
  FindingsProgress,
  ListFindingsParams,
} from '@/features/findings/types/finding'
import { FINDING_IMPACTS } from '@/features/findings/types/finding'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function text(value: unknown): string | null {
  if (value == null || value === '') return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return null
}

function asImpact(value: unknown): FindingImpact | null {
  const raw = String(value ?? '').toUpperCase()
  return FINDING_IMPACTS.includes(raw as FindingImpact)
    ? (raw as FindingImpact)
    : null
}

function asStatus(value: unknown): FindingStatus {
  const raw = String(value ?? '').toUpperCase()
  if (
    raw === 'OPEN' ||
    raw === 'ACKNOWLEDGED' ||
    raw === 'RESOLVED' ||
    raw === 'DISMISSED'
  ) {
    return raw
  }
  return 'OPEN'
}

function asRef(value: unknown): FindingRef | null {
  if (!isRecord(value)) return null
  const id = text(value.id)
  const name = text(value.name)
  if (!id || !name) return null
  return {
    id,
    name,
    slug: text(value.slug) ?? undefined,
    code: text(value.code) ?? undefined,
  }
}

function asDocument(value: unknown): FindingDocumentRef | null {
  if (!isRecord(value)) return null
  const id = text(value.id)
  if (!id) return null
  return {
    id,
    filename: text(value.filename) ?? 'documento',
    processingStatus: text(value.processingStatus) ?? '',
    url: text(value.url),
  }
}

function asAiMeta(value: unknown): FindingAiMeta | null {
  if (!isRecord(value)) return null
  const relevantRaw = value.relevant
  return {
    model: text(value.model),
    promptVersion: text(value.promptVersion),
    relevant: typeof relevantRaw === 'boolean' ? relevantRaw : null,
  }
}

function normalizeListItem(raw: unknown): FindingListItem | null {
  if (!isRecord(raw)) return null
  const id = text(raw.id)
  const title = text(raw.title)
  const impact = asImpact(raw.impact)
  const client = asRef(raw.client)
  const document = asDocument(raw.document)
  if (!id || !title || !impact || !client || !document) return null
  return {
    id,
    title,
    impact,
    status: asStatus(raw.status),
    suggestedAction: text(raw.suggestedAction),
    justificationShort: text(raw.justificationShort) ?? '',
    client,
    source: asRef(raw.source),
    document,
    createdAt: text(raw.createdAt) ?? '',
    updatedAt: text(raw.updatedAt) ?? '',
  }
}

function normalizeDetail(raw: unknown): FindingDetail | null {
  const item = normalizeListItem(raw)
  if (!item || !isRecord(raw)) return null
  return {
    ...item,
    justification: text(raw.justification) ?? item.justificationShort,
    description: text(raw.description),
    aiMeta: asAiMeta(raw.aiMeta),
  }
}

function asCounts(value: unknown): FindingImpactCounts {
  const row = isRecord(value) ? value : {}
  const n = (key: string) => {
    const raw = row[key]
    return typeof raw === 'number' && Number.isFinite(raw)
      ? Math.max(0, Math.floor(raw))
      : 0
  }
  return {
    red: n('red'),
    orange: n('orange'),
    yellow: n('yellow'),
    green: n('green'),
  }
}

function unwrapSources(data: unknown): unknown[] {
  if (isRecord(data) && Array.isArray(data.sources)) return data.sources
  if (Array.isArray(data)) return data
  return []
}

function asInt(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value))
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return Math.max(0, Math.floor(parsed))
  }
  return fallback
}

function asDateField(value: unknown): string | null {
  const raw = text(value)
  if (!raw || raw === 'null') return null
  return raw
}

function asListCounts(value: unknown): FindingsListCounts {
  const colors = asCounts(value)
  const row = isRecord(value) ? value : {}
  return {
    ...colors,
    total: asInt(row.total, colors.red + colors.orange + colors.yellow + colors.green),
  }
}

function unwrapListPage(data: unknown): FindingsListPage {
  const itemsRaw = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.items)
      ? data.items
      : []
  const items = itemsRaw
    .map(normalizeListItem)
    .filter((row): row is FindingListItem => !!row)
  if (!isRecord(data) || Array.isArray(data)) {
    return {
      dateFrom: null,
      dateTo: null,
      page: 1,
      limit: items.length || 50,
      total: items.length,
      totalPages: 1,
      counts: asListCounts(null),
      items,
    }
  }
  const limit = Math.max(1, asInt(data.limit, 50))
  const total = asInt(data.total, items.length)
  return {
    dateFrom: asDateField(data.dateFrom),
    dateTo: asDateField(data.dateTo),
    page: Math.max(1, asInt(data.page, 1)),
    limit,
    total,
    totalPages: Math.max(1, asInt(data.totalPages, Math.ceil(total / limit) || 1)),
    counts: asListCounts(data.counts),
    items,
  }
}

function normalizeProgressSource(raw: unknown): FindingProgressSource | null {
  if (!isRecord(raw)) return null
  const sourceId = text(raw.sourceId)
  const sourceName = text(raw.sourceName)
  if (!sourceId || !sourceName) return null
  return {
    sourceId,
    sourceName,
    status: String(raw.status ?? '').trim() || 'unknown',
    label: text(raw.label) ?? String(raw.status ?? 'En curso'),
    note: text(raw.note),
    counts: asCounts(raw.counts),
  }
}

function normalizeFindingsProgress(raw: unknown): FindingsProgress {
  if (!isRecord(raw)) return { date: '', sources: [] }
  return {
    date: text(raw.date) ?? '',
    sources: unwrapSources(raw)
      .map(normalizeProgressSource)
      .filter((row): row is FindingProgressSource => !!row),
  }
}

/** Lista: `{ dateFrom, dateTo, page, limit, total, totalPages, counts, items }`. */
export const findingsApi = {
  progress(params?: { date?: string }): Promise<FindingsProgress> {
    const raw = useApiMock
      ? findingsMockApi.progress(params)
      : api
          .get<unknown>('/findings/progress', {
            params: params?.date ? { date: params.date } : undefined,
          })
          .then((r) => r.data)
    return Promise.resolve(raw).then(normalizeFindingsProgress)
  },

  list(params?: ListFindingsParams): Promise<FindingsListPage> {
    if (useApiMock) return findingsMockApi.list(params)
    return api
      .get<unknown>('/findings', {
        params: {
          ...(params?.clientId ? { clientId: params.clientId } : {}),
          ...(params?.sourceId ? { sourceId: params.sourceId } : {}),
          ...(params?.documentId ? { documentId: params.documentId } : {}),
          ...(params?.impact ? { impact: params.impact } : {}),
          ...(params?.dateFrom && !params?.documentId
            ? { dateFrom: params.dateFrom }
            : {}),
          ...(params?.dateTo && !params?.documentId
            ? { dateTo: params.dateTo }
            : {}),
          ...(params?.page && params.page > 1 ? { page: params.page } : {}),
          status: params?.status ?? 'OPEN',
          limit: params?.limit ?? 50,
        },
      })
      .then((r) => unwrapListPage(r.data))
  },

  get(id: string): Promise<FindingDetail> {
    if (useApiMock) return findingsMockApi.get(id)
    return api.get<unknown>(`/findings/${id}`).then((r) => {
      const detail = normalizeDetail(r.data)
      if (!detail) {
        throw new Error('Hallazgo inválido')
      }
      return detail
    })
  },
}
