import type {
  CreateSourceInput,
  ListSourcesParams,
  Source,
  SourceClientRef,
  UpdateSourceInput,
} from '@/features/sources/types/source'
import { FEDERAL_STATE_VALUE } from '@/features/sources/lib/mexican-states'
import {
  serializeFrequency,
  defaultFrequencySchedule,
} from '@/features/sources/lib/frequency'
import {
  linkSourceToClients,
  registerMockSourceRef,
  resolveClientsForSource,
} from '@/shared/lib/mock-client-sources'

const now = () => new Date().toISOString()

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function delay(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const defaultFrequency = serializeFrequency(defaultFrequencySchedule())

/** Seed alineado a `prisma/seed.ts` del backend (Sources v2). */
let sources: Source[] = [
  {
    id: 'source_dof',
    name: 'Diario Oficial de la Federación',
    code: 'dof',
    category: 'OFFICIAL',
    platform: 'WEB',
    url: 'https://www.dof.gob.mx/',
    frequency: defaultFrequency,
    stateCode: null,
    sections: [
      ['Comunicados', 'Normatividad'],
      ['Avisos'],
    ],
    keywordsGuide: ['COFEPRIS', 'NOM', 'etiquetado', 'IEPS', 'bebidas'],
    status: 'ACTIVE',
    createdAt: '2026-07-18T00:00:00.000Z',
    updatedAt: '2026-07-18T00:00:00.000Z',
  },
  {
    id: 'source_diputados',
    name: 'Gaceta Parlamentaria - Cámara de Diputados',
    code: 'diputados-gaceta',
    category: 'OFFICIAL',
    platform: 'WEB',
    url: 'https://gaceta.diputados.gob.mx/',
    frequency: defaultFrequency,
    stateCode: null,
    sections: [['Gaceta', 'Iniciativas']],
    keywordsGuide: ['Ley General de Salud', 'bebidas azucaradas', 'etiquetado'],
    status: 'ACTIVE',
    createdAt: '2026-07-18T00:00:00.000Z',
    updatedAt: '2026-07-18T00:00:00.000Z',
  },
  {
    id: 'source_jalisco',
    name: 'Congreso de Jalisco',
    code: 'jalisco-congreso',
    category: 'OFFICIAL',
    platform: 'WEB',
    url: 'https://www.congresojal.gob.mx/',
    frequency: defaultFrequency,
    stateCode: 'JAL',
    sections: [['Comunicados'], ['Sesiones']],
    keywordsGuide: ['bebidas', 'salud', 'publicidad', 'residuos'],
    status: 'ACTIVE',
    createdAt: '2026-07-18T00:00:00.000Z',
    updatedAt: '2026-07-18T00:00:00.000Z',
  },
]

function asClientRefs(sourceId: string): SourceClientRef[] {
  return resolveClientsForSource(sourceId).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    status: c.status,
  }))
}

function withClients(source: Source): Source {
  return { ...source, clients: asClientRefs(source.id) }
}

export const sourcesMockApi = {
  async list(params?: ListSourcesParams): Promise<Source[]> {
    await delay()
    let rows = [...sources]
    if (params?.status === 'ACTIVE' || params?.status === 'INACTIVE') {
      rows = rows.filter((s) => s.status === params.status)
    }
    if (params?.category) {
      rows = rows.filter((s) => s.category === params.category)
    }
    if (params?.platform) {
      rows = rows.filter((s) => s.platform === params.platform)
    }
    if (params?.stateCode === FEDERAL_STATE_VALUE) {
      rows = rows.filter((s) => !s.stateCode)
    } else if (params?.stateCode) {
      rows = rows.filter((s) => s.stateCode === params.stateCode)
    }
    if (params?.clientId) {
      const clientId = params.clientId
      rows = rows.filter((s) =>
        resolveClientsForSource(s.id).some((c) => c.id === clientId),
      )
    }
    if (params?.q?.trim()) {
      const q = params.q.trim().toLowerCase()
      rows = rows.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q),
      )
    }
    return rows
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => withClients(s))
  },

  async get(sourceId: string): Promise<Source> {
    await delay()
    const source = sources.find((s) => s.id === sourceId)
    if (!source) throw new Error('Fuente no encontrada')
    return withClients(source)
  },

  async create(input: CreateSourceInput): Promise<Source> {
    await delay()
    if (sources.some((s) => s.code === input.code)) {
      throw new Error('Ese identificador ya está en uso. Prueba otro.')
    }
    const stamp = now()
    const source: Source = {
      id: id('source'),
      name: input.name,
      code: input.code,
      category: input.category,
      platform: input.platform,
      url: input.url ?? null,
      frequency: input.frequency ?? defaultFrequency,
      stateCode: input.stateCode ?? null,
      sections: input.sections ?? [],
      keywordsGuide: input.keywordsGuide ?? [],
      status: 'ACTIVE',
      createdAt: stamp,
      updatedAt: stamp,
    }
    sources = [...sources, source]
    registerMockSourceRef({
      id: source.id,
      name: source.name,
      code: source.code,
      category: source.category,
      platform: source.platform,
      status: source.status,
    })
    if (input.clientIds?.length) {
      linkSourceToClients(source.id, input.clientIds)
    }
    return withClients(source)
  },

  async update(sourceId: string, input: UpdateSourceInput): Promise<Source> {
    await delay()
    const idx = sources.findIndex((s) => s.id === sourceId)
    if (idx < 0) throw new Error('Fuente no encontrada')
    const next: Source = {
      ...sources[idx],
      ...input,
      updatedAt: now(),
    }
    sources = sources.map((s, i) => (i === idx ? next : s))
    registerMockSourceRef({
      id: next.id,
      name: next.name,
      code: next.code,
      category: next.category,
      platform: next.platform,
      status: next.status,
    })
    return withClients(next)
  },

  async deactivate(sourceId: string): Promise<Source> {
    await delay()
    const idx = sources.findIndex((s) => s.id === sourceId)
    if (idx < 0) throw new Error('Fuente no encontrada')
    const next = {
      ...sources[idx],
      status: 'INACTIVE' as const,
      updatedAt: now(),
    }
    sources = sources.map((s, i) => (i === idx ? next : s))
    return withClients(next)
  },

  async activate(sourceId: string): Promise<Source> {
    await delay()
    const idx = sources.findIndex((s) => s.id === sourceId)
    if (idx < 0) throw new Error('Fuente no encontrada')
    const next = {
      ...sources[idx],
      status: 'ACTIVE' as const,
      updatedAt: now(),
    }
    sources = sources.map((s, i) => (i === idx ? next : s))
    return withClients(next)
  },
}
