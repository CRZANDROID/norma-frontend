import type {
  CreateReportBody,
  ListReportsParams,
  ReportDetail,
  ReportsListPage,
} from '@/features/reports/types/report'

const MOCK_REPORT: ReportDetail = {
  id: 'mock-report',
  status: 'draft',
  client: {
    id: 'client_arca',
    name: 'Arca Continental',
    slug: 'arca-continental',
    legalName: null,
  },
  dateFrom: null,
  dateTo: null,
  findingCount: 1,
  counts: { red: 1, orange: 0, yellow: 0 },
  fileUrl: '/reports/mock-report/file',
  generatedAt: new Date().toISOString(),
  generatedBy: { id: 'mock-user', name: 'Admin NORMA' },
  email: null,
  findings: [
    {
      id: 'mock-finding',
      title: 'Mock',
      impact: 'RED',
      suggestedAction: 'Alertar de inmediato',
      justification: 'Hallazgo de prueba.',
      source: null,
      document: null,
      changeNote: null,
      createdAt: new Date().toISOString(),
    },
  ],
}

export const reportsMockApi = {
  create(body: CreateReportBody): Promise<ReportDetail> {
    if (body.contactIds && body.contactIds.length > 0) {
      return Promise.resolve({
        ...MOCK_REPORT,
        status: 'sent',
        email: {
          sent: true,
          reason: 'sent',
          message: `Correo enviado a ${body.contactIds.length} contactos.`,
          recipients: [],
        },
      })
    }
    return Promise.resolve(MOCK_REPORT)
  },
  list(params?: ListReportsParams): Promise<ReportsListPage> {
    const items =
      params?.status && params.status !== MOCK_REPORT.status ? [] : [MOCK_REPORT]
    return Promise.resolve({
      page: 1,
      limit: params?.limit ?? 50,
      total: items.length,
      totalPages: 1,
      items,
    })
  },
  get(id: string): Promise<ReportDetail> {
    return Promise.resolve({ ...MOCK_REPORT, id })
  },
  regenerate(id: string): Promise<ReportDetail> {
    return Promise.resolve({ ...MOCK_REPORT, id })
  },
  send(id: string, contactIds: string[] = []): Promise<ReportDetail> {
    if (contactIds.length === 0) {
      return Promise.resolve({
        ...MOCK_REPORT,
        id,
        status: 'draft',
        email: {
          sent: false,
          reason: 'no_recipients',
          message:
            'Elige al menos un contacto. No se envió el correo. El informe sigue en borrador.',
          recipients: [],
        },
      })
    }
    return Promise.resolve({
      ...MOCK_REPORT,
      id,
      status: 'draft',
      email: {
        sent: false,
        reason: 'missing_api_key',
        message:
          'Falta RESEND_API_KEY. No se envió el correo. El informe sigue en borrador.',
        recipients: [],
      },
    })
  },
  discard(id: string): Promise<ReportDetail> {
    return Promise.resolve({ ...MOCK_REPORT, id, status: 'discarded' })
  },
  file(): Promise<{ blob: Blob; filename: string }> {
    return Promise.resolve({
      blob: new Blob(['%PDF-mock'], { type: 'application/pdf' }),
      filename: 'NORMA-mock.pdf',
    })
  },
}
