import type { FrequencySchedule } from '@/features/sources/lib/frequency'
import {
  TIMEZONE_OPTIONS,
  WEEKDAY_OPTIONS,
} from '@/features/sources/lib/frequency'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'

export function FrequencyFields({
  idPrefix,
  value,
  disabled,
  onChange,
}: {
  idPrefix: string
  value: FrequencySchedule
  disabled?: boolean
  onChange: (next: FrequencySchedule) => void
}) {
  function toggleDay(day: number) {
    const has = value.weekdays.includes(day)
    const weekdays = has
      ? value.weekdays.filter((d) => d !== day)
      : [...value.weekdays, day]
    onChange({ ...value, weekdays: weekdays.sort((a, b) => a - b) })
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
        Horario de revisión
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-time`}>Hora</Label>
          <Input
            id={`${idPrefix}-time`}
            name="frequencyTime"
            type="time"
            required
            value={value.time}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, time: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-tz`}>Zona horaria</Label>
          <Select
            id={`${idPrefix}-tz`}
            value={value.timezone}
            disabled={disabled}
            onValueChange={(timezone) => onChange({ ...value, timezone })}
            options={TIMEZONE_OPTIONS.map((z) => ({
              value: z.value,
              label: z.label,
            }))}
          />
        </div>
      </div>
      <fieldset className="space-y-1.5">
        <legend className="text-sm font-medium text-norma-fg">
          Días hábiles
        </legend>
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
