import type { SourceSchedule } from '@/features/sources/types/source'

export type { SourceSchedule }

export const DEFAULT_SCHEDULE_TIME = '07:00'
export const DEFAULT_SCHEDULE_WEEKDAYS = [1, 2, 3, 4, 5]
export const DEFAULT_SCHEDULE_TIMEZONE = 'America/Mexico_City'

export const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 7, label: 'Dom' },
] as const

export function pinnedSchedule(weekdays?: number[]): SourceSchedule {
  const days =
    weekdays && weekdays.length > 0
      ? [...weekdays].sort((a, b) => a - b)
      : [...DEFAULT_SCHEDULE_WEEKDAYS]
  return {
    time: DEFAULT_SCHEDULE_TIME,
    timezone: DEFAULT_SCHEDULE_TIMEZONE,
    weekdays: days,
  }
}

export function defaultFrequencySchedule(): SourceSchedule {
  return pinnedSchedule()
}

export function parseSchedule(
  raw: SourceSchedule | string | null | undefined,
): SourceSchedule {
  if (!raw) return pinnedSchedule()
  if (typeof raw === 'string') {
    const value = raw.trim()
    if (value === 'daily' || !value) return pinnedSchedule()
    if (value === 'weekly') return pinnedSchedule([1])
    const parts = value.split('|')
    const daysRaw = parts.length === 3 ? parts[1] : parts[0]
    const weekdays = daysRaw
      .split(',')
      .map((d) => Number(d))
      .filter((d) => d >= 1 && d <= 7)
    return pinnedSchedule(weekdays)
  }
  return pinnedSchedule(raw.weekdays)
}

export function formatScheduleLabel(
  raw: SourceSchedule | string | null | undefined,
): string {
  const schedule = parseSchedule(raw)
  return schedule.weekdays
    .map((d) => WEEKDAY_OPTIONS.find((o) => o.value === d)?.label)
    .filter(Boolean)
    .join(', ')
}

export function frequencySchedulesEqual(
  a: SourceSchedule,
  b: SourceSchedule,
): boolean {
  if (a.weekdays.length !== b.weekdays.length) return false
  const left = [...a.weekdays].sort()
  const right = [...b.weekdays].sort()
  return left.every((d, i) => d === right[i])
}
