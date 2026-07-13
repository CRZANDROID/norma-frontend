import { NavLink, Outlet, Link } from 'react-router-dom'
import { Bell, Building2, LayoutDashboard, Radio, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alertas', label: 'Alertas', icon: Bell },
  { to: '/clientes', label: 'Clientes', icon: Building2 },
  { to: '/fuentes', label: 'Fuentes', icon: Radio },
]

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-norma-bg text-norma-fg">
      <aside className="flex w-60 flex-col border-r border-norma-border bg-norma-surface">
        <div className="border-b border-norma-border px-5 py-5">
          <p className="text-lg font-semibold tracking-wide">NORMA</p>
          <p className="text-xs text-norma-muted">Panel operativo</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-norma-muted transition-colors hover:bg-norma-border/50 hover:text-norma-fg',
                  isActive && 'bg-norma-border/70 text-norma-fg',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-norma-border p-3">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/login">
              <LogIn className="size-4" />
              Iniciar sesión
            </Link>
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
