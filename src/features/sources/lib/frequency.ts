export type FrequencySchedule = {
  time: string
  weekdays: number[]
  timezone: string
}

export const DEFAULT_FREQUENCY_TIME = '07:00'
export const DEFAULT_FREQUENCY_WEEKDAYS = [1, 2, 3, 4, 5]
export const DEFAULT_FREQUENCY_TIMEZONE = 'America/Mexico_City'

export const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 7, label: 'Dom' },
] as const

export function defaultFrequencySchedule(): FrequencySchedule {
  return {
    time: DEFAULT_FREQUENCY_TIME,
    weekdays: [...DEFAULT_FREQUENCY_WEEKDAYS],
    timezone: DEFAULT_FREQUENCY_TIMEZONE,
  }
}

/** Siempre 07:00 America/Mexico_City; solo varían los días. */
export function serializeFrequency(schedule: FrequencySchedule): string {
  const days = [...schedule.weekdays].sort((a, b) => a - b).join(',')
  return `${DEFAULT_FREQUENCY_TIME}|${days}|${DEFAULT_FREQUENCY_TIMEZONE}`
}

export function parseFrequency(
  raw: string | null | undefined,
): FrequencySchedule {
  const fallback = defaultFrequencySchedule()
  if (!raw?.trim()) return fallback

  const value = raw.trim()
  if (value === 'daily') return fallback
  if (value === 'weekly') {
    return { ...fallback, weekdays: [1] }
  }

  const parts = value.split('|')
  const daysRaw = parts.length === 3 ? parts[1] : parts[0]
  const weekdays = daysRaw
    .split(',')
    .map((d) => Number(d))
    .filter((d) => d >= 1 && d <= 7)

  return {
    time: DEFAULT_FREQUENCY_TIME,
    weekdays: weekdays.length > 0 ? weekdays : fallback.weekdays,
    timezone: DEFAULT_FREQUENCY_TIMEZONE,
  }
}

export function formatFrequencyLabel(raw: string | null | undefined): string {
  if (!raw?.trim()) return ''
  const schedule = parseFrequency(raw)
  const days = schedule.weekdays
    .map((d) => WEEKDAY_OPTIONS.find((o) => o.value === d)?.label)
    .filter(Boolean)
    .join(', ')
  return `07:00 CDMX · ${days}`
}

export function frequencySchedulesEqual(
  a: FrequencySchedule,
  b: FrequencySchedule,
): boolean {
  if (a.weekdays.length !== b.weekdays.length) return false
  const left = [...a.weekdays].sort()
  const right = [...b.weekdays].sort()
  return left.every((d, i) => d === right[i])
}
