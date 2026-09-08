import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'
import type { FindingListItem } from '@/features/findings/types/finding'
import { FINDING_IMPACT_LABELS } from '@/features/findings/types/finding'
import { FindingExcludedBadge } from '@/features/findings/components/FindingExcludedBadge'
import { formatFindingWhen } from '@/features/findings/lib/format'
import { IMPACT_LAMP } from '@/features/findings/lib/impact'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

const rowFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-norma-surface'

export function FindingListPanel({
  items,
  selectedId,
  loading,
  itemTo,
  hasMore = false,
  loadingMore = false,
  infiniteScroll = false,
  onLoadMore,
}: {
  items: FindingListItem[]
  selectedId?: string
  loading: boolean
  itemTo: (id: string) => string
  hasMore?: boolean
  loadingMore?: boolean
  infiniteScroll?: boolean
  onLoadMore?: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel || !infiniteScroll || !hasMore || !onLoadMore || loading)
      return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !loadingMore) {
          onLoadMore()
        }
      },
      { root, rootMargin: '160px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore, loadingMore, loading, items.length, infiniteScroll])

  return (
    <div
      ref={rootRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-5"
      aria-label="Hallazgos"
      aria-busy={loading || loadingMore}
    >
      {loading ? (
        <div
          className="space-y-2.5"
          aria-busy="true"
          aria-label="Cargando hallazgos"
        >
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : !Array.isArray(items) || items.length === 0 ? (
        <p className="text-sm leading-relaxed text-norma-subtle">
          Nada con esos filtros en esta ronda.
        </p>
      ) : (
        <div>
          <ul className="space-y-2.5">
            {items.map((item) => {
              const active = item.id === selectedId
              const lamp = IMPACT_LAMP[item.impact]
              return (
                <li key={item.id} className="[content-visibility:auto]">
                  <Link
                    to={itemTo(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative flex w-full items-stretch gap-2 overflow-hidden rounded-2xl border-2 py-3.5 pr-3 pl-4 text-left transition-[background-color,border-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
                      rowFocus,
                      active
                        ? 'border-norma-navy/30 bg-norma-raised'
                        : 'border-norma-border bg-norma-raised/80 hover:border-norma-navy/25 hover:bg-norma-raised',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute inset-y-0 left-0 w-1',
                        lamp.fill,
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            lamp.badge,
                          )}
                        >
                          <span
                            className={cn('size-1.5 rounded-full', lamp.fill)}
                            aria-hidden
                          />
                          {FINDING_IMPACT_LABELS[item.impact]}
                        </span>
                        {item.source?.code ? (
                          <span
                            className="font-mono text-[10px] uppercase tracking-wide text-norma-subtle"
                            translate="no"
                          >
                            {item.source.code}
                          </span>
                        ) : null}
                        {item.excludedFromNextReport ? (
                          <FindingExcludedBadge className="font-sans normal-case tracking-wide" />
                        ) : null}
                      </span>
                      <span className="mt-2 block font-display text-[0.95rem] font-semibold tracking-tight text-pretty">
                        {item.title}
                      </span>
                      {item.justificationShort ? (
                        <span className="mt-1.5 block line-clamp-2 text-sm leading-relaxed text-norma-muted">
                          {item.justificationShort}
                        </span>
                      ) : null}
                      <span className="mt-2 flex items-center justify-between gap-2">
                        {item.suggestedAction ? (
                          <span className="flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-norma-accent">
                            <Sparkles className="size-3 shrink-0" aria-hidden />
                            <span className="truncate">
                              {item.suggestedAction}
                            </span>
                          </span>
                        ) : (
                          <span />
                        )}
                        {item.createdAt ? (
                          <span className="shrink-0 text-[12px] text-norma-subtle">
                            {formatFindingWhen(item.createdAt)}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <ChevronRight
                      className="mt-1 size-4 shrink-0 text-norma-subtle"
                      aria-hidden
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
          {infiniteScroll && hasMore && onLoadMore ? (
            <div ref={sentinelRef} className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                disabled={loadingMore}
                onClick={onLoadMore}
              >
                {loadingMore ? 'Cargando…' : 'Cargar más'}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
