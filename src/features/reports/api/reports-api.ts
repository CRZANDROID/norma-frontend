import axios from 'axios'
import { api } from '@/shared/lib/axios'
import { useApiMock } from '@/shared/lib/utils'
import { reportsMockApi } from '@/features/reports/api/reports-mock'
import type {
  CreateReportBody,
  ListReportsParams,
  ReportDetail,
  ReportFindingItem,
  ReportListItem,
  ReportPerson,
  ReportStatus,
  ReportsListPage,
} from '@/features/reports/types/report'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function text(value: unknown): string | null {
  if (value == null || value === '') return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return null
}

function asStatus(value: unknown): ReportStatus {
  const raw = String(value ?? '').toLowerCase()
  if (raw === 'sent' || raw === 'discarded') return raw
  return 'draft'
}

function asInt(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value))
  }
  return fallback
}

function asPerson(value: unknown): ReportPerson | null {
  if (!isRecord(value)) return null
  const id = text(value.id)
  const name = text(value.name)
  if (!id || !name) return null
  return { id, name }
}

function normalizeItem(raw: unknown): ReportListItem | null {
  if (!isRecord(raw)) return null
  const id = text(raw.id)
  const clientRaw = isRecord(raw.client) ? raw.client : null
  const clientId = clientRaw ? text(clientRaw.id) : null
  const clientName = clientRaw ? text(clientRaw.name) : null
  if (!id || !clientRaw || !clientId || !clientName) return null
  const counts = isRecord(raw.counts) ? raw.counts : {}
  return {
    id,
    status: asStatus(raw.status),
    client: {
      id: clientId,
      name: clientName,
      slug: text(clientRaw.slug) ?? '',
      legalName: text(clientRaw.legalName),
    },
    dateFrom: text(raw.dateFrom),
    dateTo: text(raw.dateTo),
    findingCount: asInt(raw.findingCount),
    counts: {
      red: asInt(counts.red),
      orange: asInt(counts.orange),
      yellow: asInt(counts.yellow),
    },
    fileUrl: text(raw.fileUrl),
    generatedAt: text(raw.generatedAt) ?? '',
    generatedBy: asPerson(raw.generatedBy),
  }
}

function normalizeFinding(raw: unknown): ReportFindingItem | null {
  if (!isRecord(raw)) return null
  const id = text(raw.id)
  const title = text(raw.title)
  if (!id || !title) return null
  const sourceRaw = isRecord(raw.source) ? raw.source : null
  const documentRaw = isRecord(raw.document) ? raw.document : null
  return {
    id,
    title,
    impact: text(raw.impact) ?? '',
    suggestedAction: text(raw.suggestedAction),
    justification: text(raw.justification),
    source: sourceRaw
      ? {
          id: text(sourceRaw.id) ?? '',
          name: text(sourceRaw.name) ?? '',
          code: text(sourceRaw.code) ?? '',
          url: text(sourceRaw.url),
        }
      : null,
    document: documentRaw
      ? {
          id: text(documentRaw.id) ?? '',
          filename: text(documentRaw.filename) ?? '',
          url: text(documentRaw.url),
        }
      : null,
    createdAt: text(raw.createdAt),
  }
}

function unwrapDetail(data: unknown): ReportDetail {
  const item = normalizeItem(data)
  if (!item) throw new Error('Informe inválido')
  const findings = isRecord(data) && Array.isArray(data.findings) ? data.findings : []
  return {
    ...item,
    findings: findings
      .map(normalizeFinding)
      .filter((row): row is ReportFindingItem => !!row),
  }
}

function unwrapListPage(data: unknown): ReportsListPage {
  const items = isRecord(data) && Array.isArray(data.items) ? data.items : []
  return {
    page: Math.max(1, asInt(isRecord(data) ? data.page : 1, 1)),
    limit: Math.max(1, asInt(isRecord(data) ? data.limit : 50, 50)),
    total: asInt(isRecord(data) ? data.total : items.length, items.length),
    totalPages: Math.max(
      1,
      asInt(isRecord(data) ? data.totalPages : 1, 1),
    ),
    items: items
      .map(normalizeItem)
      .filter((row): row is ReportListItem => !!row),
  }
}

function filenameFromDisposition(header: string | undefined, fallback: string): string {
  if (!header) return fallback
  const match = /filename="([^"]+)"/i.exec(header)
  return match?.[1]?.trim() || fallback
}

async function hydrateBlobError(error: unknown): Promise<never> {
  if (axios.isAxiosError(error) && error.response && error.response.data instanceof Blob) {
    const response = error.response
    const body = await response.data.text()
    try {
      response.data = JSON.parse(body) as typeof response.data
    } catch {
      response.data = { message: body } as typeof response.data
    }
  }
  throw error
}

export const reportsApi = {
  create(body: CreateReportBody): Promise<ReportDetail> {
    if (useApiMock) return reportsMockApi.create(body)
    return api.post<unknown>('/reports', body).then((r) => unwrapDetail(r.data))
  },

  list(params?: ListReportsParams): Promise<ReportsListPage> {
    if (useApiMock) return reportsMockApi.list(params)
    return api
      .get<unknown>('/reports', {
        params: {
          ...(params?.clientId ? { clientId: params.clientId } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.page && params.page > 1 ? { page: params.page } : {}),
          limit: params?.limit ?? 50,
        },
      })
      .then((r) => unwrapListPage(r.data))
  },

  get(id: string): Promise<ReportDetail> {
    if (useApiMock) return reportsMockApi.get(id)
    return api.get<unknown>(`/reports/${id}`).then((r) => unwrapDetail(r.data))
  },

  regenerate(id: string): Promise<ReportDetail> {
    if (useApiMock) return reportsMockApi.regenerate(id)
    return api
      .post<unknown>(`/reports/${id}/regenerate`)
      .then((r) => unwrapDetail(r.data))
  },

  async file(
    id: string,
    options?: { download?: boolean },
  ): Promise<{ blob: Blob; filename: string }> {
    if (useApiMock) return reportsMockApi.file()
    try {
      const res = await api.get<Blob>(`/reports/${id}/file`, {
        params: options?.download ? { download: 1 } : undefined,
        responseType: 'blob',
      })
      return {
        blob: res.data,
        filename: filenameFromDisposition(
          res.headers['content-disposition'] as string | undefined,
          `NORMA-informe.pdf`,
        ),
      }
    } catch (error) {
      return hydrateBlobError(error)
    }
  },
}
