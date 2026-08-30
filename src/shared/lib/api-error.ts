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
    if (status === 429) {
      return 'El servidor recibió demasiadas peticiones. El panel esperará antes de volver a preguntar.'
    }
    if (status === 502 || status === 504) {
      return 'El API no respondió a tiempo. En Render gratuito suele pasar si el panel pide demasiado seguido.'
    }
    if (status === 503) {
      return (
        message ||
        'El API no está disponible ahora. En Render gratuito se duerme o se satura; espera y reintenta.'
      )
    }
    if (message) return message
    return fallback
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function isApiCapacityError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  const status = error.response?.status
  if (!error.response) return true
  return status === 429 || status === 502 || status === 503 || status === 504
}
