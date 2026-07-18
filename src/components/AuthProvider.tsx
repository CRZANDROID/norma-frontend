import { useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchMe } from '@/api/auth'
import { useAuthStore } from '@/store/auth-store'

export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession)
  const setProfile = useAuthStore((s) => s.setProfile)
  const setLoading = useAuthStore((s) => s.setLoading)
  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return

      setSession(data.session)

      if (data.session) {
        try {
          const profile = await fetchMe()
          if (mounted) setProfile(profile)
        } catch {
          if (mounted) setProfile(null)
        }
      }

      if (mounted) setLoading(false)
    }

    void bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)

      if (!session) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        const profile = await fetchMe()
        setProfile(profile)
      } catch {
        setProfile(null)
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
