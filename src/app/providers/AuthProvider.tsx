import { useEffect, type ReactNode } from 'react'
import { fetchMe } from '@/features/auth/api/auth-api'
import { previewProfile } from '@/features/auth/lib/preview-profile'
import { getAccessToken } from '@/shared/lib/auth-token'
import { designPreview, useApiMock } from '@/shared/lib/utils'
import { useAuthStore } from '@/store/auth-store'

export function AuthProvider({ children }: { children: ReactNode }) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const setProfile = useAuthStore((s) => s.setProfile)
  const setLoading = useAuthStore((s) => s.setLoading)
  const clear = useAuthStore((s) => s.clear)

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      if (designPreview) {
        setProfile(previewProfile)
        setLoading(false)
        return
      }

      const token = getAccessToken()
      if (!token) {
        if (mounted) setLoading(false)
        return
      }

      setAccessToken(token)

      if (useApiMock) {
        if (mounted) {
          setProfile(previewProfile)
          setLoading(false)
        }
        return
      }

      try {
        const profile = await fetchMe()
        if (mounted) setProfile(profile)
      } catch {
        if (mounted) clear()
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void bootstrap()

    return () => {
      mounted = false
    }
  }, [clear, setAccessToken, setLoading, setProfile])

  return children
}
