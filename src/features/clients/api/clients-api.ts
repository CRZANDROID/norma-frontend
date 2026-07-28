import { api } from '@/shared/lib/axios'
import { useApiMock } from '@/shared/lib/utils'
import { clientsMockApi } from '@/features/clients/api/clients-mock'
import type {
  Client,
  ClientDetail,
  CreateClientInput,
  CreateProfileInput,
  RegulatoryProfile,
  UpdateClientInput,
  UpdateProfileInput,
} from '@/features/clients/types/client'

/** Capa de API: mock hoy, Nest mañana sin cambiar la UI. */
export const clientsApi = {
  list(params?: { status?: string; q?: string }): Promise<Client[]> {
    if (useApiMock) return clientsMockApi.list(params)
    return api
      .get<Client[]>('/clients', { params })
      .then((r) => r.data)
  },

  get(id: string): Promise<ClientDetail> {
    if (useApiMock) return clientsMockApi.get(id)
    return api.get<ClientDetail>(`/clients/${id}`).then((r) => r.data)
  },

  create(input: CreateClientInput): Promise<Client> {
    if (useApiMock) return clientsMockApi.create(input)
    return api.post<Client>('/clients', input).then((r) => r.data)
  },

  update(id: string, input: UpdateClientInput): Promise<Client> {
    if (useApiMock) return clientsMockApi.update(id, input)
    return api.patch<Client>(`/clients/${id}`, input).then((r) => r.data)
  },

  deactivate(id: string): Promise<Client> {
    if (useApiMock) return clientsMockApi.deactivate(id)
    return api.patch<Client>(`/clients/${id}/deactivate`).then((r) => r.data)
  },

  activate(id: string): Promise<Client> {
    if (useApiMock) return clientsMockApi.activate(id)
    return api.patch<Client>(`/clients/${id}/activate`).then((r) => r.data)
  },

  createProfile(
    clientId: string,
    input: CreateProfileInput,
  ): Promise<RegulatoryProfile> {
    if (useApiMock) return clientsMockApi.createProfile(clientId, input)
    return api
      .post<RegulatoryProfile>(`/clients/${clientId}/profiles`, input)
      .then((r) => r.data)
  },

  updateProfile(
    profileId: string,
    input: UpdateProfileInput,
  ): Promise<RegulatoryProfile> {
    if (useApiMock) return clientsMockApi.updateProfile(profileId, input)
    return api
      .patch<RegulatoryProfile>(`/profiles/${profileId}`, input)
      .then((r) => r.data)
  },

  deactivateProfile(profileId: string): Promise<RegulatoryProfile> {
    if (useApiMock) return clientsMockApi.deactivateProfile(profileId)
    return api
      .patch<RegulatoryProfile>(`/profiles/${profileId}/deactivate`)
      .then((r) => r.data)
  },

  activateProfile(profileId: string): Promise<RegulatoryProfile> {
    if (useApiMock) return clientsMockApi.activateProfile(profileId)
    return api
      .patch<RegulatoryProfile>(`/profiles/${profileId}/activate`)
      .then((r) => r.data)
  },
}
