import type {
  AlertChannel,
  AlertLevel,
  AlertPolicy,
} from '@/features/clients/types/client'
import {
  ALERT_LEVELS,
  ALERT_LEVEL_LABELS,
} from '@/features/clients/types/client'
import { cn } from '@/shared/lib/utils'
import { Label } from '@/shared/ui/label'

const LEVEL_TONE: Record<AlertLevel, string> = {
  GREEN: 'bg-norma-green/12 text-norma-green ring-norma-green/20',
  YELLOW: 'bg-amber-100 text-amber-800 ring-amber-200',
  ORANGE: 'bg-orange-100 text-orange-800 ring-orange-200',
  RED: 'bg-norma-coral/12 text-norma-coral ring-norma-coral/20',
}

const CHANNELS: { id: AlertChannel; label: string }[] = [
  { id: 'EMAIL', label: 'Correo' },
  { id: 'WHATSAPP', label: 'WhatsApp' },
]

export function AlertPolicyForm({
  value,
  disabled,
  onChange,
}: {
  value: AlertPolicy
  disabled?: boolean
  onChange: (next: AlertPolicy) => void
}) {
  function patchLevel(
    level: AlertLevel,
    patch: Partial<AlertPolicy['levels'][AlertLevel]>,
  ) {
    onChange({
      levels: {
        ...value.levels,
        [level]: { ...value.levels[level], ...patch },
      },
    })
  }

  function toggleChannel(level: AlertLevel, channel: AlertChannel) {
    const current = value.levels[level].channels
    const has = current.includes(channel)
    const channels = has
      ? current.filter((c) => c !== channel)
      : [...current, channel]
    patchLevel(level, { channels })
  }

  return (
    <div className="space-y-4">
      {ALERT_LEVELS.map((level) => {
        const config = value.levels[level]
        return (
          <section
            key={level}
            className="rounded-2xl border-2 border-norma-border bg-norma-raised/40 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1',
                  LEVEL_TONE[level],
                )}
              >
                {ALERT_LEVEL_LABELS[level]}
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              <Label htmlFor={`alert-action-${level}`}>Acción</Label>
              <textarea
                id={`alert-action-${level}`}
                rows={2}
                disabled={disabled}
                value={config.action}
                onChange={(e) => patchLevel(level, { action: e.target.value })}
                className="w-full resize-y rounded-2xl border-2 border-norma-border bg-norma-surface px-3 py-2 text-sm text-norma-fg outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45 disabled:opacity-60"
              />
            </div>
            <fieldset className="mt-3">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
                Canales
              </legend>
              <div className="mt-2 flex flex-wrap gap-4">
                {CHANNELS.map((channel) => (
                  <label
                    key={channel.id}
                    className="flex cursor-pointer items-center gap-2 text-sm text-norma-fg"
                  >
                    <input
                      type="checkbox"
                      className="size-3.5 rounded border-norma-border accent-norma-accent"
                      disabled={disabled}
                      checked={config.channels.includes(channel.id)}
                      onChange={() => toggleChannel(level, channel.id)}
                    />
                    {channel.label}
                    {channel.id === 'WHATSAPP' ? (
                      <span className="text-[11px] text-norma-subtle">
                        (opción, sin envío)
                      </span>
                    ) : null}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
        )
      })}
    </div>
  )
}

export function cloneAlertPolicy(policy: AlertPolicy): AlertPolicy {
  return {
    levels: {
      GREEN: { ...policy.levels.GREEN, channels: [...policy.levels.GREEN.channels] },
      YELLOW: {
        ...policy.levels.YELLOW,
        channels: [...policy.levels.YELLOW.channels],
      },
      ORANGE: {
        ...policy.levels.ORANGE,
        channels: [...policy.levels.ORANGE.channels],
      },
      RED: { ...policy.levels.RED, channels: [...policy.levels.RED.channels] },
    },
  }
}

export function alertPoliciesEqual(a: AlertPolicy, b: AlertPolicy): boolean {
  return ALERT_LEVELS.every((level) => {
    const left = a.levels[level]
    const right = b.levels[level]
    if (left.action !== right.action) return false
    if (left.channels.length !== right.channels.length) return false
    const set = new Set(left.channels)
    return right.channels.every((c) => set.has(c))
  })
}
