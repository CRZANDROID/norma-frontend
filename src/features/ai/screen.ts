import type { AskScreen } from '@/features/ai/types/ai'

export function screenFromPath(pathname: string): AskScreen {
  if (pathname.startsWith('/clientes')) return 'clientes'
  if (pathname.startsWith('/fuentes')) return 'fuentes'
  if (pathname.startsWith('/alertas')) return 'clasificacion'
  if (pathname.startsWith('/informes')) return 'informes'
  if (pathname.startsWith('/usuarios')) return 'usuarios'
  return 'agentes'
}
