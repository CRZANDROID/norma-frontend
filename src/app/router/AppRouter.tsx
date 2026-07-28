import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from '@/app/layouts/AppLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { LoginPage } from '@/features/auth'
import { DashboardPage } from '@/pages/DashboardPage'
import { AlertsPage } from '@/pages/AlertsPage'

const ClientsPage = lazy(() =>
  import('@/features/clients/pages/ClientsPage').then((m) => ({
    default: m.ClientsPage,
  })),
)

const SourcesPage = lazy(() =>
  import('@/features/sources/pages/SourcesPage').then((m) => ({
    default: m.SourcesPage,
  })),
)

const UsersPage = lazy(() =>
  import('@/features/users/pages/UsersPage').then((m) => ({
    default: m.UsersPage,
  })),
)

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-norma-muted">
      Cargando vista…
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Toaster
        theme="light"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              'bg-norma-surface border border-norma-border text-norma-fg shadow-xl',
          },
        }}
      />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/alertas" element={<AlertsPage />} />
            <Route
              path="/clientes"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <ClientsPage />
                </Suspense>
              }
            />
            <Route
              path="/clientes/:clientId"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <ClientsPage />
                </Suspense>
              }
            />
            <Route
              path="/fuentes"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <SourcesPage />
                </Suspense>
              }
            />
            <Route
              path="/fuentes/:sourceId"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <SourcesPage />
                </Suspense>
              }
            />
            <Route
              path="/usuarios"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <UsersPage />
                </Suspense>
              }
            />
            <Route
              path="/usuarios/:userId"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <UsersPage />
                </Suspense>
              }
            />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/clientes" replace />} />
        <Route path="*" element={<Navigate to="/clientes" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
