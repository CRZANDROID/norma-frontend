import { useEffect, type ReactNode } from 'react'
import { fetchMe } from '@/api/auth'
import { designPreview, useApiMock } from '@/shared/lib/utils'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore, type NormaProfile } from '@/store/auth-store'

const mockProfile: NormaProfile = {
  id: 'preview-admin',
  authUserId: 'preview',
  email: 'admin@norma.local',
  name: 'Admin NORMA',
  role: 'ADMIN',
  memberships: [
    {
      clientId: 'client_arca',
      clientName: 'Arca Continental',
      clientSlug: 'arca-continental',
      role: 'ADMIN',
    },
  ],
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession)
  const setProfile = useAuthStore((s) => s.setProfile)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      if (designPreview) {
        setProfile(mockProfile)
        setLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()
      if (!mounted) return

      setSession(data.session)

      if (data.session) {
        try {
          if (useApiMock) {
            setProfile(mockProfile)
          } else {
            const profile = await fetchMe()
            if (mounted) setProfile(profile)
          }
        } catch {
          if (mounted) setProfile(useApiMock ? mockProfile : null)
        }
      }

      if (mounted) setLoading(false)
    }

    void bootstrap()

    if (designPreview) {
      return () => {
        mounted = false
      }
    }

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
        if (useApiMock) {
          setProfile(mockProfile)
        } else {
          const profile = await fetchMe()
          setProfile(profile)
        }
      } catch {
        setProfile(useApiMock ? mockProfile : null)
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
