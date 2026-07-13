import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-norma-bg px-4">
      <div className="w-full max-w-lg">
        <Outlet />
      </div>
    </div>
  )
}
