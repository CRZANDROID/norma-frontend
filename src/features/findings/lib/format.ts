export function formatFindingWhen(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function latestCreatedAt(rows: { createdAt: string }[]): string | null {
  let latest = 0
  let raw: string | null = null
  for (const row of rows) {
    const time = Date.parse(row.createdAt)
    if (Number.isNaN(time) || time < latest) continue
    latest = time
    raw = row.createdAt
  }
  return raw
}

export function countLabel(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`
}
