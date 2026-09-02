import type {
  FindingDetail,
  FindingListItem,
  FindingsProgress,
  ListFindingsParams,
} from '@/features/findings/types/finding'

function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const now = '2026-09-01T18:00:00.000Z'

const rows: FindingDetail[] = [
  {
    id: 'finding_orange_etiquetado',
    title: 'Etiquetado y vigilancia sanitaria',
    impact: 'ORANGE',
    status: 'OPEN',
    suggestedAction: 'Elaborar nota y monitorear avance',
    justificationShort:
      'El decreto toca etiquetado de bebidas, alineado al perfil de Arca Continental.',
    justification:
      'El decreto toca etiquetado de bebidas, alineado al perfil de Arca Continental. Conviene elaborar una nota y dar seguimiento al calendario de entrada en vigor.',
    description: 'El decreto toca etiquetado de bebidas, alineado al perfil de Arca Continental.',
    client: {
      id: 'client_arca',
      name: 'Arca Continental',
      slug: 'arca-continental',
    },
    source: {
      id: 'source_dof',
      name: 'Diario Oficial de la Federación',
      code: 'dof',
    },
    document: {
      id: 'doc_dof_ready',
      filename: 'page.html',
      processingStatus: 'CLASSIFIED',
      url: 'https://dof.gob.mx/nota_detalle.php?codigo=mock-etiquetado',
    },
    aiMeta: {
      model: 'gpt-4o-mini',
      promptVersion: 'classify-v1',
      relevant: true,
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'finding_red_impuesto',
    title: 'Ajuste fiscal en bebidas azucaradas',
    impact: 'RED',
    status: 'OPEN',
    suggestedAction: 'Alertar de inmediato y preparar nota ejecutiva',
    justificationShort:
      'La iniciativa modifica el tratamiento fiscal de bebidas azucaradas en el ámbito federal.',
    justification:
      'La iniciativa modifica el tratamiento fiscal de bebidas azucaradas en el ámbito federal. El impacto es alto para el portafolio del cliente; conviene una nota ejecutiva.',
    description: null,
    client: {
      id: 'client_arca',
      name: 'Arca Continental',
      slug: 'arca-continental',
    },
    source: {
      id: 'source_diputados',
      name: 'Gaceta Diputados',
      code: 'diputados-gaceta',
    },
    document: {
      id: 'doc_diputados_tax',
      filename: 'gaceta.html',
      processingStatus: 'CLASSIFIED',
      url: 'https://gaceta.diputados.gob.mx/mock-impuesto',
    },
    aiMeta: {
      model: 'gpt-4o-mini',
      promptVersion: 'classify-v1',
      relevant: true,
    },
    createdAt: '2026-09-01T16:40:00.000Z',
    updatedAt: '2026-09-01T16:40:00.000Z',
  },
  {
    id: 'finding_green_contexto',
    title: 'Aviso de consulta pública sin cambio operativo',
    impact: 'GREEN',
    status: 'OPEN',
    suggestedAction: 'Registrar como contexto',
    justificationShort:
      'La consulta no altera obligaciones inmediatas del portafolio; queda como contexto.',
    justification:
      'La consulta no altera obligaciones inmediatas del portafolio; queda como contexto para el expediente del cliente.',
    description: null,
    client: {
      id: 'client_arca',
      name: 'Arca Continental',
      slug: 'arca-continental',
    },
    source: {
      id: 'source_jalisco',
      name: 'Congreso de Jalisco',
      code: 'jalisco-congreso',
    },
    document: {
      id: 'doc_jalisco_notice',
      filename: 'gaceta.html',
      processingStatus: 'CLASSIFIED',
      url: 'https://congresojal.gob.mx/mock-consulta',
    },
    aiMeta: {
      model: 'gpt-4o-mini',
      promptVersion: 'classify-v1',
      relevant: false,
    },
    createdAt: '2026-08-31T12:00:00.000Z',
    updatedAt: '2026-08-31T12:00:00.000Z',
  },
]

function toListItem(row: FindingDetail): FindingListItem {
  return {
    id: row.id,
    title: row.title,
    impact: row.impact,
    status: row.status,
    suggestedAction: row.suggestedAction,
    justificationShort: row.justificationShort,
    client: row.client,
    source: row.source,
    document: row.document,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

const emptyCounts = { red: 0, orange: 0, yellow: 0, green: 0 }

export const findingsMockApi = {
  async progress(): Promise<FindingsProgress> {
    await delay()
    return {
      date: '2026-09-02',
      sources: [
        {
          sourceId: 'seed-src-dof',
          sourceName: 'Diario Oficial de la Federación',
          status: 'classified',
          label: 'Analizada',
          counts: { red: 0, orange: 0, yellow: 0, green: 75 },
          note: null,
        },
        {
          sourceId: 'seed-src-diputados-gaceta',
          sourceName: 'Gaceta Parlamentaria - Cámara de Diputados',
          status: 'classified',
          label: 'Analizada',
          counts: { red: 0, orange: 0, yellow: 0, green: 5 },
          note: null,
        },
        {
          sourceId: 'cmsyzf8yw000l2rgk96zm07vf',
          sourceName: 'Congreso de Jalisco',
          status: 'skipped',
          label: 'Sin análisis',
          counts: emptyCounts,
          note: 'La fuente no tiene clientes vinculados; no hay hallazgos.',
        },
        {
          sourceId: 'cmsyzf83c00092rgksxb948h2',
          sourceName: 'Congreso de Baja California Sur',
          status: 'classifying',
          label: 'Analizando',
          counts: { red: 0, orange: 1, yellow: 0, green: 4 },
          note: 'Hay hallazgos. Sigue el análisis de otras páginas.',
        },
        {
          sourceId: 'cmsyzf80l00082rgk20mun617',
          sourceName: 'Congreso de Baja California',
          status: 'pending',
          label: 'Sin análisis aún',
          counts: emptyCounts,
          note: null,
        },
      ],
    }
  },

  async list(params?: ListFindingsParams): Promise<FindingListItem[]> {
    await delay()
    let next = rows.map(toListItem)
    if (params?.clientId) {
      next = next.filter((row) => row.client.id === params.clientId)
    }
    if (params?.sourceId) {
      next = next.filter((row) => row.source?.id === params.sourceId)
    }
    if (params?.impact) {
      next = next.filter((row) => row.impact === params.impact)
    }
    if (params?.status) {
      next = next.filter((row) => row.status === params.status)
    }
    const limit = params?.limit ?? 50
    return next.slice(0, limit)
  },

  async get(id: string): Promise<FindingDetail> {
    await delay()
    const row = rows.find((item) => item.id === id)
    if (!row) {
      throw new Error('Hallazgo no encontrado.')
    }
    return row
  },
}
