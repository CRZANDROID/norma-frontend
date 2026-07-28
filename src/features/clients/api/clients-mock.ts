import type {
  Client,
  ClientDetail,
  CreateClientInput,
  CreateProfileInput,
  RegulatoryProfile,
  UpdateClientInput,
  UpdateProfileInput,
} from '@/features/clients/types/client'

const now = () => new Date().toISOString()

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

let clients: Client[] = [
  {
    id: 'client_arca',
    name: 'Arca Continental',
    slug: 'arca-continental',
    email: 'asuntos.regulatorios@arca.com',
    phone: null,
    status: 'ACTIVE',
    createdAt: '2026-07-18T00:00:00.000Z',
    updatedAt: '2026-07-18T00:00:00.000Z',
  },
  {
    id: 'client_demo',
    name: 'Demo VCGA',
    slug: 'demo-vcga',
    email: 'ops@norma.local',
    phone: '+52 55 0000 0000',
    status: 'INACTIVE',
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
  },
]

let profiles: RegulatoryProfile[] = [
  {
    id: 'seed-arca-profile',
    clientId: 'client_arca',
    name: 'Perfil bebidas y empaques',
    description:
      'Perfil inicial del piloto NORMA para Arca Continental / Coca-Cola México',
    keywords: [
      'bebidas azucaradas',
      'refrescos',
      'etiquetado',
      'IEPS',
      'PET',
      'publicidad infantil',
      'escuelas',
      'COFEPRIS',
    ],
    categories: ['salud', 'etiquetado', 'impuestos', 'envases', 'publicidad'],
    products: {
      categories: ['refrescos', 'aguas', 'jugos', 'bebidas saborizadas'],
    },
    status: 'ACTIVE',
    createdAt: '2026-07-18T00:00:00.000Z',
    updatedAt: '2026-07-18T00:00:00.000Z',
  },
]

function delay(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function withProfiles(client: Client): ClientDetail {
  return {
    ...client,
    profiles: profiles.filter((p) => p.clientId === client.id),
  }
}

export const clientsMockApi = {
  async list(params?: { status?: string; q?: string }): Promise<Client[]> {
    await delay()
    let rows = [...clients]
    if (params?.status === 'ACTIVE' || params?.status === 'INACTIVE') {
      rows = rows.filter((c) => c.status === params.status)
    }
    if (params?.q?.trim()) {
      const q = params.q.trim().toLowerCase()
      rows = rows.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
      )
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name))
  },

  async get(id: string): Promise<ClientDetail> {
    await delay()
    const client = clients.find((c) => c.id === id)
    if (!client) throw new Error('Cliente no encontrado')
    return withProfiles(client)
  },

  async create(input: CreateClientInput): Promise<Client> {
    await delay()
    if (clients.some((c) => c.slug === input.slug)) {
      throw new Error('Ese slug ya está en uso. Prueba otro.')
    }
    const stamp = now()
    const client: Client = {
      id: id('client'),
      name: input.name,
      slug: input.slug,
      email: input.email ?? null,
      phone: input.phone ?? null,
      status: 'ACTIVE',
      createdAt: stamp,
      updatedAt: stamp,
    }
    clients = [...clients, client]
    return client
  },

  async update(clientId: string, input: UpdateClientInput): Promise<Client> {
    await delay()
    const idx = clients.findIndex((c) => c.id === clientId)
    if (idx < 0) throw new Error('Cliente no encontrado')
    const next = {
      ...clients[idx],
      ...input,
      updatedAt: now(),
    }
    clients = clients.map((c, i) => (i === idx ? next : c))
    return next
  },

  async deactivate(clientId: string): Promise<Client> {
    await delay()
    const idx = clients.findIndex((c) => c.id === clientId)
    if (idx < 0) throw new Error('Cliente no encontrado')
    const next = {
      ...clients[idx],
      status: 'INACTIVE' as const,
      updatedAt: now(),
    }
    clients = clients.map((c, i) => (i === idx ? next : c))
    return next
  },

  async activate(clientId: string): Promise<Client> {
    const idx = clients.findIndex((c) => c.id === clientId)
    if (idx < 0) throw new Error('Cliente no encontrado')
    await delay()
    const next = { ...clients[idx], status: 'ACTIVE' as const, updatedAt: now() }
    clients = clients.map((c, i) => (i === idx ? next : c))
    return next
  },

  async createProfile(
    clientId: string,
    input: CreateProfileInput,
  ): Promise<RegulatoryProfile> {
    await delay()
    if (!clients.some((c) => c.id === clientId)) {
      throw new Error('Cliente no encontrado')
    }
    const stamp = now()
    const profile: RegulatoryProfile = {
      id: id('profile'),
      clientId,
      name: input.name,
      description: input.description ?? null,
      keywords: input.keywords ?? [],
      categories: input.categories ?? [],
      products: input.products ?? null,
      status: 'ACTIVE',
      createdAt: stamp,
      updatedAt: stamp,
    }
    profiles = [...profiles, profile]
    return profile
  },

  async updateProfile(
    profileId: string,
    input: UpdateProfileInput,
  ): Promise<RegulatoryProfile> {
    await delay()
    const idx = profiles.findIndex((p) => p.id === profileId)
    if (idx < 0) throw new Error('Perfil no encontrado')
    const next: RegulatoryProfile = {
      ...profiles[idx],
      name: input.name,
      description: input.description ?? null,
      keywords: input.keywords ?? [],
      categories: input.categories ?? [],
      products: input.products ?? null,
      updatedAt: now(),
    }
    profiles = profiles.map((p, i) => (i === idx ? next : p))
    return next
  },

  async deactivateProfile(profileId: string): Promise<RegulatoryProfile> {
    await delay()
    const idx = profiles.findIndex((p) => p.id === profileId)
    if (idx < 0) throw new Error('Perfil no encontrado')
    const next = { ...profiles[idx], status: 'INACTIVE' as const, updatedAt: now() }
    profiles = profiles.map((p, i) => (i === idx ? next : p))
    return next
  },

  async activateProfile(profileId: string): Promise<RegulatoryProfile> {
    await delay()
    const idx = profiles.findIndex((p) => p.id === profileId)
    if (idx < 0) throw new Error('Perfil no encontrado')
    const next = { ...profiles[idx], status: 'ACTIVE' as const, updatedAt: now() }
    profiles = profiles.map((p, i) => (i === idx ? next : p))
    return next
  },
}
