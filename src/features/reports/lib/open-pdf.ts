import { reportsApi } from '@/features/reports/api/reports-api'

export async function openReportPdf(id: string, download: boolean) {
  const file = await reportsApi.file(id, { download })
  const url = URL.createObjectURL(file.blob)
  if (download) {
    const link = document.createElement('a')
    link.href = url
    link.download = file.filename
    document.body.appendChild(link)
    link.click()
    link.remove()
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
