import { api } from '@/shared/lib/axios'
import { useApiMock } from '@/shared/lib/utils'
import { sourcesMockApi } from '@/features/sources/api/sources-mock'
import type {
  CreateSourceInput,
  ListSourcesParams,
  Source,
  UpdateSourceInput,
} from '@/features/sources/types/source'

function asList<T>(data: T | T[]): T[] {
  return Array.isArray(data) ? data : data ? [data] : []
}

function createSourceBody(input: CreateSourceInput) {
  return {
    name: input.name,
    code: input.code,
    type: input.type,
    ...(input.url ? { url: input.url } : {}),
    ...(input.section ? { section: input.section } : {}),
    ...(input.jurisdiction ? { jurisdiction: input.jurisdiction } : {}),
    ...(input.frequency ? { frequency: input.frequency } : {}),
    ...(input.keywordsGuide?.length
      ? { keywordsGuide: input.keywordsGuide }
      : {}),
    ...(input.config ? { config: input.config } : {}),
  }
}

function updateSourceBody(input: UpdateSourceInput) {
  const body: UpdateSourceInput = {}
  if (input.name !== undefined) body.name = input.name
  if (input.type !== undefined) body.type = input.type
  if (input.url !== undefined) body.url = input.url
  if (input.section !== undefined) body.section = input.section
  if (input.jurisdiction !== undefined) body.jurisdiction = input.jurisdiction
  if (input.frequency !== undefined) body.frequency = input.frequency
  if (input.keywordsGuide !== undefined) body.keywordsGuide = input.keywordsGuide
  if (input.config !== undefined) body.config = input.config
  return body
}

/** Sources contra Nest (`docs/POSTMAN-BACKEND.md` §6). */
export const sourcesApi = {
  list(params?: ListSourcesParams): Promise<Source[]> {
    if (useApiMock) return sourcesMockApi.list(params)
    return api
      .get<Source[] | Source>('/sources', { params })
      .then((r) => asList(r.data))
  },

  get(id: string): Promise<Source> {
    if (useApiMock) return sourcesMockApi.get(id)
    return api.get<Source>(`/sources/${id}`).then((r) => r.data)
  },

  create(input: CreateSourceInput): Promise<Source> {
    if (useApiMock) return sourcesMockApi.create(input)
    return api
      .post<Source>('/sources', createSourceBody(input))
      .then((r) => r.data)
  },

  update(id: string, input: UpdateSourceInput): Promise<Source> {
    if (useApiMock) return sourcesMockApi.update(id, input)
    return api
      .patch<Source>(`/sources/${id}`, updateSourceBody(input))
      .then((r) => r.data)
  },

  deactivate(id: string): Promise<Source> {
    if (useApiMock) return sourcesMockApi.deactivate(id)
    return api.patch<Source>(`/sources/${id}/deactivate`).then((r) => r.data)
  },

  activate(id: string): Promise<Source> {
    if (useApiMock) return sourcesMockApi.activate(id)
    return api.patch<Source>(`/sources/${id}/activate`).then((r) => r.data)
  },
}
