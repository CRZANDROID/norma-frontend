import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { sourcesApi } from '@/features/sources/api/sources-api'
import {
  CreateSourceDialog,
  SourceDataForm,
  SourceDetailHeader,
} from '@/features/sources/components/SourceForms'
import { SourceListPanel } from '@/features/sources/components/SourceListPanel'
import { useDebouncedValue } from '@/features/sources/hooks/useDebouncedValue'
import type { Source, SourceType } from '@/features/sources/types/source'
import { detailCrossfade, duration, easeOut } from '@/shared/lib/motion'
import { useAuthStore } from '@/store/auth-store'
import { EmptyState, ErrorState, PageHeader } from '@/shared/ui/page'
import { Skeleton } from '@/shared/ui/skeleton'

export function SourcesPage() {
  const navigate = useNavigate()
  const { sourceId } = useParams()
  const reduceMotion = useReducedMotion()

  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role ?? 'ADMIN'
  const canManage = role === 'ADMIN'
  const canRead =
    role === 'ADMIN' || role === 'ANALYST' || role === 'VIEWER'

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [typeFilter, setTypeFilter] = useState<SourceType | ''>('')
  const [jurisdictionFilter, setJurisdictionFilter] = useState('')
  const debouncedJurisdiction = useDebouncedValue(jurisdictionFilter, 300)

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

  const loadList = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const rows = await sourcesApi.list({
        status: includeInactive ? undefined : 'ACTIVE',
        type: typeFilter || undefined,
        jurisdiction: debouncedJurisdiction || undefined,
        q: debouncedQuery || undefined,
      })
      setSources(rows)
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'No se pudo cargar.')
    } finally {
      setListLoading(false)
    }
  }, [
    debouncedJurisdiction,
    debouncedQuery,
    includeInactive,
    typeFilter,
  ])

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
      setDetailError(err instanceof Error ? err.message : 'No se pudo cargar.')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (!listLoading && !sourceId && sources.length > 0) {
      navigate(`/fuentes/${sources[0].id}`, { replace: true })
    }
  }, [listLoading, sourceId, sources, navigate])

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
          setDetailError(
            err instanceof Error ? err.message : 'No se pudo cargar.',
          )
        }
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [sourceId])

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
        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <SourceListPanel
            sources={sources}
            selectedId={sourceId}
            loading={listLoading}
            query={query}
            includeInactive={includeInactive}
            typeFilter={typeFilter}
            jurisdictionFilter={jurisdictionFilter}
            canCreate={canManage}
            onQueryChange={setQuery}
            onIncludeInactiveChange={setIncludeInactive}
            onTypeFilterChange={setTypeFilter}
            onJurisdictionFilterChange={setJurisdictionFilter}
            onSelect={(id) => navigate(`/fuentes/${id}`)}
            onCreate={() => setCreateOpen(true)}
          />

          {/* Stable shell — do not key by sourceId (avoids remount / scroll jump). */}
          <section className="min-h-[520px] rounded-3xl border-2 border-norma-border bg-norma-surface p-5 shadow-[0_12px_32px_-18px_rgba(13,27,42,0.35)] md:p-6">
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
                    setDetail(updated)
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
