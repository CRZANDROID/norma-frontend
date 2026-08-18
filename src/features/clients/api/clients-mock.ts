import type {
  Client,
  ClientContact,
  ClientContactInput,
  ClientDetail,
  ClientFiscalData,
  ClientSourceRef,
  CreateClientInput,
  CreateProfileInput,
  RegulatoryProfile,
  UpdateClientInput,
  UpdateProfileInput,
} from '@/features/clients/types/client'
import { defaultAlertPolicy } from '@/features/clients/types/client'
import {
  registerMockClientRef,
  resolveSourcesForClient,
  setSourceIdsForClient,
} from '@/shared/lib/mock-client-sources'

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
    alertPolicy: defaultAlertPolicy(),
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

const fiscalByClient: Record<string, ClientFiscalData> = {
  client_arca: {
    legalName: 'Arca Continental, S.A.B. de C.V.',
    rfc: 'ACO010101AAA',
    postalCode: '64000',
    cfdi: 'G03',
    taxRegime: '601',
  },
}

const contactsByClient: Record<string, ClientContact[]> = {
  client_arca: [
    {
      id: 'contact_arca_1',
      name: 'Ana Regulatoria',
      phone: '+52 81 8000 1000',
      email: 'ana.regulatoria@arca.com',
      status: 'ACTIVE',
    },
  ],
}

function delay(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function asSourceRefs(clientId: string): ClientSourceRef[] {
  return resolveSourcesForClient(clientId).map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    category: s.category,
    platform: s.platform,
    status: s.status,
  }))
}

function fiscalDataFor(clientId: string): ClientFiscalData | null {
  return fiscalByClient[clientId] ?? null
}

function contactsFor(clientId: string): ClientContact[] {
  return [...(contactsByClient[clientId] ?? [])]
}

function mapContactInputs(inputs: ClientContactInput[]): ClientContact[] {
  return inputs.map((contact) => ({
    id: id('contact'),
    name: contact.name,
    phone: contact.phone,
    email: contact.email ?? null,
    status: 'ACTIVE' as const,
  }))
}

function withClientExtras(client: Client): Client {
  return {
    ...client,
    sources: asSourceRefs(client.id),
    fiscalData: fiscalDataFor(client.id),
    contacts: contactsFor(client.id),
  }
}

function withRelations(client: Client): ClientDetail {
  return {
    ...client,
    profiles: profiles.filter((p) => p.clientId === client.id),
    sources: asSourceRefs(client.id),
    fiscalData: fiscalDataFor(client.id),
    contacts: contactsFor(client.id),
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
    return rows
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => withClientExtras(c))
  },

  async get(id: string): Promise<ClientDetail> {
    await delay()
    const client = clients.find((c) => c.id === id)
    if (!client) throw new Error('Cliente no encontrado')
    return withRelations(client)
  },

  async create(input: CreateClientInput): Promise<Client> {
    await delay()
    if (clients.some((c) => c.slug === input.slug)) {
      throw new Error('Ese identificador ya está en uso. Prueba otro.')
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
    registerMockClientRef({
      id: client.id,
      name: client.name,
      slug: client.slug,
      status: client.status,
    })
    if (input.sourceIds) {
      setSourceIdsForClient(client.id, input.sourceIds)
    }
    if (input.fiscal) {
      fiscalByClient[client.id] = { ...input.fiscal }
    }
    if (input.contacts) {
      contactsByClient[client.id] = mapContactInputs(input.contacts)
    }
    return withClientExtras(client)
  },

  async update(clientId: string, input: UpdateClientInput): Promise<Client> {
    await delay()
    const idx = clients.findIndex((c) => c.id === clientId)
    if (idx < 0) throw new Error('Cliente no encontrado')
    const { sourceIds, fiscal, contacts, alertPolicy, ...rest } = input
    const next = {
      ...clients[idx],
      ...rest,
      ...(alertPolicy !== undefined ? { alertPolicy } : {}),
      updatedAt: now(),
    }
    clients = clients.map((c, i) => (i === idx ? next : c))
    if (sourceIds !== undefined) {
      setSourceIdsForClient(clientId, sourceIds)
    }
    if (fiscal !== undefined) {
      fiscalByClient[clientId] = { ...fiscal }
    }
    if (contacts !== undefined) {
      contactsByClient[clientId] = mapContactInputs(contacts)
    }
    registerMockClientRef({
      id: next.id,
      name: next.name,
      slug: next.slug,
      status: next.status,
    })
    return withClientExtras(next)
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
    return withClientExtras(next)
  },

  async activate(clientId: string): Promise<Client> {
    const idx = clients.findIndex((c) => c.id === clientId)
    if (idx < 0) throw new Error('Cliente no encontrado')
    await delay()
    const next = { ...clients[idx], status: 'ACTIVE' as const, updatedAt: now() }
    clients = clients.map((c, i) => (i === idx ? next : c))
    return withClientExtras(next)
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
    const next = {
      ...profiles[idx],
      status: 'INACTIVE' as const,
      updatedAt: now(),
    }
    profiles = profiles.map((p, i) => (i === idx ? next : p))
    return next
  },

  async activateProfile(profileId: string): Promise<RegulatoryProfile> {
    await delay()
    const idx = profiles.findIndex((p) => p.id === profileId)
    if (idx < 0) throw new Error('Perfil no encontrado')
    const next = {
      ...profiles[idx],
      status: 'ACTIVE' as const,
      updatedAt: now(),
    }
    profiles = profiles.map((p, i) => (i === idx ? next : p))
    return next
  },
}
