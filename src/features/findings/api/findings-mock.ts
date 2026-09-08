import { AxiosError } from 'axios'
import { civilDateFromIso, civilDateToday } from '@/features/findings/lib/civil-date'
import {
  shortJustification,
  toFindingListItem,
} from '@/features/findings/lib/finding-row'
import { canExcludeFromReport } from '@/features/findings/lib/impact'
import type {
  FindingDetail,
  FindingRewriteResult,
  FindingsListPage,
  FindingsProgress,
  ListFindingsParams,
  PatchFindingBody,
} from '@/features/findings/types/finding'
import { FINDING_IMPACTS } from '@/features/findings/types/finding'

function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function unprocessable(message: string): never {
  throw new AxiosError(message, AxiosError.ERR_BAD_REQUEST, undefined, undefined, {
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: {} as never,
    data: { message },
  })
}

const now = '2026-09-07T18:00:00.000Z'

const rows: FindingDetail[] = [
  {
    id: 'finding_orange_etiquetado',
    title: 'Etiquetado y vigilancia sanitaria',
    impact: 'ORANGE',
    status: 'OPEN',
    suggestedAction: 'Elaborar nota y monitorear avance',
    excludedFromNextReport: false,
    justificationShort:
      'El decreto toca etiquetado de bebidas, alineado al perfil de Arca Continental.',
    justification:
      '## NOM-051\n\nEl decreto toca etiquetado de bebidas, alineado al perfil de Arca Continental.\n\n- Conviene elaborar una nota\n- Dar seguimiento al calendario de entrada en vigor',
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
      promptVersion: 'classify-v2',
      relevant: true,
      lastRewrite: null,
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
    excludedFromNextReport: false,
    justificationShort:
      'La iniciativa modifica el tratamiento fiscal de bebidas azucaradas en el ámbito federal.',
    justification:
      '## Impuesto especial\n\nLa iniciativa modifica el tratamiento fiscal de bebidas azucaradas en el ámbito federal. El impacto es alto para el portafolio del cliente; conviene una nota ejecutiva.',
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
      promptVersion: 'classify-v2',
      relevant: true,
      lastRewrite: null,
    },
    createdAt: '2026-09-07T16:40:00.000Z',
    updatedAt: '2026-09-07T16:40:00.000Z',
  },
  {
    id: 'finding_green_contexto',
    title: 'Aviso de consulta pública sin cambio operativo',
    impact: 'GREEN',
    status: 'OPEN',
    suggestedAction: 'Registrar como contexto',
    excludedFromNextReport: false,
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
      promptVersion: 'classify-v2',
      relevant: false,
      lastRewrite: null,
    },
    createdAt: '2026-09-02T12:00:00.000Z',
    updatedAt: '2026-09-02T12:00:00.000Z',
  },
]

const emptyCounts = { red: 0, orange: 0, yellow: 0, green: 0 }

function requireRow(id: string): FindingDetail {
  const row = rows.find((item) => item.id === id)
  if (!row) {
    throw new Error('Hallazgo no encontrado.')
  }
  return row
}

function stamp(row: FindingDetail) {
  row.updatedAt = new Date().toISOString()
}

function clone(row: FindingDetail): FindingDetail {
  return {
    ...row,
    client: { ...row.client },
    source: row.source ? { ...row.source } : null,
    document: { ...row.document },
    aiMeta: row.aiMeta
      ? {
          ...row.aiMeta,
          lastRewrite: row.aiMeta.lastRewrite
            ? { ...row.aiMeta.lastRewrite }
            : null,
        }
      : null,
  }
}

