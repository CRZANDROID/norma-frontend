export const CIVIL_TIMEZONE = 'America/Mexico_City'

const CIVIL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Día civil YYYY-MM-DD en zona del piloto. */
export function civilDateToday(at = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CIVIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at)
}

export function isCivilDate(value: string): boolean {
  if (!CIVIL_DATE_RE.test(value)) return false
  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(5, 7))
  const day = Number(value.slice(8, 10))
  const probe = new Date(Date.UTC(year, month - 1, day))
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  )
}

export function civilDateFromIso(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CIVIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function formatCivilDateLabel(date: string): string {
  if (!isCivilDate(date)) return date
  const noon = new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: CIVIL_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(noon)
}
