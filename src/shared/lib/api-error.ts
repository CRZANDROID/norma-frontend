import axios from 'axios'

/** Mensajes en español para errores Axios / Nest (`message` string | string[]). */
export function mapApiError(
  error: unknown,
  fallback = 'Ocurrió un error. Intenta de nuevo.',
): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const raw = (
      error.response?.data as { message?: string | string[] } | undefined
    )?.message
    const message = Array.isArray(raw)
      ? raw.join('. ')
      : typeof raw === 'string'
        ? raw
        : ''

    if (!error.response) {
      return 'No hay conexión con el API de NORMA. ¿Está el servidor en marcha?'
    }
    if (status === 401) {
      return 'Tu sesión expiró. Vuelve a iniciar sesión.'
    }
    if (status === 403) {
      return 'No tienes permiso para esta acción.'
    }
    if (status === 404) {
      return message || 'No encontramos ese recurso.'
    }
    if (status === 400 || status === 409) {
      return message || 'Revisa los datos e inténtalo de nuevo.'
    }
    if (message) return message
    return fallback
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}
