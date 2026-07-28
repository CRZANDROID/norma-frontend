import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** TEMP: true = login sin Supabase/Nest. Mañana: VITE_AUTH_BYPASS=false */
export const authBypass = import.meta.env.VITE_AUTH_BYPASS === 'true'

export const useApiMock =
  import.meta.env.VITE_USE_API_MOCK === 'true' ||
  import.meta.env.VITE_DESIGN_PREVIEW === 'true' ||
  authBypass

export const designPreview = import.meta.env.VITE_DESIGN_PREVIEW === 'true'
