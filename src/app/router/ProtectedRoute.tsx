import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { designPreview, useApiMock } from '@/shared/lib/utils'
import { useAuthStore } from '@/store/auth-store'

export function ProtectedRoute() {
  const loading = useAuthStore((s) => s.loading)
  const accessToken = useAuthStore((s) => s.accessToken)
  const profile = useAuthStore((s) => s.profile)
  const location = useLocation()

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

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!useApiMock && !profile) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
