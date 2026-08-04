import { api } from '@/shared/lib/axios'
import { useApiMock } from '@/shared/lib/utils'
import { sourcesMockApi } from '@/features/sources/api/sources-mock'
import type {
  CreateSourceInput,
  ListSourcesParams,
  Source,
  SourceSectionPath,
  UpdateSourceInput,
} from '@/features/sources/types/source'

function asList<T>(data: T | T[]): T[] {
  return Array.isArray(data) ? data : data ? [data] : []
}

function normalizeSections(value: unknown): SourceSectionPath[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((path): path is unknown[] => Array.isArray(path))
    .map((path) =>
      path
        .filter((seg): seg is string => typeof seg === 'string')
        .map((seg) => seg.trim())
        .filter(Boolean),
    )
    .filter((path) => path.length > 0)
}

function normalizeSource(source: Source): Source {
  return {
    ...source,
    sections: normalizeSections(source.sections),
    keywordsGuide: asList(source.keywordsGuide ?? []),
    clients: asList(source.clients ?? []),
  }
}

function createSourceBody(input: CreateSourceInput) {
  return {
    name: input.name,
    code: input.code,
    category: input.category,
    platform: input.platform,
    ...(input.url ? { url: input.url } : {}),
    ...(input.frequency ? { frequency: input.frequency } : {}),
    ...(input.sections?.length ? { sections: input.sections } : {}),
    ...(input.keywordsGuide?.length
      ? { keywordsGuide: input.keywordsGuide }
      : {}),
    ...(input.clientIds !== undefined ? { clientIds: input.clientIds } : {}),
  }
}

function updateSourceBody(input: UpdateSourceInput) {
  const body: UpdateSourceInput = {}
  if (input.name !== undefined) body.name = input.name
  if (input.category !== undefined) body.category = input.category
  if (input.platform !== undefined) body.platform = input.platform
  if (input.url !== undefined) body.url = input.url
  if (input.frequency !== undefined) body.frequency = input.frequency
  if (input.sections !== undefined) body.sections = input.sections
  if (input.keywordsGuide !== undefined) body.keywordsGuide = input.keywordsGuide
  return body
}

/** Sources contra Nest (`docs/FRONTEND-SOURCES-V2.md`). */
export const sourcesApi = {
  list(params?: ListSourcesParams): Promise<Source[]> {
    if (useApiMock) return sourcesMockApi.list(params)
    return api
      .get<Source[] | Source>('/sources', { params })
      .then((r) => asList(r.data).map(normalizeSource))
  },

  get(id: string): Promise<Source> {
    if (useApiMock) return sourcesMockApi.get(id)
    return api.get<Source>(`/sources/${id}`).then((r) => normalizeSource(r.data))
  },

  create(input: CreateSourceInput): Promise<Source> {
    if (useApiMock) return sourcesMockApi.create(input)
    return api
      .post<Source>('/sources', createSourceBody(input))
      .then((r) => normalizeSource(r.data))
  },

  update(id: string, input: UpdateSourceInput): Promise<Source> {
    if (useApiMock) return sourcesMockApi.update(id, input)
    return api
      .patch<Source>(`/sources/${id}`, updateSourceBody(input))
      .then((r) => normalizeSource(r.data))
  },

  deactivate(id: string): Promise<Source> {
    if (useApiMock) return sourcesMockApi.deactivate(id)
    return api
      .patch<Source>(`/sources/${id}/deactivate`)
      .then((r) => normalizeSource(r.data))
  },

  activate(id: string): Promise<Source> {
    if (useApiMock) return sourcesMockApi.activate(id)
    return api
      .patch<Source>(`/sources/${id}/activate`)
      .then((r) => normalizeSource(r.data))
  },
}
