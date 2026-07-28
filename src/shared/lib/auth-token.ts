const STORAGE_KEY = 'norma.accessToken'

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token)
}

export function clearAccessToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
