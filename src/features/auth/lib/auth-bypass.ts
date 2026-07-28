import type { Session } from '@supabase/supabase-js'
import type { NormaProfile } from '@/store/auth-store'

/** TEMP: perfil local mientras VITE_AUTH_BYPASS=true (Supabase/DB pausado). */
export const bypassProfile: NormaProfile = {
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

/** TEMP: sesión local; no es un JWT de Supabase. */
export function createBypassSession(): Session {
  const now = Math.floor(Date.now() / 1000)
  return {
    access_token: 'bypass-token',
    refresh_token: 'bypass-refresh',
    expires_in: 86_400,
    expires_at: now + 86_400,
    token_type: 'bearer',
    user: {
      id: 'preview',
      aud: 'authenticated',
      role: 'authenticated',
      email: bypassProfile.email,
      app_metadata: { provider: 'bypass' },
      user_metadata: { name: bypassProfile.name },
      created_at: new Date().toISOString(),
    },
  } as Session
}
