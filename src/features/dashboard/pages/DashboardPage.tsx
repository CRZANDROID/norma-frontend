import { useCallback, useState } from 'react'
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from 'motion/react'
import { CatalogAskCard } from '@/features/ai'
import { AgentWatch } from '@/features/dashboard/components/AgentWatch'
import { useAgentWatch } from '@/features/dashboard/hooks/useAgentWatch'
import {
  catalogChatCover,
  catalogChatCoverReduced,
  dashboardCoverLayout,
} from '@/shared/lib/motion'
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
  const [detailOpen, setDetailOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const onDetailChange = useCallback((id: string | null) => {
    setDetailOpen(Boolean(id))
  }, [])

  return (
    <LayoutGroup>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-accent">
            Sala de agentes
          </p>
          <h1 className="mt-1 font-display text-[2rem] font-semibold tracking-tight text-balance md:text-[2.35rem]">
            {firstName ? `${hello}, ${firstName}` : hello}
          </h1>
          <p className="mt-1.5 max-w-xl text-pretty text-sm leading-relaxed text-norma-muted">
            Sigue el rastreo por fuente. Entra a cada una para ver los PDF, Word
            y HTML extraídos. A un lado, el chat del catálogo.
          </p>
        </div>

        <div className="relative flex flex-col items-stretch gap-4 overflow-hidden xl:flex-row">
          <motion.div
            layout={!reduceMotion}
            className="relative z-10 min-w-0 flex-1 will-change-transform"
            style={{ originX: 0 }}
            transition={dashboardCoverLayout}
          >
            <motion.div
              layout={reduceMotion ? false : 'position'}
              className="h-full min-h-0"
              transition={dashboardCoverLayout}
            >
              <AgentWatch
                canRead={canRead}
                canCrawl={canCrawl}
                journeys={watch.journeys}
                pagesBySource={watch.pagesBySource}
                date={watch.date}
                crawledCount={watch.crawledCount}
                extractCount={watch.extractCount}
                pageCount={watch.pageCount}
                live={watch.live}
                crawlError={watch.crawlError}
                extractError={watch.extractError}
                pagesError={watch.pagesError}
                loading={watch.loading}
                pagesLoading={watch.pagesLoading}
                crawling={watch.crawling}
                onRetry={() => void watch.load()}
                onCrawl={() => void watch.crawlAll()}
                onDetailChange={onDetailChange}
              />
            </motion.div>
          </motion.div>

          <AnimatePresence initial={false} mode="popLayout">
            {detailOpen ? null : (
              <motion.div
                key="catalog-chat"
                className="relative z-0 w-full shrink-0 will-change-transform xl:w-[min(26rem,32%)]"
                variants={
                  reduceMotion ? catalogChatCoverReduced : catalogChatCover
                }
                initial={false}
                animate="animate"
                exit="exit"
              >
                <CatalogAskCard className="h-[min(calc(100dvh-13rem),52rem)] min-h-[28rem]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </LayoutGroup>
  )
}
