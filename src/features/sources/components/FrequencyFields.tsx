import type { SourceSchedule } from '@/features/sources/lib/frequency'
import {
  WEEKDAY_OPTIONS,
  pinnedSchedule,
} from '@/features/sources/lib/frequency'
import { cn } from '@/shared/lib/utils'

export function FrequencyFields({
  value,
  disabled,
  onChange,
  label = 'Días de rastreo',
}: {
  value: SourceSchedule
  disabled?: boolean
  onChange: (next: SourceSchedule) => void
  label?: string
}) {
  function toggleDay(day: number) {
    const has = value.weekdays.includes(day)
    const weekdays = has
      ? value.weekdays.filter((d) => d !== day)
      : [...value.weekdays, day]
    onChange(pinnedSchedule(weekdays))
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
        {label}
      </p>
      <fieldset className="space-y-1.5">
        <legend className="sr-only">{label}</legend>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAY_OPTIONS.map((day) => {
            const active = value.weekdays.includes(day.value)
            return (
              <button
                key={day.value}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => toggleDay(day.value)}
                className={cn(
                  'rounded-xl border-2 px-2.5 py-1.5 text-xs font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45',
                  active
                    ? 'border-norma-accent bg-norma-accent/12 text-norma-accent'
                    : 'border-norma-border bg-norma-surface text-norma-muted hover:text-norma-fg',
                  disabled && 'opacity-50',
                )}
              >
                {day.label}
              </button>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
