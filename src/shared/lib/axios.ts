import axios from 'axios'
import { clearAccessToken, getAccessToken } from '@/shared/lib/auth-token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? ''
      const isLogin = url.includes('/auth/login')
      if (!isLogin && getAccessToken()) {
        clearAccessToken()
        // Lazy import to avoid circular init with the store.
        void import('@/store/auth-store').then(({ useAuthStore }) => {
          useAuthStore.getState().clear()
        })
      }
    }
    return Promise.reject(error)
  },
)
