import type { NormaProfile } from '@/store/auth-store'

/** Perfil local para `VITE_DESIGN_PREVIEW` / `VITE_USE_API_MOCK` (sin Nest). */
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
