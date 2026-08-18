import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { sourcesApi } from '@/features/sources/api/sources-api'
import {
  CreateSourceDialog,
  SourceDataForm,
  SourceDetailHeader,
} from '@/features/sources/components/SourceForms'
import { SourceListPanel } from '@/features/sources/components/SourceListPanel'
import { useDebouncedValue } from '@/features/sources/hooks/useDebouncedValue'
import type {
  Source,
  SourceCategory,
  SourcePlatform,
} from '@/features/sources/types/source'
import {
  SOURCE_CATEGORIES,
  SOURCE_PLATFORMS,
} from '@/features/sources/types/source'
import {
  FEDERAL_STATE_VALUE,
  MEXICAN_STATES,
} from '@/features/sources/lib/mexican-states'
import { detailCrossfade, duration, easeOut } from '@/shared/lib/motion'
import { mapApiError } from '@/shared/lib/api-error'
import { useAuthStore } from '@/store/auth-store'
import { EmptyState, ErrorState, PageHeader } from '@/shared/ui/page'
import { Skeleton } from '@/shared/ui/skeleton'

function parseCategoryFilter(raw: string | null): SourceCategory | '' {
  if (!raw) return ''
  return (SOURCE_CATEGORIES as string[]).includes(raw)
    ? (raw as SourceCategory)
    : ''
}

function parsePlatformFilter(raw: string | null): SourcePlatform | '' {
  if (!raw) return ''
  return (SOURCE_PLATFORMS as string[]).includes(raw)
    ? (raw as SourcePlatform)
    : ''
}

function parseStateFilter(raw: string | null): string {
  if (!raw) return ''
  if (raw === FEDERAL_STATE_VALUE) return FEDERAL_STATE_VALUE
  return MEXICAN_STATES.some((s) => s.code === raw) ? raw : ''
}

