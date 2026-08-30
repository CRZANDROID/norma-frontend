import type {
  DocumentDetail,
  DocumentListItem,
  DocumentsProgress,
  ListDocumentsParams,
} from '@/features/documents/types/document'

function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const now = new Date().toISOString()

const rows: DocumentListItem[] = [
  {
    id: 'doc_dof_ready',
    sourceId: 'source_dof',
    sourceCode: 'dof',
    sourceName: 'Diario Oficial de la Federación',
    filename: 'page.html',
    mimeType: 'text/html',
    processingStatus: 'READY_FOR_AI',
    contentHash: 'a'.repeat(64),
    canonicalDocumentId: null,
    lastError: null,
    jobRunId: 'run_dof_ok',
    textPreview:
      'Decreto por el que se reforman disposiciones en materia de comercio exterior (mock).',
    url: 'https://www.dof.gob.mx/nota_detalle.php?codigo=1',
    createdAt: '2026-08-18T12:01:10.000Z',
    updatedAt: now,
  },
  {
    id: 'doc_diputados_dup',
    sourceId: 'source_diputados',
    sourceCode: 'diputados-gaceta',
    sourceName: 'Gaceta Diputados',
    filename: 'page.html',
    mimeType: 'text/html',
    processingStatus: 'DEDUPED',
    contentHash: 'a'.repeat(64),
    canonicalDocumentId: 'doc_dof_ready',
    lastError: null,
    jobRunId: 'run_diputados_ok',
    textPreview: 'Misma ficha que un registro anterior (mock).',
    url: 'https://gaceta.diputados.gob.mx/',
    createdAt: '2026-08-18T12:02:10.000Z',
    updatedAt: now,
  },
  {
    id: 'doc_jalisco_extracted',
    sourceId: 'source_jalisco',
    sourceCode: 'jalisco-congreso',
    sourceName: 'Congreso de Jalisco',
    filename: 'page.html',
    mimeType: 'text/html',
    processingStatus: 'EXTRACTED',
    contentHash: null,
    canonicalDocumentId: null,
    lastError: null,
    jobRunId: 'run_jalisco_ok',
    textPreview: 'Gaceta del Congreso de Jalisco con iniciativas del día (mock).',
    url: 'https://www.congresojal.gob.mx/gaceta',
    createdAt: '2026-08-18T12:03:10.000Z',
    updatedAt: now,
  },
]

export const documentsMockApi = {
  async list(params?: ListDocumentsParams): Promise<DocumentListItem[]> {
    await delay()
    let next = [...rows]
    if (params?.sourceCode) {
      next = next.filter((row) => row.sourceCode === params.sourceCode)
    }
    if (params?.processingStatus) {
      next = next.filter((row) => row.processingStatus === params.processingStatus)
    }
    const limit = params?.limit ?? 20
    return next.slice(0, limit)
  },

  async get(id: string): Promise<DocumentDetail> {
    await delay()
    const row = rows.find((item) => item.id === id)
    if (!row) {
      throw new Error('Documento no encontrado')
    }
    return {
      ...row,
      extractedText: row.textPreview,
    }
  },

  async progress(): Promise<DocumentsProgress> {
    await delay()
    return {
      date: '2026-08-25',
      sources: [
        {
          sourceId: 'seed-src-dof',
          sourceName: 'Diario Oficial de la Federación',
          status: 'ready',
          label: 'Texto listo',
          headline:
            'DOF - Diario Oficial de la Federación Usuario Clave Entrar &iquest;Olvid&oacute;',
          note: null,
        },
        {
          sourceId: 'seed-src-diputados-gaceta',
          sourceName: 'Gaceta Parlamentaria - Cámara de Diputados',
          status: 'unread',
          label: 'Rastreada, sin texto usable',
          headline: null,
          note: 'La página no trajo contenido suficiente para registrar.',
        },
        {
          sourceId: 'cmsyzf8yw000l2rgk96zm07vf',
          sourceName: 'Congreso de Jalisco',
          status: 'ready',
          label: 'Texto listo',
          headline:
            'Inicio | Sitio Web del Congreso de Jalisco Pasar al contenido principal Inicio B',
          note: null,
        },
      ],
    }
  },
}