export const findingsMockApi = {
  async progress(params?: { date?: string }): Promise<FindingsProgress> {
    await delay()
    const date = params?.date && params.date !== 'all' ? params.date : civilDateToday()
    const dayRows = rows.filter((row) => civilDateFromIso(row.createdAt) === date)
    const bySource = new Map<
      string,
      { name: string; red: number; orange: number; yellow: number; green: number }
    >()
    for (const row of dayRows) {
      const sourceId = row.source?.id
      if (!sourceId || !row.source) continue
      const bucket =
        bySource.get(sourceId) ?? {
          name: row.source.name,
          red: 0,
          orange: 0,
          yellow: 0,
          green: 0,
        }
      if (row.impact === 'RED') bucket.red += 1
      if (row.impact === 'ORANGE') bucket.orange += 1
      if (row.impact === 'YELLOW') bucket.yellow += 1
      if (row.impact === 'GREEN') bucket.green += 1
      bySource.set(sourceId, bucket)
    }
    const fromFindings = [...bySource.entries()].map(([sourceId, bucket]) => ({
      sourceId,
      sourceName: bucket.name,
      status: 'classified',
      label: 'Analizada',
      counts: {
        red: bucket.red,
        orange: bucket.orange,
        yellow: bucket.yellow,
        green: bucket.green,
      },
      note: null,
    }))
    return {
      date,
      sources: [
        ...fromFindings,
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

  async list(params?: ListFindingsParams): Promise<FindingsListPage> {
    await delay()
    let scoped = rows.map(toFindingListItem)
    if (params?.clientId) {
      scoped = scoped.filter((row) => row.client.id === params.clientId)
    }
    if (params?.sourceId) {
      scoped = scoped.filter((row) => row.source?.id === params.sourceId)
    }
    if (params?.status) {
      scoped = scoped.filter((row) => row.status === params.status)
    }
    if (params?.dateFrom) {
      scoped = scoped.filter(
        (row) => civilDateFromIso(row.createdAt) >= params.dateFrom!,
      )
    }
    if (params?.dateTo) {
      scoped = scoped.filter(
        (row) => civilDateFromIso(row.createdAt) <= params.dateTo!,
      )
    }
    const counts = {
      total: scoped.length,
      red: scoped.filter((row) => row.impact === 'RED').length,
      orange: scoped.filter((row) => row.impact === 'ORANGE').length,
      yellow: scoped.filter((row) => row.impact === 'YELLOW').length,
      green: scoped.filter((row) => row.impact === 'GREEN').length,
    }
    let next = scoped
    if (params?.impact) {
      next = next.filter((row) => row.impact === params.impact)
    }
    if (params?.excluded === true) {
      next = next.filter((row) => row.excludedFromNextReport)
    } else if (params?.excluded === false) {
      next = next.filter((row) => !row.excludedFromNextReport)
    }
    const limit = params?.limit ?? 50
    const page = Math.max(1, params?.page ?? 1)
    const total = next.length
    const totalPages = Math.max(1, Math.ceil(total / limit) || 1)
    const start = (page - 1) * limit
    const slice = next.slice(start, start + limit)
    return {
      dateFrom: params?.dateFrom ?? null,
      dateTo: params?.dateTo ?? null,
      page,
      limit,
      total,
      totalPages,
      counts,
      items: slice,
    }
  },

  async get(id: string): Promise<FindingDetail> {
    await delay()
    return clone(requireRow(id))
  },

  async patch(id: string, body: PatchFindingBody): Promise<FindingDetail> {
    await delay()
    const title = body.title?.trim()
    const justification = body.justification
    const impact = body.impact
    if (!title && justification == null && impact == null) {
      throw new Error('El body no puede estar vacío.')
    }
    const row = requireRow(id)
    if (title !== undefined) {
      if (!title || title.length > 160) {
        throw new Error('El título debe tener entre 1 y 160 caracteres.')
      }
      row.title = title
    }
    if (justification !== undefined) {
      const text = justification.trim()
      if (!text || justification.length > 20_000) {
        throw new Error('La justificación debe tener entre 1 y 20000 caracteres.')
      }
      row.justification = justification
      row.justificationShort = shortJustification(text)
    }
    if (impact !== undefined) {
      if (!FINDING_IMPACTS.includes(impact)) {
        throw new Error('Impacto inválido.')
      }
      row.impact = impact
      if (impact === 'GREEN') {
        row.excludedFromNextReport = false
      }
    }
    stamp(row)
    return clone(row)
  },

  async exclude(id: string): Promise<FindingDetail> {
    await delay()
    const row = requireRow(id)
    if (!canExcludeFromReport(row.impact)) {
      throw new Error(
        'Los hallazgos informativos (GREEN) no entran al informe.',
      )
    }
    row.excludedFromNextReport = true
    stamp(row)
    return clone(row)
  },

  async include(id: string): Promise<FindingDetail> {
    await delay()
    const row = requireRow(id)
    row.excludedFromNextReport = false
    stamp(row)
    return clone(row)
  },

  async rewrite(id: string, prompt: string): Promise<FindingRewriteResult> {
    await delay(900)
    const instruction = prompt.trim()
    if (!instruction || instruction.length > 2000) {
      throw new Error('El prompt debe tener entre 1 y 2000 caracteres.')
    }
    const row = requireRow(id)
    const idle = /^(ok|okay|okey|gracias|thanks|thx|[¿?]+)\.?$/i.test(
      instruction,
    )
    const asksImpact =
      /sem[aá]foro|reclasific|impacto|el color/i.test(instruction)
    if (idle) {
      unprocessable(
        'Ese pedido no alcanza para reescribir el briefing. Indica qué debe cambiar.',
      )
    }
    let rewriteNote: string | null = null
    let rewriteChanged = true
    if (asksImpact) {
      rewriteNote =
        'El semáforo no se cambia por IA; usa el selector de impacto.'
      rewriteChanged = false
    } else {
      row.justification = `${row.justification.trim()}\n\n*Reescritura (mock):* ${instruction}`
      row.justificationShort = shortJustification(row.justification)
    }
    row.aiMeta = {
      model: row.aiMeta?.model ?? 'gpt-4o-mini',
      promptVersion: row.aiMeta?.promptVersion ?? 'classify-v2',
      relevant: row.aiMeta?.relevant ?? true,
      lastRewrite: {
        at: new Date().toISOString(),
        model: 'gpt-4o-mini',
        promptVersion: 'rewrite-v4',
        prompt: instruction,
        note: rewriteNote,
        changed: rewriteChanged,
      },
    }
    stamp(row)
    return {
      ...clone(row),
      rewriteNote,
      rewriteChanged,
    }
  },
}
