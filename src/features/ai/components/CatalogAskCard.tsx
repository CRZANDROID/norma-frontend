import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { ArrowUp, Check, Copy, Sparkles } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { aiApi } from '@/features/ai/api/ai-api'
import { RevealedAnswer } from '@/features/ai/components/catalog-answer'
import type { AiAskResult, AiStatus } from '@/features/ai/types/ai'
import { clientsApi } from '@/features/clients/api/clients-api'
import { duration, easeOut } from '@/shared/lib/motion'
import { mapApiError } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'
import { NormaMark } from '@/shared/ui/norma-mark'
import { Select } from '@/shared/ui/select'
import { useAuthStore } from '@/store/auth-store'

const ALL_CLIENTS = '__all__'

const STARTERS = [
  '¿Qué fuentes tiene Arca vinculadas?',
  '¿Cuáles son las palabras clave del perfil de bebidas?',
  '¿Qué clientes hay activos en el catálogo?',
]

const THINKING = [
  'Leyendo clientes y perfiles…',
  'Revisando fuentes vinculadas…',
  'Armando la respuesta…',
]

type Turn = {
  id: string
  role: 'user' | 'assistant'
  content: string
  pending?: boolean
  catalogLine?: string
}

function catalogLine(result: AiAskResult): string | undefined {
  const bits = result.catalog
    ? [
        result.catalog.clients != null ? `${result.catalog.clients} clientes` : null,
        result.catalog.sources != null ? `${result.catalog.sources} fuentes` : null,
        result.catalog.profiles != null
          ? `${result.catalog.profiles} perfiles`
          : null,
      ].filter(Boolean)
    : []
  if (bits.length === 0 && !result.model) return undefined
  return [bits.length ? `Leído: ${bits.join(', ')}` : null, result.model]
    .filter(Boolean)
    .join(' · ')
}

function UserGlyph({ name }: { name?: string }) {
  const letter = (name?.trim()?.[0] ?? '?').toUpperCase()
  return (
    <span
      className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-norma-navy text-[11px] font-semibold text-white"
      aria-hidden
    >
      {letter}
    </span>
  )
}

function ThinkingDots() {
  const [phrase, setPhrase] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhrase((prev) => (prev + 1) % THINKING.length)
    }, 1400)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="space-y-2" aria-label="Consultando el catálogo">
      <p className="text-[13px] text-norma-muted">{THINKING[phrase]}</p>
      <span className="inline-flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-norma-accent"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.12,
              ease: 'easeInOut',
            }}
          />
        ))}
      </span>
    </div>
  )
}

function CopyAnswer({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('No se pudo copiar la respuesta.')
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[11px] font-medium text-norma-subtle transition-colors hover:bg-norma-navy/6 hover:text-norma-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
    >
      {copied ? (
        <Check className="size-3" aria-hidden />
      ) : (
        <Copy className="size-3" aria-hidden />
      )}
      {copied ? 'Copiada' : 'Copiar'}
    </button>
  )
}

