import { api } from '@/shared/lib/axios'
import { useApiMock } from '@/shared/lib/utils'
import { sourcesMockApi } from '@/features/sources/api/sources-mock'
import type {
  CreateSourceInput,
  ListSourcesParams,
  Source,
  UpdateSourceInput,
} from '@/features/sources/types/source'

/** Capa de API: mock hoy, Nest mañana sin cambiar la UI. */
export const sourcesApi = {
  list(params?: ListSourcesParams): Promise<Source[]> {
    if (useApiMock) return sourcesMockApi.list(params)
    return api.get<Source[]>('/sources', { params }).then((r) => r.data)
  },

  get(id: string): Promise<Source> {
    if (useApiMock) return sourcesMockApi.get(id)
    return api.get<Source>(`/sources/${id}`).then((r) => r.data)
  },

  create(input: CreateSourceInput): Promise<Source> {
    if (useApiMock) return sourcesMockApi.create(input)
    return api.post<Source>('/sources', input).then((r) => r.data)
  },

  update(id: string, input: UpdateSourceInput): Promise<Source> {
    if (useApiMock) return sourcesMockApi.update(id, input)
    return api.patch<Source>(`/sources/${id}`, input).then((r) => r.data)
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
