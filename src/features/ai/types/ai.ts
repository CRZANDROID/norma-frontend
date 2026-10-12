export type AiStatus = {
  configured: boolean
  model?: string | null
}

export type AiAskMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AiProfileDraft = {
  name?: string
  description?: string
  keywords?: string[]
  categories?: string[]
  products?: string[]
}

export type AiSourceDraft = {
  keywordsGuide?: string[]
  searchFocus?: string[]
}

export type AiDraft =
  | { target: 'profile'; profile: AiProfileDraft }
  | { target: 'source'; source: AiSourceDraft }

export type AiAskInput = {
  question: string
  messages?: AiAskMessage[]
  draftTarget?: 'profile' | 'source'
  profileSeed?: { companyName: string; description?: string }
  sourceUrl?: string
}

export type AiCatalogStats = {
  clientCount?: number
  profileCount?: number
  sourceCount?: number
  scopedToClientId?: string | null
}

export type AiAskResult = {
  answer: string
  catalog?: AiCatalogStats
  model?: string | null
  draft?: AiDraft | null
}
