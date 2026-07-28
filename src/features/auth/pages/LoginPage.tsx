import { useId, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { fetchMe, login } from '@/features/auth/api/auth-api'
import { previewProfile } from '@/features/auth/lib/preview-profile'
import { mapAuthError } from '@/features/auth/lib/auth-errors'
import { duration, easeOut } from '@/shared/lib/motion'
import { designPreview, useApiMock } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { NormaMark } from '@/shared/ui/norma-mark'
import { useAuthStore } from '@/store/auth-store'

const enter = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAuthStore((s) => s.accessToken)
  const loading = useAuthStore((s) => s.loading)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const setProfile = useAuthStore((s) => s.setProfile)
  const clear = useAuthStore((s) => s.clear)
  const reduceMotion = useReducedMotion()
  const formId = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from?: string }).from !== '/login'
      ? (location.state as { from: string }).from
      : '/clientes'

  if (designPreview || (!loading && accessToken)) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      if (useApiMock) {
        setAccessToken('preview-token')
        setProfile({
          ...previewProfile,
          email: email.trim() || previewProfile.email,
        })
        navigate(from, { replace: true })
        return
      }

      const { accessToken: token, user } = await login({
        email: email.trim(),
        password,
      })

      setAccessToken(token)
      setProfile(user)

      try {
        const profile = await fetchMe()
        setProfile(profile)
      } catch {
        // Login ya trajo user; /auth/me es best-effort para memberships frescos.
      }

      navigate(from, { replace: true })
    } catch (err) {
      clear()
      setError(mapAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = Boolean(email.trim()) && Boolean(password)
  const motionOff = Boolean(reduceMotion)
  const stagger = (i: number) =>
    motionOff
      ? { duration: duration.fast, ease: easeOut }
      : { duration: duration.modal, ease: easeOut, delay: 0.04 * i }

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Atmosphere — full bleed */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-[20%] top-[-18%] h-[55vmin] w-[55vmin] rounded-full bg-norma-accent/16 blur-3xl" />
        <div className="absolute bottom-[-22%] right-[-12%] h-[50vmin] w-[50vmin] rounded-full bg-norma-signal/14 blur-3xl" />
        <div className="absolute left-[35%] top-[42%] h-[28vmin] w-[28vmin] rounded-full bg-norma-navy/[0.06] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(13,27,42,0.07)_1px,transparent_0)] bg-[size:24px_24px] opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(105,88,248,0.06)_100%)]" />
      </div>

      {/* Brand plane — hero signal */}
      <section className="relative z-10 flex flex-1 flex-col px-8 py-10 sm:px-12 sm:py-14 lg:max-w-[58%] lg:px-16 lg:py-16 xl:px-20">
        <motion.div
          initial={motionOff ? false : enter.initial}
          animate={enter.animate}
          transition={stagger(0)}
          className="flex items-center gap-3"
        >
          <NormaMark className="size-11 rounded-2xl sm:size-12" />
          <span
            className="font-display text-sm font-semibold tracking-[0.22em] text-norma-navy"
            translate="no"
          >
            NORMA
          </span>
        </motion.div>

        <div className="flex flex-1 flex-col justify-center py-12 lg:py-0">
          <motion.h1
            initial={motionOff ? false : enter.initial}
            animate={enter.animate}
            transition={stagger(1)}
            className="font-display text-[clamp(2.75rem,8vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.03em] text-norma-navy"
            translate="no"
          >
            NORMA
          </motion.h1>
          <motion.p
            initial={motionOff ? false : enter.initial}
            animate={enter.animate}
            transition={stagger(2)}
            className="mt-5 max-w-md text-base leading-relaxed text-norma-muted sm:text-lg"
          >
            Inteligencia regulatoria para equipos que necesitan claridad, no
            ruido.
          </motion.p>
        </div>
      </section>

      {/* Form plane — integrated surface, not a floating card */}
      <section className="relative z-10 flex flex-1 items-stretch lg:max-w-[42%]">
        <motion.div
          initial={motionOff ? false : { opacity: 0, x: reduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: motionOff ? duration.fast : duration.page,
            ease: easeOut,
            delay: motionOff ? 0 : 0.08,
          }}
          className="flex w-full flex-col justify-center border-t-2 border-norma-border/80 bg-norma-surface/90 px-8 py-10 backdrop-blur-md sm:px-12 sm:py-14 lg:border-t-0 lg:border-l-2 lg:px-14 lg:py-16 xl:px-16"
        >
          <div className="mx-auto w-full max-w-sm">
            <motion.div
              initial={motionOff ? false : enter.initial}
              animate={enter.animate}
              transition={stagger(4)}
            >
              <h2 className="font-display text-2xl font-semibold tracking-tight text-norma-fg">
                Iniciar sesión
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-norma-muted">
                Accede al panel con tu correo corporativo.
              </p>
            </motion.div>

            <form
              className="mt-8 space-y-5"
              onSubmit={(e) => void onSubmit(e)}
              noValidate
              aria-describedby={error ? `${formId}-error` : undefined}
            >
              <motion.div
                className="space-y-1.5"
                initial={motionOff ? false : enter.initial}
                animate={enter.animate}
                transition={stagger(5)}
              >
                <Label htmlFor={`${formId}-email`}>Correo</Label>
                <Input
                  id={`${formId}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  disabled={submitting}
                  aria-invalid={Boolean(error)}
                />
              </motion.div>

              <motion.div
                className="space-y-1.5"
                initial={motionOff ? false : enter.initial}
                animate={enter.animate}
                transition={stagger(6)}
              >
                <Label htmlFor={`${formId}-password`}>Contraseña</Label>
                <div className="relative">
                  <Input
                    id={`${formId}-password`}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    disabled={submitting}
                    className="pr-11"
                    aria-invalid={Boolean(error)}
                  />
                  <button
                    type="button"
                    className="absolute right-1.5 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-norma-muted transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-norma-raised hover:text-norma-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/40"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden />
                    ) : (
                      <Eye className="size-4" aria-hidden />
                    )}
                  </button>
                </div>
              </motion.div>

              {error ? (
                <motion.p
                  id={`${formId}-error`}
                  role="alert"
                  initial={motionOff ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.fast, ease: easeOut }}
                  className="rounded-2xl border border-norma-red/25 bg-norma-red/8 px-3 py-2.5 text-sm text-norma-red"
                >
                  {error}
                </motion.p>
              ) : null}

              <motion.div
                initial={motionOff ? false : enter.initial}
                animate={enter.animate}
                transition={stagger(7)}
              >
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting || !canSubmit}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Entrando…
                    </>
                  ) : (
                    'Iniciar sesión'
                  )}
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