export function SourcesPage() {
  const navigate = useNavigate()
  const { sourceId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const reduceMotion = useReducedMotion()

  const query = searchParams.get('q') ?? ''
  const includeInactive = searchParams.get('inactive') === '1'
  const categoryFilter = parseCategoryFilter(searchParams.get('category'))
  const platformFilter = parsePlatformFilter(searchParams.get('platform'))
  const stateFilter = parseStateFilter(searchParams.get('state'))
  const debouncedQuery = useDebouncedValue(query, 300)

  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role ?? 'ADMIN'
  const canManage = role === 'ADMIN'
  const canRead =
    role === 'ADMIN' || role === 'ANALYST' || role === 'VIEWER'

  const [sources, setSources] = useState<Source[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [detail, setDetail] = useState<Source | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const detailRef = useRef<Source | null>(null)
  detailRef.current = detail
  const sourcesRef = useRef(sources)
  sourcesRef.current = sources

  const [createOpen, setCreateOpen] = useState(false)
  const [detailPanelHeight, setDetailPanelHeight] = useState<number | null>(
    null,
  )
  const detailPanelRef = useRef<HTMLElement>(null)

  const patchSearch = useCallback(
    (patch: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(patch)) {
            if (value === null || value === '') next.delete(key)
            else next.set(key, value)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const listQueryString = useMemo(() => {
    const qs = searchParams.toString()
    return qs ? `?${qs}` : ''
  }, [searchParams])

  const itemTo = useCallback(
    (id: string) => `/fuentes/${id}${listQueryString}`,
    [listQueryString],
  )

  const loadList = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const rows = await sourcesApi.list({
        status: includeInactive ? undefined : 'ACTIVE',
        category: categoryFilter || undefined,
        platform: platformFilter || undefined,
        jurisdiction:
          stateFilter === FEDERAL_STATE_VALUE ? 'FEDERAL' : undefined,
        stateCode:
          stateFilter && stateFilter !== FEDERAL_STATE_VALUE
            ? stateFilter
            : undefined,
        q: debouncedQuery || undefined,
      })
      setSources(rows)
    } catch (err) {
      setListError(mapApiError(err, 'No se pudo cargar la lista de fuentes.'))
    } finally {
      setListLoading(false)
    }
  }, [categoryFilter, debouncedQuery, includeInactive, platformFilter, stateFilter])

  const loadDetail = useCallback(async (id: string) => {
    setDetailError(null)
    if (detailRef.current?.id !== id) {
      const fromList = sourcesRef.current.find((s) => s.id === id)
      if (fromList) setDetail(fromList)
      else if (!detailRef.current) setDetailLoading(true)
    }
    try {
      const data = await sourcesApi.get(id)
      setDetail(data)
    } catch (err) {
      setDetail(null)
      setDetailError(mapApiError(err, 'No se pudo cargar la fuente.'))
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (!listLoading && !sourceId && sources.length > 0) {
      navigate(`/fuentes/${sources[0].id}${listQueryString}`, {
        replace: true,
      })
    }
  }, [listLoading, sourceId, sources, navigate, listQueryString])

  useEffect(() => {
    if (!sourceId) {
      setDetail(null)
      setDetailError(null)
      setDetailLoading(false)
      return
    }

    let cancelled = false

    void (async () => {
      setDetailError(null)
      if (detailRef.current?.id !== sourceId) {
        const fromList = sourcesRef.current.find((s) => s.id === sourceId)
        if (fromList) setDetail(fromList)
        else if (!detailRef.current) setDetailLoading(true)
      }
      try {
        const data = await sourcesApi.get(sourceId)
        if (!cancelled) setDetail(data)
      } catch (err) {
        if (!cancelled) {
          setDetail(null)
          setDetailError(mapApiError(err, 'No se pudo cargar la fuente.'))
        }
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [sourceId])

  useEffect(() => {
    const el = detailPanelRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    const update = () => {
      setDetailPanelHeight(el.getBoundingClientRect().height)
    }
    update()
    const observer = new ResizeObserver(() => update())
    observer.observe(el)
    return () => observer.disconnect()
  }, [detail, detailLoading, detailError, sourceId])

  const selected = useMemo(
    () => sources.find((s) => s.id === sourceId) ?? detail,
    [sources, sourceId, detail],
  )

  const showBlockingSkeleton = detailLoading && !detail
  const contentKey = detail?.id ?? sourceId ?? 'empty'

  if (!canRead) {
    return (
      <div>
        <PageHeader
          eyebrow="Administración"
          title="Fuentes"
          description="Catálogo de orígenes de información del piloto."
        />
        <ErrorState message="No tienes permiso para ver el catálogo de fuentes." />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Fuentes"
        description="Catálogo de orígenes (DOF, congresos…) que alimentarán el monitoreo."
      />

      {listError ? (
        <ErrorState message={listError} onRetry={() => void loadList()} />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <SourceListPanel
            sources={sources}
            selectedId={sourceId}
            loading={listLoading}
            query={query}
            includeInactive={includeInactive}
            categoryFilter={categoryFilter}
            platformFilter={platformFilter}
            stateFilter={stateFilter}
            canCreate={canManage}
            itemTo={itemTo}
            onQueryChange={(q) => patchSearch({ q: q || null })}
            onIncludeInactiveChange={(v) =>
              patchSearch({ inactive: v ? '1' : null })
            }
            onCategoryFilterChange={(v) =>
              patchSearch({ category: v || null })
            }
            onPlatformFilterChange={(v) =>
              patchSearch({ platform: v || null })
            }
            onStateFilterChange={(v) => patchSearch({ state: v || null })}
            onCreate={() => setCreateOpen(true)}
            maxHeight={detailPanelHeight}
          />

          {/* Stable shell — do not key by sourceId (avoids remount / scroll jump). */}
          <section
            ref={detailPanelRef}
            className="min-h-[520px] rounded-3xl border-2 border-norma-border bg-norma-surface p-5 shadow-[0_12px_32px_-18px_rgba(13,27,42,0.35)] md:p-6"
          >
            {!sourceId && !listLoading && sources.length === 0 ? (
              <EmptyState
                title="Aún no hay fuentes"
                description="Crea la primera para el catálogo del piloto."
                actionLabel={canManage ? 'Nueva fuente' : undefined}
                onAction={canManage ? () => setCreateOpen(true) : undefined}
              />
            ) : showBlockingSkeleton ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : detailError && !detail ? (
              <ErrorState
                message={detailError}
                onRetry={() => sourceId && void loadDetail(sourceId)}
              />
            ) : detail && selected ? (
              <motion.div
                key={contentKey}
                initial={reduceMotion ? false : detailCrossfade.initial}
                animate={detailCrossfade.animate}
                transition={{ duration: duration.fast, ease: easeOut }}
              >
                <SourceDetailHeader source={detail} />
                <SourceDataForm
                  source={detail}
                  canEdit={canManage}
                  onSaved={(updated) => {
                    setDetail({
                      ...updated,
                      clients: updated.clients ?? detail.clients,
                    })
                    void loadList()
                  }}
                />
              </motion.div>
            ) : (
              <p className="text-sm text-norma-muted">
                Selecciona una fuente.
              </p>
            )}
          </section>
        </div>
      )}

      <CreateSourceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(created) => {
          void loadList()
          navigate(`/fuentes/${created.id}`)
        }}
      />
    </div>
  )
}
