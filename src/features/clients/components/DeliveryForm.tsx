import type {
  AlertLevel,
  DeliveryConfig,
  DeliveryLevelConfig,
} from '@/features/clients/types/client'
import {
  ALERT_LEVELS,
  ALERT_LEVEL_LABELS,
} from '@/features/clients/types/client'
import { FrequencyFields } from '@/features/sources/components/FrequencyFields'
import { pinnedSchedule } from '@/features/sources/lib/frequency'
import { cn } from '@/shared/lib/utils'
import { Label } from '@/shared/ui/label'

const LEVEL_TONE: Record<AlertLevel, string> = {
  GREEN: 'bg-norma-green/12 text-norma-green ring-norma-green/20',
  YELLOW: 'bg-amber-100 text-amber-800 ring-amber-200',
  ORANGE: 'bg-orange-100 text-orange-800 ring-orange-200',
  RED: 'bg-norma-coral/12 text-norma-coral ring-norma-coral/20',
}

const LEVEL_TOGGLES: {
  key: keyof Omit<DeliveryLevelConfig, 'suggestedAction'>
  label: string
}[] = [
  { key: 'inbox', label: 'Inbox' },
  { key: 'email', label: 'Correo' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'requiresHuman', label: 'Requiere humano' },
]

export function DeliveryForm({
  value,
  disabled,
  onChange,
}: {
  value: DeliveryConfig
  disabled?: boolean
  onChange: (next: DeliveryConfig) => void
}) {
  function patchLevel(
    level: AlertLevel,
    patch: Partial<DeliveryLevelConfig>,
  ) {
    onChange({
      ...value,
      levels: {
        ...value.levels,
        [level]: { ...value.levels[level], ...patch },
      },
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border-2 border-norma-border bg-norma-raised/40 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
          Canales
        </p>
        <div className="mt-3 flex flex-wrap gap-5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-norma-fg">
            <input
              type="checkbox"
              className="size-3.5 rounded border-norma-border accent-norma-accent"
              disabled={disabled}
              checked={value.channels.email}
              onChange={(e) =>
                onChange({
                  ...value,
                  channels: { ...value.channels, email: e.target.checked },
                })
              }
            />
            Correo
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-norma-fg">
            <input
              type="checkbox"
              className="size-3.5 rounded border-norma-border accent-norma-accent"
              disabled={disabled}
              checked={value.channels.whatsapp}
              onChange={(e) =>
                onChange({
                  ...value,
                  channels: { ...value.channels, whatsapp: e.target.checked },
                })
              }
            />
            WhatsApp
            <span className="text-[11px] text-norma-subtle">próximamente</span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border-2 border-norma-border bg-norma-raised/40 p-4">
        <FrequencyFields
          label="Días de entrega"
          value={value.schedule}
          disabled={disabled}
          onChange={(schedule) =>
            onChange({ ...value, schedule: pinnedSchedule(schedule.weekdays) })
          }
        />
      </section>

      <div className="space-y-4">
        {ALERT_LEVELS.map((level) => {
          const config = value.levels[level]
          return (
            <section
              key={level}
              className="rounded-2xl border-2 border-norma-border bg-norma-raised/40 p-4"
            >
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1',
                  LEVEL_TONE[level],
                )}
              >
                {ALERT_LEVEL_LABELS[level]}
              </span>
              <div className="mt-3 space-y-1.5">
                <Label htmlFor={`delivery-action-${level}`}>Acción sugerida</Label>
                <textarea
                  id={`delivery-action-${level}`}
                  rows={2}
                  disabled={disabled}
                  value={config.suggestedAction}
                  onChange={(e) =>
                    patchLevel(level, { suggestedAction: e.target.value })
                  }
                  className="w-full resize-y rounded-2xl border-2 border-norma-border bg-norma-surface px-3 py-2 text-sm text-norma-fg outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45 disabled:opacity-60"
                />
              </div>
              <fieldset className="mt-3">
                <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
                  Entrega por nivel
                </legend>
                <div className="mt-2 flex flex-wrap gap-4">
                  {LEVEL_TOGGLES.map((toggle) => (
                    <label
                      key={toggle.key}
                      className="flex cursor-pointer items-center gap-2 text-sm text-norma-fg"
                    >
                      <input
                        type="checkbox"
                        className="size-3.5 rounded border-norma-border accent-norma-accent"
                        disabled={disabled}
                        checked={config[toggle.key]}
                        onChange={(e) =>
                          patchLevel(level, { [toggle.key]: e.target.checked })
                        }
                      />
                      {toggle.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>
          )
        })}
      </div>
    </div>
  )
}
