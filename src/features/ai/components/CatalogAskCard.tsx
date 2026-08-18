import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { aiApi } from '@/features/ai/api/ai-api'
import type { AiAskResult, AiStatus } from '@/features/ai/types/ai'
import { clientsApi } from '@/features/clients/api/clients-api'
import { mapApiError } from '@/shared/lib/api-error'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

const ALL_CLIENTS = '__all__'

export function CatalogAskCard() {
  const [status, setStatus] = useState<AiStatus | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [clientId, setClientId] = useState(ALL_CLIENTS)
  const [clientOptions, setClientOptions] = useState<
    { value: string; label: string }[]
  >([{ value: ALL_CLIENTS, label: 'Todo el catálogo' }])
  const [asking, setAsking] = useState(false)
  const [result, setResult] = useState<AiAskResult | null>(null)

  useEffect(() => {
    let cancelled = false
    void aiApi
      .status()
      .then((data) => {
        if (!cancelled) setStatus(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setStatusError(mapApiError(err, 'No se pudo consultar el asistente.'))
        }
      })
    void clientsApi
      .list({ status: 'ACTIVE' })
      .then((rows) => {
        if (cancelled) return
        setClientOptions([
          { value: ALL_CLIENTS, label: 'Todo el catálogo' },
          ...rows.map((c) => ({ value: c.id, label: c.name })),
        ])
      })
      .catch(() => {
        /* el selector es opcional */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const configured = status?.configured === true
  const canSend = configured && question.trim().length > 0 && !asking

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSend) return
    setAsking(true)
    setResult(null)
    try {
      const data = await aiApi.ask({
        question: question.trim(),
        clientId: clientId === ALL_CLIENTS ? undefined : clientId,
      })
      setResult(data)
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo consultar el catálogo.'))
    } finally {
      setAsking(false)
    }
  }

  const catalogBits = result?.catalog
    ? [
        result.catalog.clients != null
          ? `${result.catalog.clients} clientes`
          : null,
        result.catalog.sources != null
          ? `${result.catalog.sources} fuentes`
          : null,
        result.catalog.profiles != null
          ? `${result.catalog.profiles} perfiles`
          : null,
      ].filter(Boolean)
    : []

  return (
    <section className="rounded-3xl border-2 border-norma-border bg-norma-surface p-6 shadow-[0_12px_32px_-18px_rgba(13,27,42,0.3)]">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        Consultar el catálogo
      </h2>
      <p className="mt-1 text-sm text-norma-muted">
        Pregunta sobre clientes, perfiles y fuentes ya guardados. No clasifica
        normas.
      </p>

      {statusError ? (
        <p className="mt-4 text-sm text-norma-coral">{statusError}</p>
      ) : !status ? (
        <div className="mt-4">
          <Skeleton className="h-24 w-full" />
        </div>
      ) : !configured ? (
        <p className="mt-4 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          El asistente no está configurado en el servidor.
        </p>
      ) : (
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="catalog-client">Ámbito</Label>
            <Select
              id="catalog-client"
              value={clientId}
              onValueChange={setClientId}
              options={clientOptions}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="catalog-question">Pregunta</Label>
            <textarea
              id="catalog-question"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ej. ¿Qué fuentes tiene Arca vinculadas?"
              className="w-full resize-y rounded-2xl border-2 border-norma-border bg-norma-raised px-3 py-2 text-sm text-norma-fg outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
            />
          </div>
          <Button type="submit" disabled={!canSend}>
            {asking ? 'Consultando…' : 'Consultar'}
          </Button>
        </form>
      )}

      {result?.answer ? (
        <div className="mt-5 rounded-2xl border-2 border-norma-border bg-norma-raised/50 p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-norma-fg">
            {result.answer}
          </p>
          {catalogBits.length > 0 ? (
            <p className="mt-3 text-[11px] text-norma-subtle">
              Basado en {catalogBits.join(', ')}
              {result.model ? ` · ${result.model}` : ''}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
