import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { supabase } from '@/shared/lib/supabase'
import { duration, easeOut, fadeUp } from '@/shared/lib/motion'
import { designPreview } from '@/shared/lib/utils'
import { useAuthStore } from '@/store/auth-store'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)
  const reduceMotion = useReducedMotion()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from?: string }).from !== '/login'
      ? (location.state as { from: string }).from
      : '/clientes'

  if (designPreview || (!loading && session)) {
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
    <motion.div
      initial={reduceMotion ? false : fadeUp.initial}
      animate={fadeUp.animate}
      transition={{ duration: duration.modal, ease: easeOut }}
      className="rounded-3xl border-2 border-norma-border bg-norma-surface p-8 shadow-[0_16px_40px_-20px_rgba(13,27,42,0.35)]"
    >
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-[0.14em]">
          NORMA
        </h1>
        <p className="mt-2 text-sm text-norma-muted">
          Monitoreo regulatorio con inteligencia
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@norma.app"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error ? <p className="text-xs text-norma-red">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-norma-subtle">
        ¿Sin cuenta? Créala en Supabase Auth.{' '}
        <Link to="/clientes" className="text-norma-accent hover:underline">
          Ir al panel
        </Link>
      </p>
    </motion.div>
  )
}
