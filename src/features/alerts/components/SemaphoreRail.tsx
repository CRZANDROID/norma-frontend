import { motion, useReducedMotion } from 'motion/react'
import type { AlertLevel, ImpactAction } from '@/features/clients/types/client'
import { ALERT_LEVELS, ALERT_LEVEL_LABELS } from '@/features/clients/types/client'
import { duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'

const LAMP: Record<AlertLevel, { fill: string; glow: string; ring: string; panel: string }> =
  {
    GREEN: {
      fill: 'bg-norma-green',
      glow: 'shadow-[0_0_20px_rgba(26,148,92,0.45)]',
      ring: 'ring-norma-green/45',
      panel: 'text-norma-green',
    },
    YELLOW: {
      fill: 'bg-norma-amber',
      glow: 'shadow-[0_0_20px_rgba(184,134,31,0.4)]',
      ring: 'ring-norma-amber/45',
      panel: 'text-norma-amber',
    },
    ORANGE: {
      fill: 'bg-norma-coral',
      glow: 'shadow-[0_0_20px_rgba(217,107,72,0.4)]',
      ring: 'ring-norma-coral/45',
      panel: 'text-norma-coral',
    },
    RED: {
      fill: 'bg-norma-red',
      glow: 'shadow-[0_0_22px_rgba(201,63,70,0.5)]',
      ring: 'ring-norma-red/50',
      panel: 'text-norma-red',
    },
  }

export function SemaphoreRail({
  actions,
  selected,
  onSelect,
}: {
  actions: ImpactAction[]
  selected: AlertLevel
  onSelect: (level: AlertLevel) => void
}) {
  const reduceMotion = useReducedMotion()
  const byImpact = new Map(actions.map((item) => [item.impact, item]))
  const current = byImpact.get(selected)

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl bg-norma-navy text-white shadow-[0_18px_40px_-24px_rgba(13,27,42,0.55)]">
        <div className="border-b border-white/10 px-5 py-4 md:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-norma-accent-soft">
            Semáforo de impacto
          </p>
          <p className="mt-1 max-w-xl text-sm text-white/70">
            Pulsa un color para leer la acción que tiene guardada este cliente.
          </p>
        </div>

        <div
          className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4"
          role="tablist"
          aria-label="Niveles del semáforo"
        >
          {ALERT_LEVELS.map((level) => {
            const lamp = LAMP[level]
            const isOn = selected === level
            const preview = byImpact.get(level)?.suggestedAction ?? '—'
            return (
              <button
                key={level}
                type="button"
                role="tab"
                aria-selected={isOn}
                onClick={() => onSelect(level)}
                className={cn(
                  'flex flex-col items-start gap-4 px-5 py-6 text-left transition-colors',
                  'focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-norma-accent-soft/80',
                  isOn ? 'bg-white/10' : 'bg-norma-navy hover:bg-white/[0.04]',
                )}
              >
                <motion.span
                  className={cn(
                    'grid size-12 place-items-center rounded-full bg-black/35 ring-2',
                    lamp.ring,
                    isOn && lamp.glow,
                  )}
                  animate={
                    reduceMotion ? undefined : isOn ? { scale: 1.06 } : { scale: 1 }
                  }
                  transition={{ duration: duration.fast, ease: easeOut }}
                  aria-hidden
                >
                  <span
                    className={cn(
                      'size-7 rounded-full',
                      lamp.fill,
                      isOn ? 'opacity-100' : 'opacity-70',
                    )}
                  />
                </motion.span>
                <span>
                  <span className="block font-display text-lg font-semibold leading-none">
                    {ALERT_LEVEL_LABELS[level]}
                  </span>
                  <span className="mt-3 block line-clamp-2 text-sm leading-relaxed text-white/65">
                    {preview}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <section
        className="rounded-3xl border-2 border-norma-border bg-norma-surface p-5 md:p-6"
        aria-live="polite"
      >
        <p
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.16em]',
            LAMP[selected].panel,
          )}
        >
          {ALERT_LEVEL_LABELS[selected]}
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">
          Acción sugerida
        </h2>
        <p className="mt-3 text-base leading-relaxed text-norma-fg">
          {current?.suggestedAction && current.suggestedAction !== '—'
            ? current.suggestedAction
            : 'Este nivel no tiene acción guardada.'}
        </p>
      </section>
    </div>
  )
}
