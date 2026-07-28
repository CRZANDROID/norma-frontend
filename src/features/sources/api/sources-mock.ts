import type {
  CreateSourceInput,
  ListSourcesParams,
  Source,
  UpdateSourceInput,
} from '@/features/sources/types/source'

const now = () => new Date().toISOString()

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function delay(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Seed alineado a `prisma/seed.ts` del backend. */
let sources: Source[] = [
  {
    id: 'source_dof',
    name: 'Diario Oficial de la Federación',
    code: 'dof',
    type: 'DOF',
    url: 'https://www.dof.gob.mx/',
    section: null,
    jurisdiction: 'federal',
    frequency: 'daily',
    keywordsGuide: ['COFEPRIS', 'NOM', 'etiquetado', 'IEPS', 'bebidas'],
    config: null,
    status: 'ACTIVE',
    createdAt: '2026-07-18T00:00:00.000Z',
    updatedAt: '2026-07-18T00:00:00.000Z',
  },
  {
    id: 'source_diputados',
    name: 'Gaceta Parlamentaria - Cámara de Diputados',
    code: 'diputados-gaceta',
    type: 'CONGRESS_FEDERAL',
    url: 'https://gaceta.diputados.gob.mx/',
    section: null,
    jurisdiction: 'federal',
    frequency: 'daily',
    keywordsGuide: ['Ley General de Salud', 'bebidas azucaradas', 'etiquetado'],
    config: null,
    status: 'ACTIVE',
    createdAt: '2026-07-18T00:00:00.000Z',
    updatedAt: '2026-07-18T00:00:00.000Z',
  },
  {
    id: 'source_jalisco',
    name: 'Congreso de Jalisco',
    code: 'jalisco-congreso',
    type: 'CONGRESS_STATE',
    url: 'https://www.congresojal.gob.mx/',
    section: null,
    jurisdiction: 'JAL',
    frequency: 'daily',
    keywordsGuide: ['bebidas', 'salud', 'publicidad', 'residuos'],
    config: null,
    status: 'ACTIVE',
    createdAt: '2026-07-18T00:00:00.000Z',
    updatedAt: '2026-07-18T00:00:00.000Z',
  },
]

export const sourcesMockApi = {
  async list(params?: ListSourcesParams): Promise<Source[]> {
    await delay()
    let rows = [...sources]
    if (params?.status === 'ACTIVE' || params?.status === 'INACTIVE') {
      rows = rows.filter((s) => s.status === params.status)
    }
    if (params?.type) {
      rows = rows.filter((s) => s.type === params.type)
    }
    if (params?.jurisdiction?.trim()) {
      const j = params.jurisdiction.trim().toLowerCase()
      rows = rows.filter((s) =>
        (s.jurisdiction ?? '').toLowerCase().includes(j),
      )
    }
    if (params?.q?.trim()) {
      const q = params.q.trim().toLowerCase()
      rows = rows.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q),
      )
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name))
  },

  async get(sourceId: string): Promise<Source> {
    await delay()
    const source = sources.find((s) => s.id === sourceId)
    if (!source) throw new Error('Fuente no encontrada')
    return { ...source }
  },

  async create(input: CreateSourceInput): Promise<Source> {
    await delay()
    if (sources.some((s) => s.code === input.code)) {
      throw new Error('Ese código ya está en uso. Prueba otro.')
    }
    const stamp = now()
    const source: Source = {
      id: id('source'),
      name: input.name,
      code: input.code,
      type: input.type,
      url: input.url ?? null,
      section: input.section ?? null,
      jurisdiction: input.jurisdiction ?? null,
      frequency: input.frequency ?? null,
      keywordsGuide: input.keywordsGuide ?? [],
      config: input.config ?? null,
      status: 'ACTIVE',
      createdAt: stamp,
      updatedAt: stamp,
    }
    sources = [...sources, source]
    return source
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
    return next
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
    return next
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
    return next
  },
}
