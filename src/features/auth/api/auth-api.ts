import { api } from '@/shared/lib/axios'
import type { NormaProfile } from '@/store/auth-store'

export async function fetchMe(): Promise<NormaProfile> {
  const { data } = await api.get<NormaProfile>('/auth/me')
  return data
}
