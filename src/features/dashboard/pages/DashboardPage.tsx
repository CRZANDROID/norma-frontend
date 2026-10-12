import { AgentWatch } from '@/features/dashboard/components/AgentWatch'
import { useAgentWatch } from '@/features/dashboard/hooks/useAgentWatch'
import { canOperate } from '@/shared/lib/roles'
import { useAuthStore } from '@/store/auth-store'

function greetingForHour(hour: number) {
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role ?? 'VIEWER'
  const canCrawl = canOperate(role)
  const canRead = canOperate(role)
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
      </div>

      <AgentWatch
        canRead={canRead}
        canCrawl={canCrawl}
        journeys={watch.journeys}
        pagesBySource={watch.pagesBySource}
        date={watch.date}
        crawledCount={watch.crawledCount}
        extractCount={watch.extractCount}
        analysisCount={watch.analysisCount}
        pageCount={watch.pageCount}
        live={watch.live}
        crawlError={watch.crawlError}
        extractError={watch.extractError}
        analysisError={watch.analysisError}
        pagesError={watch.pagesError}
        loading={watch.loading}
        pagesLoading={watch.pagesLoading}
        crawling={watch.crawling}
        extracting={watch.extracting}
        classifying={watch.classifying}
        onRetry={() => void watch.load()}
        onCrawl={() => void watch.crawlAll()}
        onExtract={() => void watch.extractAll()}
        onClassify={() => void watch.classifyAll()}
      />
    </div>
  )
}
