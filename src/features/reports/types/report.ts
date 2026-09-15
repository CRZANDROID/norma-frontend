export type ReportStatus = 'draft' | 'sent' | 'discarded'

export type ReportCounts = {
  red: number
  orange: number
  yellow: number
}

export type ReportPerson = {
  id: string
  name: string
}

export type ReportListItem = {
  id: string
  status: ReportStatus
  client: {
    id: string
    name: string
    slug: string
    legalName: string | null
  }
  dateFrom: string | null
  dateTo: string | null
  findingCount: number
  counts: ReportCounts
  fileUrl: string | null
  generatedAt: string
  generatedBy: ReportPerson | null
}

export type ReportFindingItem = {
  id: string
  title: string
  impact: string
  suggestedAction: string | null
  justification: string | null
  source: {
    id: string
    name: string
    code: string
    url: string | null
  } | null
  document: {
    id: string
    filename: string
    url: string | null
  } | null
  createdAt: string | null
}

export type ReportDetail = ReportListItem & {
  findings: ReportFindingItem[]
}

export type CreateReportBody = {
  clientId: string
  dateFrom?: string
  dateTo?: string
}

export type ListReportsParams = {
  clientId?: string
  status?: ReportStatus
  limit?: number
  page?: number
}

export type ReportsListPage = {
  page: number
  limit: number
  total: number
  totalPages: number
  items: ReportListItem[]
}
