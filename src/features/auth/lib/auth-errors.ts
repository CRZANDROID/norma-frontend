import axios from 'axios'

/** Mensajes claros en español para errores de login / perfil. */
export function mapAuthError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const rawMessage = (
      error.response?.data as { message?: string | string[] } | undefined
    )?.message
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(' ').toLowerCase()
      : String(rawMessage ?? '').toLowerCase()

    if (status === 401 || status === 400) {
      if (message.includes('inactive')) {
        return 'Tu cuenta está inactiva. Contacta a un administrador.'
      }
      return 'Correo o contraseña incorrectos.'
    }
    if (status === 403) {
      return 'No tienes permiso para entrar al panel.'
    }
    if (!error.response) {
      return 'No hay conexión con el API de NORMA. ¿Está el servidor en marcha?'
    }
    return 'No pudimos iniciar sesión. Intenta de nuevo.'
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const original = String((error as { message: string }).message).trim()
    if (original) return original
  }

  return 'No se pudo iniciar sesión. Intenta de nuevo.'
}
