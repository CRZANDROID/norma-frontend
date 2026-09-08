import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { cn } from '@/shared/lib/utils'

const controlOnNavy =
  'border-white/20 bg-white/8 text-white shadow-none hover:bg-white/14 hover:text-white focus-visible:border-norma-accent-soft focus-visible:ring-white/20'

export type DateRangeFilter = {
  dateFrom: string | null
  dateTo: string | null
}

export function FindingDateFilter({
  range,
  today,
  onChange,
  className,
}: {
  range: DateRangeFilter
  today: string
  onChange: (next: DateRangeFilter) => void
  className?: string
}) {
  const hasRange = Boolean(range.dateFrom || range.dateTo)
  const isToday =
    range.dateFrom === today && range.dateTo === today

  function setFrom(value: string) {
    onChange({
      dateFrom: value || null,
      dateTo: range.dateTo,
    })
  }

  function setTo(value: string) {
    onChange({
      dateFrom: range.dateFrom,
      dateTo: value || null,
    })
  }

  return (
    <div className={cn('flex flex-wrap items-end gap-2', className)}>
      <div className="min-w-[10.5rem] flex-1 space-y-1 sm:max-w-[13rem]">
        <Label htmlFor="finding-date-from" className="text-white/50">
          Desde
        </Label>
        <Input
          id="finding-date-from"
          type="date"
          name="desde"
          max={range.dateTo || today}
          value={range.dateFrom ?? ''}
          onChange={(event) => setFrom(event.target.value)}
          className={cn(controlOnNavy, '[color-scheme:dark]')}
        />
      </div>
      <div className="min-w-[10.5rem] flex-1 space-y-1 sm:max-w-[13rem]">
        <Label htmlFor="finding-date-to" className="text-white/50">
          Hasta
        </Label>
        <Input
          id="finding-date-to"
          type="date"
          name="hasta"
          min={range.dateFrom || undefined}
          max={today}
          value={range.dateTo ?? ''}
          onChange={(event) => setTo(event.target.value)}
          className={cn(controlOnNavy, '[color-scheme:dark]')}
        />
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isToday}
        onClick={() => onChange({ dateFrom: today, dateTo: today })}
        className={cn(
          'h-10 border-white/20 bg-white/8 text-white hover:bg-white/14 hover:text-white',
          'disabled:opacity-40',
        )}
      >
        Hoy
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!hasRange}
        onClick={() => onChange({ dateFrom: null, dateTo: null })}
        className={cn(
          'h-10 border-white/20 bg-white/8 text-white hover:bg-white/14 hover:text-white',
          'disabled:opacity-40',
        )}
      >
        Toda la lista
      </Button>
    </div>
  )
}
