import { create } from 'zustand'

type AuthState = {
  sessionReady: boolean
  setSessionReady: (ready: boolean) => void
}

/** Estado de UI; la sesión real vendrá de Supabase Auth más adelante. */
export const useAuthStore = create<AuthState>((set) => ({
  sessionReady: false,
  setSessionReady: (ready) => set({ sessionReady: ready }),
}))
