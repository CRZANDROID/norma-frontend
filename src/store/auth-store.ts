import {
  clearAccessToken,
  getAccessToken,
  setAccessToken as persistAccessToken,
} from '@/shared/lib/auth-token'
import { create } from 'zustand'

export type NormaMembership = {
  clientId: string
  clientName: string
  clientSlug: string
  role: string
}

export type NormaProfile = {
  id: string
  email: string
  name: string
  role: string
  memberships: NormaMembership[]
}

type AuthState = {
  accessToken: string | null
  profile: NormaProfile | null
  loading: boolean
  setAccessToken: (token: string | null) => void
  setProfile: (profile: NormaProfile | null) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getAccessToken(),
  profile: null,
  loading: true,
  setAccessToken: (token) => {
    if (token) persistAccessToken(token)
    else clearAccessToken()
    set({ accessToken: token })
  },
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  clear: () => {
    clearAccessToken()
    set({
      accessToken: null,
      profile: null,
      loading: false,
    })
  },
}))
