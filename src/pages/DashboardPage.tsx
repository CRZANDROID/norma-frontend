import { CatalogAskCard } from '@/features/ai/components/CatalogAskCard'
import { JobsPanel } from '@/features/jobs/components/JobsPanel'
import { PageHeader } from '@/shared/ui/page'
import { useAuthStore } from '@/store/auth-store'
import { Badge } from '@/shared/ui/badge'

export function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role ?? 'VIEWER'
  const canCrawl = role === 'ADMIN'
  const canReadRuns = role === 'ADMIN' || role === 'ANALYST'

  return (
    <div>
      <PageHeader
        eyebrow="Operación"
        title="Dashboard"
        description="Consulta el catálogo y, si Redis está arriba, dispara un rastreo de prueba."
      />
      <div className="mb-6 rounded-3xl border-2 border-norma-border bg-norma-surface p-6 shadow-[0_12px_32px_-18px_rgba(13,27,42,0.3)]">
        <p className="text-sm text-norma-muted">Sesión actual</p>
        <p className="mt-2 font-display text-xl font-semibold">
          {profile?.name ?? '—'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="accent">{profile?.role ?? '—'}</Badge>
          <Badge variant="signal">{profile?.email ?? '—'}</Badge>
        </div>
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-2">
        <CatalogAskCard />
        <JobsPanel canCrawl={canCrawl} canReadRuns={canReadRuns} />
      </div>
    </div>
  )
}
