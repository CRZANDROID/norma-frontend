import { api } from '@/shared/lib/axios'
import { useApiMock } from '@/shared/lib/utils'
import { aiMockApi } from '@/features/ai/api/ai-mock'
import type { AiAskInput, AiAskResult, AiStatus } from '@/features/ai/types/ai'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function normalizeAsk(raw: unknown): AiAskResult {
  if (!isRecord(raw)) return { answer: '' }
  const catalogRaw = isRecord(raw.catalog) ? raw.catalog : undefined
  return {
    answer: typeof raw.answer === 'string' ? raw.answer : String(raw.answer ?? ''),
    model: typeof raw.model === 'string' ? raw.model : null,
    catalog: catalogRaw
      ? {
          clients:
            typeof catalogRaw.clients === 'number' ? catalogRaw.clients : undefined,
          sources:
            typeof catalogRaw.sources === 'number' ? catalogRaw.sources : undefined,
          profiles:
            typeof catalogRaw.profiles === 'number'
              ? catalogRaw.profiles
              : undefined,
        }
      : undefined,
  }
}

/** Asistente de catálogo (`docs/FRONTEND-AI-ASK.md`). No clasifica normas. */
export const aiApi = {
  status(): Promise<AiStatus> {
    if (useApiMock) return aiMockApi.status()
    return api.get<AiStatus>('/ai/status').then((r) => r.data)
  },

  ask(input: AiAskInput): Promise<AiAskResult> {
    if (useApiMock) return aiMockApi.ask(input)
    const body: AiAskInput = { question: input.question }
    if (input.clientId) body.clientId = input.clientId
    return api.post<unknown>('/ai/ask', body).then((r) => normalizeAsk(r.data))
  },
}
