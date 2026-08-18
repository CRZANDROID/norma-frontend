import { PageHeader } from '@/shared/ui/page'
import { useAuthStore } from '@/store/auth-store'
import { Badge } from '@/shared/ui/badge'

export function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)

  return (
    <div>
      <PageHeader
        eyebrow="Operación"
        title="Dashboard"
        description="Resumen del piloto. El detalle operativo vive en Clientes y, más adelante, en Alertas."
      />
      <div className="rounded-3xl border-2 border-norma-border bg-norma-surface p-6 shadow-[0_12px_32px_-18px_rgba(13,27,42,0.3)]">
        <p className="text-sm text-norma-muted">Sesión actual</p>
        <p className="mt-2 font-display text-xl font-semibold">
          {profile?.name ?? '—'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="accent">{profile?.role ?? '—'}</Badge>
          <Badge variant="signal">{profile?.email ?? '—'}</Badge>
        </div>
        <p className="mt-6 text-sm text-norma-subtle">
          Usa <span className="font-medium text-norma-fg">Clientes</span> para
          administrar clientes y perfiles del piloto.
        </p>
      </div>
    </div>
  )
}
