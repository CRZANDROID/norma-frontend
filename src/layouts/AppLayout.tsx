import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  LayoutDashboard,
  LogOut,
  Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alertas', label: 'Alertas', icon: Bell },
  { to: '/clientes', label: 'Clientes', icon: Building2 },
  { to: '/fuentes', label: 'Fuentes', icon: Radio },
]

export function AppLayout() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const clear = useAuthStore((s) => s.clear)

  async function handleLogout() {
    await supabase.auth.signOut()
    clear()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-norma-bg text-norma-fg">
      <aside className="flex w-60 flex-col border-r border-norma-border bg-norma-surface">
        <div className="border-b border-norma-border px-5 py-5">
          <p className="text-lg font-semibold tracking-wide">NORMA</p>
          <p className="text-xs text-norma-muted">Panel operativo</p>
          {profile ? (
            <p className="mt-2 truncate text-xs text-norma-muted">
              {profile.name} · {profile.role}
            </p>
          ) : null}
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
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => void handleLogout()}
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
