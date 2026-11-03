export function formatReportPeriod(
  dateFrom: string | null,
  dateTo: string | null,
): string {
  if (!dateFrom && !dateTo) return 'Toda la lista'
  if (dateFrom && dateTo && dateFrom === dateTo) return dateFrom
  if (dateFrom && dateTo) return `${dateFrom} — ${dateTo}`
  if (dateFrom) return `Desde ${dateFrom}`
  return `Hasta ${dateTo}`
}

export function formatReportMark(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function reportStatusLabel(status: string): string {
  if (status === 'sent') return 'Enviado'
  if (status === 'discarded') return 'Descartado'
  return 'Borrador'
}