export function CatalogAskCard() {
  const reduceMotion = useReducedMotion()
  const profileName = useAuthStore((s) => s.profile?.name)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [status, setStatus] = useState<AiStatus | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [clientId, setClientId] = useState(ALL_CLIENTS)
  const [clientOptions, setClientOptions] = useState<
    { value: string; label: string }[]
  >([{ value: ALL_CLIENTS, label: 'Todo el catálogo' }])
  const [asking, setAsking] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])

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
        /* selector opcional */
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    node.scrollTo({
      top: node.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [turns, asking, reduceMotion])

  const configured = status?.configured === true
  const canSend = configured && question.trim().length > 0 && !asking

  async function ask(text: string) {
    const trimmed = text.trim()
    if (!configured || !trimmed || asking) return
    const userId = crypto.randomUUID()
    const pendingId = crypto.randomUUID()
    setQuestion('')
    setAsking(true)
    setTurns((prev) => [
      ...prev,
      { id: userId, role: 'user', content: trimmed },
      { id: pendingId, role: 'assistant', content: '', pending: true },
    ])
    try {
      const data = await aiApi.ask({
        question: trimmed,
        clientId: clientId === ALL_CLIENTS ? undefined : clientId,
      })
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === pendingId
            ? {
                ...turn,
                pending: false,
                content: data.answer || 'No hubo respuesta del catálogo.',
                catalogLine: catalogLine(data),
              }
            : turn,
        ),
      )
    } catch (err) {
      setTurns((prev) => prev.filter((turn) => turn.id !== pendingId))
      toast.error(mapApiError(err, 'No se pudo consultar el catálogo.'))
    } finally {
      setAsking(false)
      inputRef.current?.focus()
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void ask(question)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void ask(question)
    }
  }

  function resetThread() {
    setTurns([])
    setQuestion('')
    inputRef.current?.focus()
  }

  return (
    <section className="flex h-full min-h-[36rem] flex-col overflow-hidden rounded-3xl border-2 border-norma-border bg-norma-surface shadow-[0_22px_48px_-24px_rgba(13,27,42,0.4)]">
      <header className="flex items-start gap-3 border-b-2 border-norma-border bg-[radial-gradient(ellipse_at_top_left,rgba(105,88,248,0.16),transparent_58%)] px-5 py-4">
        <NormaMark className="size-11 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              NORMA
            </h2>
            {status?.configured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-norma-green/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-norma-green">
                <motion.span
                  className="size-1.5 rounded-full bg-norma-green"
                  animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                En línea
              </span>
            ) : status && !status.configured ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800">
                Fuera de línea
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-norma-muted">
            Consulta el catálogo en lenguaje natural.
          </p>
        </div>
        {turns.length > 0 ? (
          <button
            type="button"
            onClick={resetThread}
            className="shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-medium text-norma-muted transition-colors hover:bg-norma-navy/6 hover:text-norma-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
          >
            Nueva consulta
          </button>
        ) : null}
      </header>

      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(ellipse_at_top,rgba(105,88,248,0.08),transparent_52%),radial-gradient(circle_at_90%_20%,rgba(14,116,144,0.08),transparent_40%)] px-4 py-5 md:px-5"
      >
        {statusError ? (
          <p className="text-sm text-norma-coral">{statusError}</p>
        ) : !status ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-norma-subtle">
            <NormaMark className="size-12 rounded-2xl" />
            Conectando con el asistente…
          </div>
        ) : !configured ? (
          <p className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            El asistente no está configurado en el servidor. Un administrador
            tiene que activar la clave de consulta.
          </p>
        ) : turns.length === 0 ? (
          <div className="flex h-full flex-col justify-between gap-8">
            <div className="flex flex-col items-start gap-4 pt-4 md:pt-8">
              <NormaMark className="size-14 rounded-2xl" />
              <div>
                <p className="font-display text-[1.85rem] font-semibold tracking-tight text-balance md:text-[2.1rem]">
                  ¿Qué quieres saber del catálogo?
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-norma-muted">
                  Pregunta como se lo preguntarías a un analista. NORMA responde
                  con lo ya guardado: clientes, perfiles y fuentes.
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {STARTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => void ask(item)}
                  className="rounded-2xl border-2 border-norma-border bg-norma-raised/80 px-3.5 py-3 text-left text-xs font-medium leading-snug text-norma-fg transition-colors hover:border-norma-accent/45 hover:bg-norma-accent/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
                >
                  <Sparkles
                    className="mb-2 size-3.5 text-norma-accent"
                    aria-hidden
                  />
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="space-y-5">
            <AnimatePresence initial={false}>
              {turns.map((turn) => (
                <motion.li
                  key={turn.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.ui, ease: easeOut }}
                  className={cn(
                    'flex gap-2.5',
                    turn.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  {turn.role === 'assistant' ? (
                    <NormaMark
                      className="mt-0.5 size-8 rounded-xl"
                      animated={Boolean(turn.pending)}
                    />
                  ) : null}
                  <div
                    className={cn(
                      'max-w-[min(100%,38rem)]',
                      turn.role === 'user' ? 'text-right' : 'text-left',
                    )}
                  >
                    <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
                      {turn.role === 'assistant'
                        ? 'NORMA'
                        : (profileName?.split(' ')[0] ?? 'Tú')}
                    </p>
                    <div
                      className={cn(
                        'rounded-2xl px-3.5 py-2.5 text-left',
                        turn.role === 'user'
                          ? 'rounded-br-md bg-norma-accent text-white shadow-[0_12px_28px_-12px_rgba(105,88,248,0.85)]'
                          : 'rounded-bl-md border-2 border-norma-border bg-norma-raised/95 text-norma-fg shadow-[0_10px_24px_-16px_rgba(13,27,42,0.35)]',
                      )}
                    >
                      {turn.pending ? (
                        <ThinkingDots />
                      ) : turn.role === 'assistant' ? (
                        <>
                          <RevealedAnswer text={turn.content} />
                          {turn.catalogLine ? (
                            <p className="mt-2.5 border-t border-norma-border/70 pt-2 text-[11px] text-norma-subtle">
                              {turn.catalogLine}
                            </p>
                          ) : null}
                          <CopyAnswer text={turn.content} />
                        </>
                      ) : (
                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                          {turn.content}
                        </p>
                      )}
                    </div>
                  </div>
                  {turn.role === 'user' ? (
                    <UserGlyph name={profileName} />
                  ) : null}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t-2 border-norma-border bg-norma-surface/95 px-4 py-3 md:px-5"
      >
        <div className="rounded-[1.35rem] border-2 border-norma-border bg-norma-raised px-2 pb-2 pt-2 focus-within:border-norma-accent focus-within:ring-2 focus-within:ring-norma-accent/25">
          <textarea
            ref={inputRef}
            id="catalog-question"
            rows={1}
            value={question}
            disabled={!configured || asking}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              configured
                ? 'Escribe una consulta…'
                : 'El asistente no está disponible'
            }
            className="field-sizing-content max-h-32 min-h-11 w-full resize-none bg-transparent px-3 py-2.5 text-sm leading-relaxed text-norma-fg outline-none placeholder:text-norma-subtle disabled:opacity-50"
          />
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="min-w-0 max-w-[16rem] flex-1">
              <Select
                id="catalog-client"
                aria-label="Ámbito de la consulta"
                value={clientId}
                onValueChange={setClientId}
                options={clientOptions}
                disabled={!configured || asking}
                className="h-8 rounded-xl border-norma-border/80 bg-norma-surface text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <p className="hidden text-[10px] text-norma-subtle sm:block">
                Enter envía · Shift+Enter salto
              </p>
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Enviar consulta"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-norma-accent text-white shadow-[0_8px_20px_-10px_rgba(105,88,248,0.9)] transition-opacity hover:bg-norma-accent-soft disabled:opacity-35"
              >
                <ArrowUp className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}
