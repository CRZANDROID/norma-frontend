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

function asList<T>(data: T | T[]): T[] {
  return Array.isArray(data) ? data : data ? [data] : []
}

/** Solo campos del contrato Nest (forbidNonWhitelisted). */
function createClientBody(input: CreateClientInput) {
  return {
    name: input.name,
    slug: input.slug,
    ...(input.email ? { email: input.email } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.sourceIds !== undefined ? { sourceIds: input.sourceIds } : {}),
    ...(input.fiscal ? { fiscal: input.fiscal } : {}),
    ...(input.contacts !== undefined ? { contacts: input.contacts } : {}),
  }
}

function updateClientBody(input: UpdateClientInput) {
  const body: UpdateClientInput = {}
  if (input.name !== undefined) body.name = input.name
  if (input.email !== undefined) body.email = input.email
  if (input.phone !== undefined) body.phone = input.phone
  if (input.sourceIds !== undefined) body.sourceIds = input.sourceIds
  if (input.fiscal !== undefined) body.fiscal = input.fiscal
  if (input.contacts !== undefined) body.contacts = input.contacts
  if (input.alertPolicy !== undefined) body.alertPolicy = input.alertPolicy
  return body
}

/**
 * Clients + profiles contra Nest (`docs/POSTMAN-BACKEND.md` §§4–5).
 * Mock solo si `VITE_USE_API_MOCK` / design preview.
 */
export const clientsApi = {
  list(params?: { status?: string; q?: string }): Promise<Client[]> {
    if (useApiMock) return clientsMockApi.list(params)
    return api
      .get<Client[] | Client>('/clients', { params })
      .then((r) =>
        asList(r.data).map((c) => ({
          ...c,
          sources: asList(c.sources ?? []),
        })),
      )
  },

  get(id: string): Promise<ClientDetail> {
    if (useApiMock) return clientsMockApi.get(id)
    return api.get<ClientDetail>(`/clients/${id}`).then((r) => ({
      ...r.data,
      profiles: asList(r.data.profiles ?? []),
      sources: asList(r.data.sources ?? []),
      fiscalData: r.data.fiscalData ?? null,
      contacts: asList(r.data.contacts ?? []),
      alertPolicy: r.data.alertPolicy,
    }))
  },

  create(input: CreateClientInput): Promise<Client> {
    if (useApiMock) return clientsMockApi.create(input)
    return api
      .post<Client>('/clients', createClientBody(input))
      .then((r) => r.data)
  },

  update(id: string, input: UpdateClientInput): Promise<Client> {
    if (useApiMock) return clientsMockApi.update(id, input)
    return api
      .patch<Client>(`/clients/${id}`, updateClientBody(input))
      .then((r) => r.data)
  },

  deactivate(id: string): Promise<Client> {
    if (useApiMock) return clientsMockApi.deactivate(id)
    return api.patch<Client>(`/clients/${id}/deactivate`).then((r) => r.data)
  },

  activate(id: string): Promise<Client> {
    if (useApiMock) return clientsMockApi.activate(id)
    return api.patch<Client>(`/clients/${id}/activate`).then((r) => r.data)
  },

  listProfiles(
    clientId: string,
    params?: { status?: string },
  ): Promise<RegulatoryProfile[]> {
    if (useApiMock) {
      return clientsMockApi.get(clientId).then((d) => {
        const rows = d.profiles
        if (!params?.status) return rows
        return rows.filter((p) => p.status === params.status)
      })
    }
    return api
      .get<RegulatoryProfile[] | RegulatoryProfile>(
        `/clients/${clientId}/profiles`,
        { params },
      )
      .then((r) => asList(r.data))
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
