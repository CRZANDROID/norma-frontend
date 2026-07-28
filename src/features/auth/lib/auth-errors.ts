import axios from 'axios'

/** Mensajes claros en español para errores de login / perfil. */
export function mapAuthError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const message = String(
      (error.response?.data as { message?: string | string[] } | undefined)
        ?.message ?? '',
    ).toLowerCase()

    if (status === 401) {
      if (message.includes('inactive')) {
        return 'Tu cuenta está inactiva. Contacta a un administrador.'
      }
      return 'No pudimos validar tu sesión con NORMA. Intenta de nuevo.'
    }
    if (status === 403) {
      return 'No tienes permiso para entrar al panel.'
    }
    if (!error.response) {
      return 'No hay conexión con el API de NORMA. ¿Está el servidor en marcha?'
    }
    return 'No pudimos cargar tu perfil. Intenta de nuevo.'
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const raw = String((error as { message: string }).message).toLowerCase()

    if (raw.includes('invalid login credentials')) {
      return 'Correo o contraseña incorrectos.'
    }
    if (raw.includes('email not confirmed')) {
      return 'Confirma tu correo antes de iniciar sesión.'
    }
    if (raw.includes('user is banned') || raw.includes('disabled')) {
      return 'Esta cuenta está deshabilitada.'
    }
    if (raw.includes('too many requests')) {
      return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
    }
    if (raw.includes('network')) {
      return 'Error de red al contactar Supabase. Revisa tu conexión.'
    }

    const original = String((error as { message: string }).message).trim()
    if (original) return original
  }

  return 'No se pudo iniciar sesión. Intenta de nuevo.'
}
