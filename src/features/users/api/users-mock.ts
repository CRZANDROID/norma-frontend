import type {
  CreateMembershipInput,
  ListUsersParams,
  MembershipClientOption,
  NormaUser,
  UpdateMembershipInput,
  UpdateUserRoleInput,
  UserMembership,
} from '@/features/users/types/user'

const now = () => new Date().toISOString()

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function delay(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Clientes seed (mismos ids que clients mock) para el picker de membresía. */
const clientsCatalog: MembershipClientOption[] = [
  {
    id: 'client_arca',
    name: 'Arca Continental',
    slug: 'arca-continental',
  },
  {
    id: 'client_demo',
    name: 'Demo VCGA',
    slug: 'demo-vcga',
  },
]

function clientById(clientId: string): MembershipClientOption | undefined {
  return clientsCatalog.find((c) => c.id === clientId)
}

/** Seed alineado al piloto (admin + analista Arca). */
let users: NormaUser[] = [
  {
    id: 'user_admin',
    authUserId: '00000000-0000-4000-8000-000000000001',
    email: 'admin@norma.local',
    name: 'Admin NORMA',
    role: 'ADMIN',
    status: 'ACTIVE',
    memberships: [],
    createdAt: '2026-07-18T00:00:00.000Z',
    updatedAt: '2026-07-18T00:00:00.000Z',
  },
  {
    id: 'user_analyst',
    authUserId: '00000000-0000-4000-8000-000000000002',
    email: 'analista@norma.local',
    name: 'Ana Analista',
    role: 'ANALYST',
    status: 'ACTIVE',
    memberships: [
      {
        id: 'mem_analyst_arca',
        clientId: 'client_arca',
        clientName: 'Arca Continental',
        clientSlug: 'arca-continental',
        role: 'ANALYST',
        status: 'ACTIVE',
      },
    ],
    createdAt: '2026-07-18T00:00:00.000Z',
    updatedAt: '2026-07-18T00:00:00.000Z',
  },
  {
    id: 'user_viewer',
    authUserId: '00000000-0000-4000-8000-000000000003',
    email: 'viewer@norma.local',
    name: 'Vera Viewer',
    role: 'VIEWER',
    status: 'ACTIVE',
    memberships: [
      {
        id: 'mem_viewer_arca',
        clientId: 'client_arca',
        clientName: 'Arca Continental',
        clientSlug: 'arca-continental',
        role: 'VIEWER',
        status: 'ACTIVE',
      },
    ],
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
  },
  {
    id: 'user_client',
    authUserId: '00000000-0000-4000-8000-000000000004',
    email: 'contacto@arca.com',
    name: 'Contacto Arca',
    role: 'CLIENT_USER',
    status: 'INACTIVE',
    memberships: [
      {
        id: 'mem_client_arca',
        clientId: 'client_arca',
        clientName: 'Arca Continental',
        clientSlug: 'arca-continental',
        role: 'CLIENT_USER',
        status: 'INACTIVE',
      },
    ],
    createdAt: '2026-07-21T00:00:00.000Z',
    updatedAt: '2026-07-22T00:00:00.000Z',
  },
]

function cloneUser(user: NormaUser): NormaUser {
  return {
    ...user,
    memberships: user.memberships.map((m) => ({ ...m })),
  }
}

function findMembership(
  membershipId: string,
): { userIdx: number; memIdx: number; membership: UserMembership } | null {
  for (let userIdx = 0; userIdx < users.length; userIdx++) {
    const memIdx = users[userIdx].memberships.findIndex(
      (m) => m.id === membershipId,
    )
    if (memIdx >= 0) {
      return {
        userIdx,
        memIdx,
        membership: users[userIdx].memberships[memIdx],
      }
    }
  }
  return null
}

export const usersMockApi = {
  async list(params?: ListUsersParams): Promise<NormaUser[]> {
    await delay()
    let rows = users.map(cloneUser)
    if (params?.status === 'ACTIVE' || params?.status === 'INACTIVE') {
      rows = rows.filter((u) => u.status === params.status)
    }
    if (params?.q?.trim()) {
      const q = params.q.trim().toLowerCase()
      rows = rows.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      )
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name))
  },

  async get(userId: string): Promise<NormaUser> {
    await delay()
    const user = users.find((u) => u.id === userId)
    if (!user) throw new Error('Usuario no encontrado')
    return cloneUser(user)
  },

  async updateRole(
    userId: string,
    input: UpdateUserRoleInput,
  ): Promise<NormaUser> {
    await delay()
    const idx = users.findIndex((u) => u.id === userId)
    if (idx < 0) throw new Error('Usuario no encontrado')
    const next: NormaUser = {
      ...users[idx],
      role: input.role,
      updatedAt: now(),
    }
    users = users.map((u, i) => (i === idx ? next : u))
    return cloneUser(next)
  },

  async deactivate(userId: string): Promise<NormaUser> {
    await delay()
    const idx = users.findIndex((u) => u.id === userId)
    if (idx < 0) throw new Error('Usuario no encontrado')
    const next: NormaUser = {
      ...users[idx],
      status: 'INACTIVE',
      updatedAt: now(),
    }
    users = users.map((u, i) => (i === idx ? next : u))
    return cloneUser(next)
  },

  async activate(userId: string): Promise<NormaUser> {
    await delay()
    const idx = users.findIndex((u) => u.id === userId)
    if (idx < 0) throw new Error('Usuario no encontrado')
    const next: NormaUser = {
      ...users[idx],
      status: 'ACTIVE',
      updatedAt: now(),
    }
    users = users.map((u, i) => (i === idx ? next : u))
    return cloneUser(next)
  },

  async createMembership(
    userId: string,
    input: CreateMembershipInput,
  ): Promise<UserMembership> {
    await delay()
    const idx = users.findIndex((u) => u.id === userId)
    if (idx < 0) throw new Error('Usuario no encontrado')
    const client = clientById(input.clientId)
    if (!client) throw new Error('Cliente no encontrado')
    if (users[idx].memberships.some((m) => m.clientId === input.clientId)) {
      throw new Error('Este usuario ya tiene membresía en ese cliente.')
    }
    const membership: UserMembership = {
      id: id('mem'),
      clientId: client.id,
      clientName: client.name,
      clientSlug: client.slug,
      role: input.role,
      status: 'ACTIVE',
    }
    const next: NormaUser = {
      ...users[idx],
      memberships: [...users[idx].memberships, membership],
      updatedAt: now(),
    }
    users = users.map((u, i) => (i === idx ? next : u))
    return { ...membership }
  },

  async updateMembership(
    membershipId: string,
    input: UpdateMembershipInput,
  ): Promise<UserMembership> {
    await delay()
    const found = findMembership(membershipId)
    if (!found) throw new Error('Membresía no encontrada')
    const { userIdx, memIdx, membership } = found
    const nextMem: UserMembership = {
      ...membership,
      ...(input.role ? { role: input.role } : {}),
      ...(input.status ? { status: input.status } : {}),
    }
    const nextUser: NormaUser = {
      ...users[userIdx],
      memberships: users[userIdx].memberships.map((m, i) =>
        i === memIdx ? nextMem : m,
      ),
      updatedAt: now(),
    }
    users = users.map((u, i) => (i === userIdx ? nextUser : u))
    return { ...nextMem }
  },

  async listClients(): Promise<MembershipClientOption[]> {
    await delay(120)
    return clientsCatalog.map((c) => ({ ...c }))
  },
}
