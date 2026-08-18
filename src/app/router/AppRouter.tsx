import { lazy, Suspense, type ReactNode } from 'react'
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from '@/app/layouts/AppLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { LoginPage } from '@/features/auth'
import { DashboardPage } from '@/pages/DashboardPage'
import { AlertsPage } from '@/pages/AlertsPage'

const ClientAlertPolicyPage = lazy(() =>
  import('@/features/clients/pages/ClientAlertPolicyPage').then((m) => ({
    default: m.ClientAlertPolicyPage,
  })),
)

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

function RootShell() {
  return (
    <>
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
      <Outlet />
    </>
  )
}

function SuspensePage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

const router = createBrowserRouter([
  {
    element: <RootShell />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: '/login', element: <LoginPage /> }],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/alertas', element: <AlertsPage /> },
              {
                path: '/clientes',
                element: (
                  <SuspensePage>
                    <ClientsPage />
                  </SuspensePage>
                ),
              },
              {
                path: '/clientes/:clientId/semaforo',
                element: (
                  <SuspensePage>
                    <ClientAlertPolicyPage />
                  </SuspensePage>
                ),
              },
              {
                path: '/clientes/:clientId',
                element: (
                  <SuspensePage>
                    <ClientsPage />
                  </SuspensePage>
                ),
              },
              {
                path: '/fuentes',
                element: (
                  <SuspensePage>
                    <SourcesPage />
                  </SuspensePage>
                ),
              },
              {
                path: '/fuentes/:sourceId',
                element: (
                  <SuspensePage>
                    <SourcesPage />
                  </SuspensePage>
                ),
              },
              {
                path: '/usuarios',
                element: (
                  <SuspensePage>
                    <UsersPage />
                  </SuspensePage>
                ),
              },
              {
                path: '/usuarios/:userId',
                element: (
                  <SuspensePage>
                    <UsersPage />
                  </SuspensePage>
                ),
              },
            ],
          },
        ],
      },
      { path: '/', element: <Navigate to="/clientes" replace /> },
      { path: '*', element: <Navigate to="/clientes" replace /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
