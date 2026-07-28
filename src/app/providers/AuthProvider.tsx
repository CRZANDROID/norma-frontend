import { useEffect, type ReactNode } from 'react'
import { fetchMe } from '@/features/auth/api/auth-api'
import { bypassProfile } from '@/features/auth/lib/auth-bypass'
import { authBypass, designPreview, useApiMock } from '@/shared/lib/utils'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore, type NormaProfile } from '@/store/auth-store'

async function resolveProfile(): Promise<NormaProfile | null> {
  if (useApiMock) return bypassProfile
  return fetchMe()
}

// TEMP: con VITE_AUTH_BYPASS=true no hay bootstrap Supabase; el login setea sesión local.
// Mañana: VITE_AUTH_BYPASS=false (+ mock/preview false) restaura signIn + /auth/me.
export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession)
  const setProfile = useAuthStore((s) => s.setProfile)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      // designPreview: entra al panel sin /login. authBypass: muestra login y espera submit.
      if (designPreview) {
        setProfile(bypassProfile)
        setLoading(false)
        return
      }

      if (authBypass) {
        setLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()
      if (!mounted) return

      setSession(data.session)

      if (data.session) {
        try {
          const profile = await resolveProfile()
          if (mounted) setProfile(profile)
        } catch {
          if (!mounted) return
          setProfile(null)
          // Sesión Supabase válida pero Nest rechaza (INACTIVE / 401): cerrar.
          if (!useApiMock) {
            await supabase.auth.signOut()
            if (mounted) setSession(null)
          }
        }
      }

      if (mounted) setLoading(false)
    }

    void bootstrap()

    if (designPreview || authBypass) {
      return () => {
        mounted = false
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // LoginPage ya hidrata sesión/perfil; evitar carrera duplicada en SIGNED_IN.
      if (event === 'SIGNED_IN' && useAuthStore.getState().profile) {
        setSession(session)
        setLoading(false)
        return
      }

      setSession(session)

      if (!session) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        const profile = await resolveProfile()
        setProfile(profile)
      } catch {
        setProfile(null)
        if (!useApiMock) {
          await supabase.auth.signOut()
          setSession(null)
        }
      } finally {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setLoading, setProfile, setSession])

  return children
}
