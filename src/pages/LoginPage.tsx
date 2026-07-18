import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from?: string }).from !== '/login'
      ? (location.state as { from: string }).from
      : '/dashboard'

  if (!loading && session) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setSubmitting(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <div className="rounded-xl border border-norma-border bg-norma-surface p-8 shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-wide">NORMA</h1>
        <p className="mt-1 text-sm text-norma-muted">
          Inicia sesión con tu cuenta de Supabase
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs text-norma-muted">
            Correo
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-10 w-full rounded-md border border-norma-border bg-norma-bg px-3 text-sm outline-none focus:border-norma-accent"
          />
        </div>

        {error ? (
          <p className="text-xs text-red-400">{error}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-norma-muted">
        ¿Sin cuenta? Créala en Supabase Auth o pide invitación al admin.{' '}
        <Link to="/dashboard" className="text-norma-accent hover:underline">
          Ir al panel (requiere sesión)
        </Link>
      </p>
    </div>
  )
}
