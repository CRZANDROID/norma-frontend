import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Bell,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Radio,
  Users,
  X,
} from 'lucide-react'
import {
  duration,
  easeOut,
  pageTransition,
  sectionKeyFromPath,
} from '@/shared/lib/motion'
import { APP_VERSION } from '@/shared/lib/app-version'
import { cn } from '@/shared/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/shared/ui/button'
import { NormaMark } from '@/shared/ui/norma-mark'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alertas', label: 'Alertas', icon: Bell },
  { to: '/clientes', label: 'Clientes', icon: Building2 },
  { to: '/fuentes', label: 'Fuentes', icon: Radio },
  { to: '/usuarios', label: 'Usuarios', icon: Users },
]

const navFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-norma-surface'

function SidebarChrome({
  onLogout,
  onNavigate,
}: {
  onLogout: () => void
  onNavigate?: () => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <>
      <nav
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-3"
        aria-label="Principal"
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-norma-muted transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-norma-accent/8 hover:text-norma-fg',
                navFocus,
                isActive && 'text-norma-accent',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <motion.span
                    layoutId={reduceMotion ? undefined : 'nav-section-pill'}
                    className="absolute inset-0 rounded-2xl border-2 border-norma-accent/25 bg-norma-accent/10"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 34,
                      mass: 0.7,
                    }}
                  />
                ) : null}
                <motion.span
                  className="relative inline-flex"
                  animate={
                    reduceMotion
                      ? undefined
                      : isActive
                        ? { scale: 1.06 }
                        : { scale: 1 }
                  }
                  transition={{ duration: duration.fast, ease: easeOut }}
                >
                  <Icon className="size-4" aria-hidden />
                </motion.span>
                <span className="relative">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t-2 border-norma-border">
        <div className="border-b border-norma-border/70 bg-norma-raised/50 px-4 py-2.5">
          <p className="flex items-center justify-between gap-2 text-[10px] leading-none text-norma-subtle">
            <span className="font-medium uppercase tracking-[0.16em]">
              Versión
            </span>
            <span
              className="font-mono text-[11px] tabular-nums tracking-wide text-norma-muted"
              translate="no"
            >
              {APP_VERSION}
            </span>
          </p>
        </div>
        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onLogout}
          >
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </>
  )
}

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const profile = useAuthStore((s) => s.profile)
  const clear = useAuthStore((s) => s.clear)
  const reduceMotion = useReducedMotion()
  const [mobileOpen, setMobileOpen] = useState(false)
  const sectionKey = sectionKeyFromPath(location.pathname)

  function handleLogout() {
    clear()
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative flex h-dvh overflow-hidden bg-norma-bg text-norma-fg">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-2xl focus:bg-norma-surface focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-norma-fg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-norma-accent focus:ring-offset-2 focus:ring-offset-norma-bg"
      >
        Saltar al contenido
      </a>
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-[-10%] h-[420px] w-[420px] rounded-full bg-norma-accent/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-10%] right-[-5%] h-[380px] w-[380px] rounded-full bg-norma-signal/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(13,27,42,0.07)_1px,transparent_0)] bg-[size:22px_22px] opacity-50"
      />

      <aside className="relative z-10 hidden h-dvh w-[248px] shrink-0 flex-col border-r-2 border-norma-border bg-norma-surface/95 backdrop-blur-md md:flex">
        <div className="shrink-0 border-b-2 border-norma-border px-5 py-6">
          <div className="flex items-center gap-3">
            <NormaMark />
            <div>
              <p
                className="font-display text-base font-semibold tracking-[0.12em]"
                translate="no"
              >
                NORMA
              </p>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-norma-muted">
                Inteligencia regulatoria
              </p>
            </div>
          </div>
        </div>
        <SidebarChrome onLogout={() => void handleLogout()} />
      </aside>

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b-2 border-norma-border bg-norma-surface/95 px-4 py-3 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="size-4" aria-hidden />
              ) : (
                <Menu className="size-4" aria-hidden />
              )}
            </Button>
            <div className="flex items-center gap-2.5 md:hidden">
              <NormaMark className="size-9 rounded-xl" />
              <p
                className="font-display text-sm font-semibold tracking-[0.12em]"
                translate="no"
              >
                NORMA
              </p>
            </div>
          </div>
          <div className="rounded-2xl border-2 border-norma-border bg-norma-raised px-3 py-1.5 text-right">
            <p className="truncate text-xs font-medium text-norma-fg">
              {profile?.name ?? 'Diseño preview'}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-norma-accent">
              {profile?.role ?? 'ADMIN'}
            </p>
          </div>
        </header>

        <AnimatePresence initial={false}>
          {mobileOpen ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: duration.ui, ease: easeOut }}
              className="flex max-h-[min(70dvh,28rem)] flex-col border-b-2 border-norma-border bg-norma-surface md:hidden"
            >
              <SidebarChrome
                onLogout={() => void handleLogout()}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main
          id="contenido-principal"
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-auto p-4 md:p-8"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={sectionKey}
              initial={reduceMotion ? false : pageTransition.initial}
              animate={pageTransition.animate}
              exit={reduceMotion ? undefined : pageTransition.exit}
              transition={{ duration: duration.page, ease: easeOut }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
