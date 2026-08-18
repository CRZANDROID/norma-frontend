import { CatalogAskCard } from '@/features/ai/components/CatalogAskCard'
import { JobsPanel } from '@/features/jobs/components/JobsPanel'
import { useAuthStore } from '@/store/auth-store'

function greetingForHour(hour: number) {
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role ?? 'VIEWER'
  const canCrawl = role === 'ADMIN'
  const canReadRuns = role === 'ADMIN' || role === 'ANALYST'
  const firstName = profile?.name?.split(' ')[0]
  const hello = greetingForHour(new Date().getHours())

  return (
    <div className="flex min-h-[calc(100dvh-7.5rem)] flex-col">
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-accent">
          Sala de monitoreo
        </p>
        <h1 className="mt-1 font-display text-[2rem] font-semibold tracking-tight text-balance md:text-[2.35rem]">
          {firstName ? `${hello}, ${firstName}` : hello}
        </h1>
        <p className="mt-1.5 max-w-xl text-pretty text-sm leading-relaxed text-norma-muted">
          Pregúntale a NORMA por el catálogo. El pulso del rastreo queda al
          lado.
        </p>
      </div>
      <div className="grid min-h-0 flex-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.85fr)]">
        <CatalogAskCard />
        <JobsPanel canCrawl={canCrawl} canReadRuns={canReadRuns} />
      </div>
    </div>
  )
}
