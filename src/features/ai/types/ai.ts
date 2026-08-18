export type AiStatus = {
  configured: boolean
  model?: string | null
}

export type AiAskInput = {
  question: string
}

export type AiCatalogStats = {
  clients?: number
  sources?: number
  profiles?: number
}

export type AiAskResult = {
  answer: string
  catalog?: AiCatalogStats
  model?: string | null
}
