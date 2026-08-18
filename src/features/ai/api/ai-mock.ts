import type { AiAskInput, AiAskResult, AiStatus } from '@/features/ai/types/ai'

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const aiMockApi = {
  async status(): Promise<AiStatus> {
    await delay(120)
    return { configured: true, model: 'gpt-4o-mini' }
  },

  async ask(input: AiAskInput): Promise<AiAskResult> {
    await delay()
    const scope = input.clientId
      ? 'el cliente seleccionado'
      : 'el catálogo del piloto'
    return {
      answer: `Consulta de prueba sobre ${scope}: «${input.question.trim()}». El asistente real responde con lo ya guardado en clientes, perfiles y fuentes.`,
      catalog: { clients: 2, sources: 3, profiles: 1 },
      model: 'gpt-4o-mini',
    }
  },
}
