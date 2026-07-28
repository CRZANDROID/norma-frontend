/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_API_MOCK?: string
  readonly VITE_DESIGN_PREVIEW?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
