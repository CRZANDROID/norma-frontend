import type { AlertLevel, ImpactAction } from '@/features/clients/types/client'
import { ALERT_LEVELS, ALERT_LEVEL_LABELS } from '@/features/clients/types/client'
import { cn } from '@/shared/lib/utils'

const LAMP: Record<AlertLevel, { fill: string; glow: string; ring: string }> = {
  GREEN: {
    fill: 'bg-norma-green',
    glow: 'shadow-[0_0_20px_rgba(26,148,92,0.45)]',
    ring: 'ring-norma-green/45',
  },
  YELLOW: {
    fill: 'bg-norma-amber',
    glow: 'shadow-[0_0_20px_rgba(184,134,31,0.4)]',
    ring: 'ring-norma-amber/45',
  },
  ORANGE: {
    fill: 'bg-norma-coral',
    glow: 'shadow-[0_0_20px_rgba(217,107,72,0.4)]',
    ring: 'ring-norma-coral/45',
  },
  RED: {
    fill: 'bg-norma-red',
    glow: 'shadow-[0_0_22px_rgba(201,63,70,0.5)]',
    ring: 'ring-norma-red/50',
  },
}

export function SemaphoreRail({ actions }: { actions: ImpactAction[] }) {
  const byImpact = new Map(actions.map((item) => [item.impact, item]))

  return (
    <div className="overflow-hidden rounded-3xl bg-norma-navy text-white shadow-[0_18px_40px_-24px_rgba(13,27,42,0.55)]">
      <div className="border-b border-white/10 px-5 py-4 md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-norma-accent-soft">
          Semáforo de impacto
        </p>
        <p className="mt-1 max-w-xl text-sm text-white/70">
          Qué hacer en cada color. Solo lectura; la clasificación de hallazgos
          aún no corre.
        </p>
      </div>

      <ol className="grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
        {ALERT_LEVELS.map((level) => {
          const lamp = LAMP[level]
          const action = byImpact.get(level)?.suggestedAction ?? '—'
          return (
            <li
              key={level}
              className="flex flex-col gap-4 bg-norma-navy px-5 py-6"
            >
              <span
                className={cn(
                  'grid size-12 place-items-center rounded-full bg-black/35 ring-2',
                  lamp.ring,
                  lamp.glow,
                )}
                aria-hidden
              >
                <span className={cn('size-7 rounded-full', lamp.fill)} />
              </span>
              <div>
                <p className="font-display text-lg font-semibold leading-none">
                  {ALERT_LEVEL_LABELS[level]}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  {action}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
