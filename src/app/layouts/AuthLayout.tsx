import { Outlet } from 'react-router-dom'

/** Full-bleed shell — composition lives in the auth feature page. */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-norma-bg text-norma-fg">
      <Outlet />
    </div>
  )
}
