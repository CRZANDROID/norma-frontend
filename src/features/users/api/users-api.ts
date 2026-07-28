import { api } from '@/shared/lib/axios'
import { useApiMock } from '@/shared/lib/utils'
import { usersMockApi } from '@/features/users/api/users-mock'
import type {
  CreateMembershipInput,
  CreateUserInput,
  ListUsersParams,
  MembershipClientOption,
  NormaUser,
  UpdateMembershipInput,
  UpdateUserRoleInput,
  UserMembership,
} from '@/features/users/types/user'

function asList<T>(data: T | T[]): T[] {
  return Array.isArray(data) ? data : data ? [data] : []
}

function normalizeUser(user: NormaUser): NormaUser {
  return {
    ...user,
    memberships: asList(user.memberships ?? []),
  }
}

function createUserBody(input: CreateUserInput) {
  return {
    email: input.email,
    name: input.name,
    password: input.password,
    ...(input.role ? { role: input.role } : {}),
  }
}

/** Users + memberships contra Nest (`docs/POSTMAN-BACKEND.md` §§7–8). */
export const usersApi = {
  list(params?: ListUsersParams): Promise<NormaUser[]> {
    if (useApiMock) return usersMockApi.list(params)
    return api
      .get<NormaUser[] | NormaUser>('/users', { params })
      .then((r) => asList(r.data).map(normalizeUser))
  },

  get(id: string): Promise<NormaUser> {
    if (useApiMock) return usersMockApi.get(id)
    return api
      .get<NormaUser>(`/users/${id}`)
      .then((r) => normalizeUser(r.data))
  },

  create(input: CreateUserInput): Promise<NormaUser> {
    if (useApiMock) return usersMockApi.create(input)
    return api
      .post<NormaUser>('/users', createUserBody(input))
      .then((r) => normalizeUser(r.data))
  },

  updateRole(id: string, input: UpdateUserRoleInput): Promise<NormaUser> {
    if (useApiMock) return usersMockApi.updateRole(id, input)
    return api
      .patch<NormaUser>(`/users/${id}/role`, input)
      .then((r) => normalizeUser(r.data))
  },

  deactivate(id: string): Promise<NormaUser> {
    if (useApiMock) return usersMockApi.deactivate(id)
    return api
      .patch<NormaUser>(`/users/${id}/deactivate`)
      .then((r) => normalizeUser(r.data))
  },

  activate(id: string): Promise<NormaUser> {
    if (useApiMock) return usersMockApi.activate(id)
    return api
      .patch<NormaUser>(`/users/${id}/activate`)
      .then((r) => normalizeUser(r.data))
  },

  createMembership(
    userId: string,
    input: CreateMembershipInput,
  ): Promise<UserMembership> {
    if (useApiMock) return usersMockApi.createMembership(userId, input)
    return api
      .post<UserMembership>(`/users/${userId}/memberships`, {
        clientId: input.clientId,
        role: input.role,
      })
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

  /** Picker de clientes para membresías — `GET /clients`. */
  listClientsForMembership(): Promise<MembershipClientOption[]> {
    if (useApiMock) return usersMockApi.listClients()
    return api
      .get<
        | Array<{ id: string; name: string; slug: string }>
        | { id: string; name: string; slug: string }
      >('/clients', {
        params: { status: 'ACTIVE' },
      })
      .then((r) =>
        asList(r.data).map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })),
      )
  },
}
