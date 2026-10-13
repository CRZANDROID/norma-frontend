import { api } from '@/shared/lib/axios'
import { useApiMock } from '@/shared/lib/utils'
import { aiMockApi } from '@/features/ai/api/ai-mock'
import type {
  AiAskInput,
  AiAskResult,
  AiCatalogStats,
  AiDraft,
  AiProfileDraft,
  AiSourceDraft,
  AiStatus,
} from '@/features/ai/types/ai'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function optionalList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const items = value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  )
  return items.length ? items : undefined
}

function normalizeCatalog(raw: unknown): AiCatalogStats | undefined {
  if (!isRecord(raw)) return undefined
  const clientCount =
    typeof raw.clientCount === 'number' ? raw.clientCount : undefined
  const profileCount =
    typeof raw.profileCount === 'number' ? raw.profileCount : undefined
  const sourceCount =
    typeof raw.sourceCount === 'number' ? raw.sourceCount : undefined
  const scopedToClientId =
    typeof raw.scopedToClientId === 'string' || raw.scopedToClientId === null
      ? raw.scopedToClientId
      : undefined
  if (
    clientCount == null &&
    profileCount == null &&
    sourceCount == null &&
    scopedToClientId === undefined
  ) {
    return undefined
  }
  return { clientCount, profileCount, sourceCount, scopedToClientId }
}

function normalizeProfile(raw: unknown): AiProfileDraft | undefined {
  if (!isRecord(raw)) return undefined
  return {
    name: optionalString(raw.name),
    description: optionalString(raw.description),
    keywords: optionalList(raw.keywords),
    categories: optionalList(raw.categories),
    products: optionalList(raw.products),
  }
}

function normalizeSource(raw: unknown): AiSourceDraft | undefined {
  if (!isRecord(raw)) return undefined
  return {
    keywordsGuide: optionalList(raw.keywordsGuide),
    searchFocus: optionalList(raw.searchFocus),
  }
}

function normalizeDraft(raw: unknown): AiDraft | null {
  if (!isRecord(raw)) return null
  if (raw.target === 'profile') {
    const profile = normalizeProfile(raw.profile)
    return profile ? { target: 'profile', profile } : null
  }
  if (raw.target === 'source') {
    const source = normalizeSource(raw.source)
    return source ? { target: 'source', source } : null
  }
  return null
}

function normalizeAsk(raw: unknown): AiAskResult {
  if (!isRecord(raw)) return { answer: '', draft: null }
  return {
    answer: typeof raw.answer === 'string' ? raw.answer : String(raw.answer ?? ''),
    model: typeof raw.model === 'string' ? raw.model : null,
    catalog: normalizeCatalog(raw.catalog),
    draft: normalizeDraft(raw.draft),
  }
}

function askBody(input: AiAskInput) {
  return {
    question: input.question,
    ...(input.messages?.length ? { messages: input.messages } : {}),
    ...(input.draftTarget ? { draftTarget: input.draftTarget } : {}),
    ...(input.profileSeed ? { profileSeed: input.profileSeed } : {}),
    ...(input.sourceUrl ? { sourceUrl: input.sourceUrl } : {}),
    ...(input.screen ? { screen: input.screen } : {}),
  }
}

/** NORMA (`docs/FRONTEND-ADMIN.md`). No clasifica normas y no guarda. */
export const aiApi = {
  status(): Promise<AiStatus> {
    if (useApiMock) return aiMockApi.status()
    return api.get<AiStatus>('/ai/status').then((r) => r.data)
  },

  ask(input: AiAskInput): Promise<AiAskResult> {
    if (useApiMock) return aiMockApi.ask(input)
    return api.post<unknown>('/ai/ask', askBody(input)).then((r) => normalizeAsk(r.data))
  },
}
