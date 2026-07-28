export type EntityStatus = 'ACTIVE' | 'INACTIVE'

/** Enum Prisma `UserRole` — SPRINT-3-BACKEND §7.5 */
export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER' | 'CLIENT_USER'

export const USER_ROLES: UserRole[] = [
  'ADMIN',
  'ANALYST',
  'VIEWER',
  'CLIENT_USER',
]

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  ANALYST: 'Analista',
  VIEWER: 'Observador',
  CLIENT_USER: 'Usuario cliente',
}

export type UserMembership = {
  id: string
  clientId: string
  clientName: string
  clientSlug: string
  role: UserRole
  status: EntityStatus
}

export type NormaUser = {
  id: string
  email: string
  name: string
  role: UserRole
  status: EntityStatus
  memberships: UserMembership[]
  createdAt: string
  updatedAt: string
}

/** Opción mínima para el picker de membresía (GET /clients). */
export type MembershipClientOption = {
  id: string
  name: string
  slug: string
}

export type CreateUserInput = {
  email: string
  name: string
  password: string
  role?: UserRole
}

export type UpdateUserRoleInput = {
  role: UserRole
}

export type CreateMembershipInput = {
  clientId: string
  role: UserRole
}

export type UpdateMembershipInput = {
  role?: UserRole
  status?: EntityStatus
}

export type ListUsersParams = {
  status?: EntityStatus
  q?: string
}
