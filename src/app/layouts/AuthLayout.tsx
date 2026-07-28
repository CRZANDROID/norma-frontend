import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-norma-bg px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-norma-accent/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-norma-signal/12 blur-3xl"
      />
      <div className="relative z-10 w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
