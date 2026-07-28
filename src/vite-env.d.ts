/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_USE_API_MOCK?: string
  readonly VITE_DESIGN_PREVIEW?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
