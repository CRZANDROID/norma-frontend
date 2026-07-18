import { PagePlaceholder } from '@/components/PagePlaceholder'
import { useAuthStore } from '@/store/auth-store'

export function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)

  return (
    <section className="space-y-4">
      <PagePlaceholder
        title="Dashboard"
        description="Resumen operativo del sistema NORMA."
      />
      {profile ? (
        <div className="rounded-lg border border-norma-border bg-norma-surface p-4 text-sm">
          <p className="font-medium">Sesión activa</p>
          <p className="mt-1 text-norma-muted">
            {profile.name} ({profile.email}) — rol {profile.role}
          </p>
          {profile.memberships.length > 0 ? (
            <p className="mt-2 text-norma-muted">
              Clientes:{' '}
              {profile.memberships.map((m) => m.clientName).join(', ')}
            </p>
          ) : (
            <p className="mt-2 text-norma-muted">
              Sin membresías de cliente aún. El perfil se crea automáticamente
              al iniciar sesión.
            </p>
          )}
        </div>
      ) : null}
    </section>
  )
}
