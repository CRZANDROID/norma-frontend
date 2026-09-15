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
    id: 'mock-client',
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
  findings: [
    {
      id: 'mock-finding',
      title: 'Mock',
      impact: 'RED',
      suggestedAction: 'Alertar de inmediato',
      justification: 'Hallazgo de prueba.',
      source: null,
      document: null,
      createdAt: new Date().toISOString(),
    },
  ],
}

export const reportsMockApi = {
  create(_body: CreateReportBody): Promise<ReportDetail> {
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
  file(): Promise<{ blob: Blob; filename: string }> {
    return Promise.resolve({
      blob: new Blob(['%PDF-mock'], { type: 'application/pdf' }),
      filename: 'NORMA-mock.pdf',
    })
  },
}
