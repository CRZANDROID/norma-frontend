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

export function reportStatusLabel(status: string): string {
  if (status === 'sent') return 'Enviado'
  if (status === 'discarded') return 'Descartado'
  return 'Borrador'
}
