import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  return (
    <div className="rounded-xl border border-norma-border bg-norma-surface p-8 shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-wide">NORMA</h1>
        <p className="mt-1 text-sm text-norma-muted">
          Inicia sesión para continuar
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs text-norma-muted">
            Correo
          </label>
          <input
            id="email"
            type="email"
            placeholder="usuario@norma.app"
            className="h-10 w-full rounded-md border border-norma-border bg-norma-bg px-3 text-sm outline-none focus:border-norma-accent"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs text-norma-muted">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-10 w-full rounded-md border border-norma-border bg-norma-bg px-3 text-sm outline-none focus:border-norma-accent"
          />
        </div>
        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-norma-muted">
        Auth con Supabase pendiente —{' '}
        <Link to="/dashboard" className="text-norma-accent hover:underline">
          ir al dashboard
        </Link>
      </p>
    </div>
  )
}
