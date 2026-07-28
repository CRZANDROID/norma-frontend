import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { designPreview, useApiMock } from '@/shared/lib/utils'
import { useAuthStore } from '@/store/auth-store'

export function ProtectedRoute() {
  const loading = useAuthStore((s) => s.loading)
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const location = useLocation()

  // designPreview salta /login (solo diseño UI local).
  if (designPreview) {
    return <Outlet />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-norma-bg text-norma-muted">
        Cargando sesión…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // API real: hace falta perfil Nest (/auth/me). Mock: sesión local basta.
  if (!useApiMock && !profile) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
