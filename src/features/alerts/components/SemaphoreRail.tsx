import { motion, useReducedMotion } from 'motion/react'
import type { AlertLevel } from '@/features/clients/types/client'
import { ALERT_LEVELS } from '@/features/clients/types/client'
import { LEVEL_COPY } from '@/features/alerts/lib/preview-findings'
import { duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'

const LAMP: Record<
  AlertLevel,
  { fill: string; glow: string; ring: string }
> = {
  GREEN: {
    fill: 'bg-norma-green',
    glow: 'shadow-[0_0_20px_rgba(26,148,92,0.55)]',
    ring: 'ring-norma-green/50',
  },
  YELLOW: {
    fill: 'bg-norma-amber',
    glow: 'shadow-[0_0_20px_rgba(184,134,31,0.5)]',
    ring: 'ring-norma-amber/50',
  },
  ORANGE: {
    fill: 'bg-norma-coral',
    glow: 'shadow-[0_0_20px_rgba(217,107,72,0.5)]',
    ring: 'ring-norma-coral/50',
  },
  RED: {
    fill: 'bg-norma-red',
    glow: 'shadow-[0_0_22px_rgba(201,63,70,0.6)]',
    ring: 'ring-norma-red/55',
  },
}

export function SemaphoreRail({
  counts,
  active,
  onSelect,
}: {
  counts: Record<AlertLevel, number>
  active: AlertLevel | 'ALL'
  onSelect: (level: AlertLevel | 'ALL') => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="overflow-hidden rounded-3xl bg-norma-navy text-white shadow-[0_18px_40px_-24px_rgba(13,27,42,0.55)]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-norma-accent-soft">
            Semáforo de impacto
          </p>
          <p className="mt-1 max-w-xl text-sm text-white/70">
            Cuatro lentes, una lectura. El color lo pondrán los agentes de
            clasificación; aquí se ensaya cómo se mira.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect('ALL')}
          className={cn(
            'rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent-soft/70',
            active === 'ALL'
              ? 'bg-white text-norma-navy'
              : 'bg-white/8 text-white/75 hover:bg-white/12',
          )}
        >
          Ver todos
        </button>
      </div>

      <div
        className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4"
        role="tablist"
        aria-label="Niveles del semáforo"
      >
        {ALERT_LEVELS.map((level, index) => {
          const selected = active === level
          const lamp = LAMP[level]
          const copy = LEVEL_COPY[level]
          return (
            <button
              key={level}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSelect(selected ? 'ALL' : level)}
              className={cn(
                'relative flex flex-col items-start gap-3 bg-norma-navy px-4 py-5 text-left transition-colors md:px-5 md:py-6',
                'focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-norma-accent-soft/80',
                selected ? 'bg-white/8' : 'hover:bg-white/[0.04]',
              )}
            >
              <motion.span
                className={cn(
                  'relative grid size-12 place-items-center rounded-full bg-black/35 ring-2',
                  lamp.ring,
                  selected && lamp.glow,
                )}
                animate={
                  reduceMotion
                    ? undefined
                    : selected
                      ? { scale: 1.06 }
                      : { scale: 1 }
                }
                transition={{ duration: duration.fast, ease: easeOut }}
                aria-hidden
              >
                <span
                  className={cn(
                    'size-7 rounded-full',
                    lamp.fill,
                    selected ? 'opacity-100' : 'opacity-70',
                  )}
                />
              </motion.span>
              <div>
                <p className="font-display text-lg font-semibold leading-none">
                  {copy.label}
                </p>
                <p className="mt-1 font-mono text-[11px] text-white/45">
                  {String(index + 1).padStart(2, '0')} · {copy.tempo}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/65">
                  {copy.meaning}
                </p>
                <p className="mt-3 font-display text-2xl font-semibold tabular-nums">
                  {counts[level]}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
