import { api } from '@/shared/lib/axios'
import type { NormaProfile } from '@/store/auth-store'

export type LoginResponse = {
  accessToken: string
  user: NormaProfile
}

export async function login(input: {
  email: string
  password: string
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', input)
  return data
}

export async function fetchMe(): Promise<NormaProfile> {
  const { data } = await api.get<NormaProfile>('/auth/me')
  return data
}
