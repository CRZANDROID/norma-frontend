import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'

export type NormaProfile = {
  id: string
  authUserId: string
  email: string
  name: string
  role: string
  memberships: Array<{
    clientId: string
    clientName: string
    clientSlug: string
    role: string
  }>
}

type AuthState = {
  session: Session | null
  user: User | null
  profile: NormaProfile | null
  loading: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: NormaProfile | null) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  clear: () =>
    set({
      session: null,
      user: null,
      profile: null,
      loading: false,
    }),
}))
