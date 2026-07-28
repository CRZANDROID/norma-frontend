import { api } from '@/shared/lib/axios'
import { useApiMock } from '@/shared/lib/utils'
import { usersMockApi } from '@/features/users/api/users-mock'
import type {
  CreateMembershipInput,
  ListUsersParams,
  MembershipClientOption,
  NormaUser,
  UpdateMembershipInput,
  UpdateUserRoleInput,
  UserMembership,
} from '@/features/users/types/user'

/** Lista/detalle → Nest cuando mock OFF. Mutaciones CRUD Users aún no existen en Nest. */
export const usersApi = {
  list(params?: ListUsersParams): Promise<NormaUser[]> {
    if (useApiMock) return usersMockApi.list(params)
    return api.get<NormaUser[]>('/users', { params }).then((r) => r.data)
  },

  get(id: string): Promise<NormaUser> {
    if (useApiMock) return usersMockApi.get(id)
    return api.get<NormaUser>(`/users/${id}`).then((r) => r.data)
  },

  updateRole(id: string, input: UpdateUserRoleInput): Promise<NormaUser> {
    if (useApiMock) return usersMockApi.updateRole(id, input)
    return api
      .patch<NormaUser>(`/users/${id}/role`, input)
      .then((r) => r.data)
  },

  deactivate(id: string): Promise<NormaUser> {
    if (useApiMock) return usersMockApi.deactivate(id)
    return api.patch<NormaUser>(`/users/${id}/deactivate`).then((r) => r.data)
  },

  activate(id: string): Promise<NormaUser> {
    if (useApiMock) return usersMockApi.activate(id)
    return api.patch<NormaUser>(`/users/${id}/activate`).then((r) => r.data)
  },

  createMembership(
    userId: string,
    input: CreateMembershipInput,
  ): Promise<UserMembership> {
    if (useApiMock) return usersMockApi.createMembership(userId, input)
    return api
      .post<UserMembership>(`/users/${userId}/memberships`, input)
      .then((r) => r.data)
  },

  updateMembership(
    membershipId: string,
    input: UpdateMembershipInput,
  ): Promise<UserMembership> {
    if (useApiMock) return usersMockApi.updateMembership(membershipId, input)
    return api
      .patch<UserMembership>(`/memberships/${membershipId}`, input)
      .then((r) => r.data)
  },

  /**
   * Picker de clientes para membresías.
   * Contrato Clients §7.2 — no es un endpoint de Users.
   */
  listClientsForMembership(): Promise<MembershipClientOption[]> {
    if (useApiMock) return usersMockApi.listClients()
    return api
      .get<Array<{ id: string; name: string; slug: string }>>('/clients', {
        params: { status: 'ACTIVE' },
      })
      .then((r) =>
        r.data.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      )
  },
}
