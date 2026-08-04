/** Estado N:N compartido entre mocks de clients y sources (preview UI). */

export type MockSourceRef = {
  id: string
  name: string
  code: string
  category: string
  platform: string
  status: 'ACTIVE' | 'INACTIVE'
}

export type MockClientRef = {
  id: string
  name: string
  slug: string
  status: 'ACTIVE' | 'INACTIVE'
}

export const MOCK_SOURCE_REFS: MockSourceRef[] = [
  {
    id: 'source_dof',
    name: 'Diario Oficial de la Federación',
    code: 'dof',
    category: 'OFFICIAL',
    platform: 'WEB',
    status: 'ACTIVE',
  },
  {
    id: 'source_diputados',
    name: 'Gaceta Parlamentaria - Cámara de Diputados',
    code: 'diputados-gaceta',
    category: 'OFFICIAL',
    platform: 'WEB',
    status: 'ACTIVE',
  },
  {
    id: 'source_jalisco',
    name: 'Congreso de Jalisco',
    code: 'jalisco-congreso',
    category: 'OFFICIAL',
    platform: 'WEB',
    status: 'ACTIVE',
  },
]

export const MOCK_CLIENT_REFS: MockClientRef[] = [
  {
    id: 'client_arca',
    name: 'Arca Continental',
    slug: 'arca-continental',
    status: 'ACTIVE',
  },
  {
    id: 'client_demo',
    name: 'Demo VCGA',
    slug: 'demo-vcga',
    status: 'INACTIVE',
  },
]

/** clientId → sourceIds */
let linksByClient: Record<string, string[]> = {
  client_arca: ['source_dof', 'source_diputados'],
}

export function getSourceIdsForClient(clientId: string): string[] {
  return [...(linksByClient[clientId] ?? [])]
}

export function setSourceIdsForClient(clientId: string, sourceIds: string[]) {
  linksByClient = {
    ...linksByClient,
    [clientId]: [...new Set(sourceIds)],
  }
}

export function getClientIdsForSource(sourceId: string): string[] {
  return Object.entries(linksByClient)
    .filter(([, sourceIds]) => sourceIds.includes(sourceId))
    .map(([clientId]) => clientId)
}

/** Al crear fuente con clientIds, añade vínculos sin quitar los existentes del cliente. */
export function linkSourceToClients(sourceId: string, clientIds: string[]) {
  for (const clientId of clientIds) {
    const current = linksByClient[clientId] ?? []
    if (!current.includes(sourceId)) {
      linksByClient = {
        ...linksByClient,
        [clientId]: [...current, sourceId],
      }
    }
  }
}

export function resolveSourcesForClient(clientId: string): MockSourceRef[] {
  const ids = getSourceIdsForClient(clientId)
  return ids
    .map((id) => MOCK_SOURCE_REFS.find((s) => s.id === id))
    .filter((s): s is MockSourceRef => Boolean(s))
}

export function resolveClientsForSource(sourceId: string): MockClientRef[] {
  const ids = getClientIdsForSource(sourceId)
  return ids
    .map((id) => MOCK_CLIENT_REFS.find((c) => c.id === id))
    .filter((c): c is MockClientRef => Boolean(c))
}

export function registerMockSourceRef(ref: MockSourceRef) {
  const idx = MOCK_SOURCE_REFS.findIndex((s) => s.id === ref.id)
  if (idx >= 0) MOCK_SOURCE_REFS[idx] = ref
  else MOCK_SOURCE_REFS.push(ref)
}

export function registerMockClientRef(ref: MockClientRef) {
  if (!MOCK_CLIENT_REFS.some((c) => c.id === ref.id)) {
    MOCK_CLIENT_REFS.push(ref)
  }
}
