import { CatalogAskCard } from '@/features/ai'
import { AgentWatch } from '@/features/dashboard/components/AgentWatch'
import { useAgentWatch } from '@/features/dashboard/hooks/useAgentWatch'
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
  const canRead = role === 'ADMIN' || role === 'ANALYST'
  const firstName = profile?.name?.split(' ')[0]
  const hello = greetingForHour(new Date().getHours())
  const watch = useAgentWatch(canRead)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-accent">
          Sala de agentes
        </p>
        <h1 className="mt-1 font-display text-[2rem] font-semibold tracking-tight text-balance md:text-[2.35rem]">
          {firstName ? `${hello}, ${firstName}` : hello}
        </h1>
        <p className="mt-1.5 max-w-xl text-pretty text-sm leading-relaxed text-norma-muted">
          Sigue al agente de rastreo y luego al de extracción. A un lado, el
          chat del catálogo.
        </p>
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,26rem)]">
        <AgentWatch
          canRead={canRead}
          canCrawl={canCrawl}
          journeys={watch.journeys}
          date={watch.date}
          crawledCount={watch.crawledCount}
          extractCount={watch.extractCount}
          live={watch.live}
          crawlError={watch.crawlError}
          extractError={watch.extractError}
          loading={watch.loading}
          crawling={watch.crawling}
          onRetry={() => void watch.load()}
          onCrawl={() => void watch.crawlAll()}
        />
        <CatalogAskCard className="h-[min(78dvh,48rem)] min-h-[32rem]" />
      </div>
    </div>
  )
}
