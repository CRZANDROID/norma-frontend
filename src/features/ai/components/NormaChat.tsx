import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp, Check, Copy, Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { aiApi } from '@/features/ai/api/ai-api'
import { RevealedAnswer } from '@/features/ai/components/catalog-answer'
import {
  getDraftSlots,
  useProfileDraftSlot,
  useSourceDraftSlot,
} from '@/features/ai/draft-bridge'
import { screenFromPath } from '@/features/ai/screen'
import type { AiAskInput, AiAskResult, AiStatus } from '@/features/ai/types/ai'
import { NormaThinkingOrb } from '@/shared/ui/thinking-orb'
import { duration, easeOut } from '@/shared/lib/motion'
import { mapApiError } from '@/shared/lib/api-error'
import { canOperate } from '@/shared/lib/roles'
import { cn } from '@/shared/lib/utils'
import { NormaMark } from '@/shared/ui/norma-mark'
import { useAuthStore } from '@/store/auth-store'

const TURN_CAP = 15

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

const DRAFT_NOTE =
  'El borrador está en el formulario y falta el clic de guardar.'

type Turn = {
  id: string
  role: 'user' | 'assistant'
  content: string
  pending?: boolean
  catalogLine?: string
}

type DraftRequest = Pick<AiAskInput, 'draftTarget' | 'profileSeed' | 'sourceUrl'>

function remember(turns: Turn[]) {
  return turns.slice(-TURN_CAP)
}

function asksForDraft(text: string) {
  return /\bborrador\b/i.test(text)
}

function catalogLine(result: AiAskResult): string | undefined {
  const bits = result.catalog
    ? [
        result.catalog.clientCount != null
          ? `${result.catalog.clientCount} clientes`
          : null,
        result.catalog.sourceCount != null
          ? `${result.catalog.sourceCount} fuentes`
          : null,
        result.catalog.profileCount != null
          ? `${result.catalog.profileCount} perfiles`
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
      className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-norma-navy text-[11px] font-semibold text-white"
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
    <div className="flex items-center gap-2.5" aria-label="Consultando el catálogo">
      <NormaThinkingOrb state="searching" size={20} aria-hidden />
      <p className="text-[13px] text-norma-muted">{THINKING[phrase]}</p>
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

export function NormaChat() {
  const location = useLocation()
  const screen = screenFromPath(location.pathname)
  const reduceMotion = useReducedMotion()
  const profileName = useAuthStore((s) => s.profile?.name)
  const profileId = useAuthStore((s) => s.profile?.id)
  const role = useAuthStore((s) => s.profile?.role)
  const canEdit = canOperate(role)
  const profileForm = useProfileDraftSlot()
  const sourceForm = useSourceDraftSlot()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<AiStatus | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [companyName, setCompanyName] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [draftNote, setDraftNote] = useState(false)

  useEffect(() => {
    setTurns([])
    setQuestion('')
    setDraftNote(false)
    setCompanyName('')
    setCompanyDescription('')
  }, [profileId])

  useEffect(() => {
    if (!profileForm && !sourceForm) setDraftNote(false)
  }, [profileForm, sourceForm])

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
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const node = scrollerRef.current
    if (!node || !open) return
    node.scrollTo({
      top: node.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [turns, asking, open, reduceMotion])

  const configured = status?.configured === true
  const canSend = configured && question.trim().length > 0 && !asking

  function pushLocal(userText: string, assistantText: string) {
    setQuestion('')
    setTurns((prev) =>
      remember([
        ...prev,
        { id: crypto.randomUUID(), role: 'user', content: userText },
        { id: crypto.randomUUID(), role: 'assistant', content: assistantText },
      ]),
    )
  }

  function applyDraft(data: AiAskResult) {
    const slots = getDraftSlots()
    if (data.draft?.target === 'profile' && data.draft.profile && slots.profile) {
      slots.profile.apply(data.draft.profile)
      setDraftNote(true)
      return
    }
    if (data.draft?.target === 'source' && data.draft.source && slots.source) {
      slots.source.apply(data.draft.source)
      setDraftNote(true)
    }
  }

  async function send(text: string, draft?: DraftRequest) {
    const trimmed = text.trim()
    if (!configured || !trimmed || asking) return
    const history = turns
      .filter((turn) => !turn.pending && turn.content.trim())
      .slice(-TURN_CAP)
      .map((turn) => ({
        role: turn.role,
        content: turn.content.slice(0, 2000),
      }))
    const userId = crypto.randomUUID()
    const pendingId = crypto.randomUUID()
    setQuestion('')
    setAsking(true)
    setTurns((prev) =>
      remember([
        ...prev,
        { id: userId, role: 'user', content: trimmed },
        { id: pendingId, role: 'assistant', content: '', pending: true },
      ]),
    )
    try {
      const data = await aiApi.ask({
        question: trimmed,
        screen,
        ...(history.length ? { messages: history } : {}),
        ...draft,
      })
      applyDraft(data)
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === pendingId
            ? {
                ...turn,
                pending: false,
                content: data.answer || 'No hubo respuesta.',
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

  function proposeProfile(bubble?: string) {
    const form = getDraftSlots().profile?.getSeed()
    const name = (companyName.trim() || form?.companyName || '').trim()
    const description = (
      companyDescription.trim() ||
      form?.description ||
      ''
    ).trim()
    const text = (
      bubble ??
      (name
        ? `Busca «${name}» y deja el borrador en el perfil.`
        : 'Deja el borrador en el perfil.')
    ).trim()
    if (!name) {
      pushLocal(
        text,
        'Escribe el nombre de la empresa. Sin ese nombre no busco en la web ni relleno el perfil.',
      )
      return
    }
    void send(text, {
      draftTarget: 'profile',
      profileSeed: {
        companyName: name,
        ...(description ? { description } : {}),
      },
    })
  }

  function proposeSource(bubble?: string) {
    const url = getDraftSlots().source?.getUrl().trim() ?? ''
    const text = (
      bubble ?? 'Sugiere palabras guía y enfoque de búsqueda a partir de esta página.'
    ).trim()
    if (!/^https?:\/\//i.test(url)) {
      pushLocal(
        text,
        'Escribe la URL http(s) en el alta de la fuente. Sin esa URL no descargo la página ni propongo palabras.',
      )
      return
    }
    void send(text, { draftTarget: 'source', sourceUrl: url })
  }

  function ask(text: string) {
    const trimmed = text.trim()
    if (!trimmed || asking) return
    if (asksForDraft(trimmed)) {
      if (!canEdit) {
        pushLocal(
          trimmed,
          'Puedes consultar el catálogo. El borrador solo se escribe si el perfil o el alta de la fuente están abiertos y puedes editarlos.',
        )
        return
      }
      if (profileForm && !sourceForm) {
        proposeProfile(trimmed)
        return
      }
      if (sourceForm && !profileForm) {
        proposeSource(trimmed)
        return
      }
      if (!profileForm && !sourceForm) {
        pushLocal(
          trimmed,
          'Abre el perfil o el alta de la fuente. No cambio de pantalla ni escribo en un formulario que no está abierto.',
        )
        return
      }
      pushLocal(
        trimmed,
        'Hay un perfil y un alta de fuente abiertos. Usa el botón del borrador que corresponda.',
      )
      return
    }
    void send(trimmed)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    ask(question)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      ask(question)
    }
  }

  function resetThread() {
    setTurns([])
    setQuestion('')
    setDraftNote(false)
    inputRef.current?.focus()
  }

  return (
    <div
      data-norma-chat
      className="pointer-events-none fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3"
    >
      <AnimatePresence initial={false}>
        {open ? (
          <motion.section
            key="norma-chat"
            id="norma-chat"
            aria-label="NORMA"
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: duration.ui, ease: easeOut }}
            className="pointer-events-auto flex h-[min(72dvh,36rem)] w-[min(calc(100vw-2.5rem),24rem)] flex-col overflow-hidden rounded-3xl border-2 border-norma-border bg-norma-surface shadow-[0_22px_48px_-24px_rgba(13,27,42,0.45)]"
          >
            <header className="flex items-center gap-3 border-b-2 border-norma-border bg-[radial-gradient(ellipse_at_top_left,rgba(105,88,248,0.16),transparent_58%)] px-4 py-3">
              <NormaMark className="size-10 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-base font-semibold tracking-tight">
                    NORMA
                  </h2>
                  {status?.configured ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-norma-green/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-norma-green">
                      <motion.span
                        className="size-1.5 rounded-full bg-norma-green"
                        animate={
                          reduceMotion ? undefined : { opacity: [0.45, 1, 0.45] }
                        }
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                      En línea
                    </span>
                  ) : status && !status.configured ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800">
                      Fuera de línea
                    </span>
                  ) : null}
                </div>
              </div>
              {turns.length > 0 ? (
                <button
                  type="button"
                  onClick={resetThread}
                  className="shrink-0 rounded-xl px-2 py-1.5 text-xs font-medium text-norma-muted transition-colors hover:bg-norma-navy/6 hover:text-norma-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
                >
                  Nueva consulta
                </button>
              ) : null}
              <button
                type="button"
                aria-label="Cerrar chat de NORMA"
                onClick={() => setOpen(false)}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl text-norma-muted transition-colors hover:bg-norma-navy/6 hover:text-norma-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
              >
                <X className="size-4" aria-hidden />
              </button>
            </header>

            <div
              ref={scrollerRef}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(ellipse_at_top,rgba(105,88,248,0.08),transparent_52%)] px-3 py-4"
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
                <div className="flex h-full flex-col justify-between gap-6">
                  <div className="flex flex-col items-start gap-3 pt-2">
                    <p className="font-display text-xl font-semibold tracking-tight text-balance">
                      ¿Qué quieres saber?
                    </p>
                    <p className="text-sm leading-relaxed text-norma-muted">
                      Pregunta por el flujo o por el catálogo que ves. Si el perfil
                      o el alta de una fuente están abiertos, puedo dejar un
                      borrador. Quien guarda eres tú.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {STARTERS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => ask(item)}
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
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {turns.map((turn) => (
                      <motion.li
                        key={turn.id}
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: duration.ui, ease: easeOut }}
                        className={cn(
                          'flex gap-2',
                          turn.role === 'user' ? 'justify-end' : 'justify-start',
                        )}
                      >
                        {turn.role === 'assistant' ? (
                          <NormaMark
                            className="mt-0.5 size-7 rounded-lg"
                            animated={Boolean(turn.pending)}
                          />
                        ) : null}
                        <div
                          className={cn(
                            'max-w-[min(100%,18rem)]',
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
                              'rounded-2xl px-3 py-2 text-left',
                              turn.role === 'user'
                                ? 'rounded-br-md bg-norma-accent text-white shadow-[0_12px_28px_-12px_rgba(105,88,248,0.85)]'
                                : 'rounded-bl-md border-2 border-norma-border bg-norma-raised/95 text-norma-fg',
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
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">
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

            {canEdit && (profileForm || sourceForm) ? (
              <div className="space-y-3 border-t-2 border-norma-border bg-norma-raised/60 px-3 py-3">
                {profileForm ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
                      Borrador de perfil
                    </p>
                    <input
                      value={companyName}
                      maxLength={200}
                      disabled={!configured || asking}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Nombre de la empresa"
                      aria-label="Nombre de la empresa"
                      className="w-full rounded-xl border-2 border-norma-border bg-norma-surface px-3 py-2 text-sm text-norma-fg outline-none placeholder:text-norma-subtle focus-visible:border-norma-accent focus-visible:ring-2 focus-visible:ring-norma-accent/25 disabled:opacity-50"
                    />
                    <input
                      value={companyDescription}
                      maxLength={2000}
                      disabled={!configured || asking}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      placeholder="Descripción corta, si quieres"
                      aria-label="Descripción corta"
                      className="w-full rounded-xl border-2 border-norma-border bg-norma-surface px-3 py-2 text-sm text-norma-fg outline-none placeholder:text-norma-subtle focus-visible:border-norma-accent focus-visible:ring-2 focus-visible:ring-norma-accent/25 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      disabled={!configured || asking}
                      onClick={() => proposeProfile()}
                      className="w-full rounded-xl bg-norma-navy px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-35"
                    >
                      Buscar y dejar borrador
                    </button>
                  </div>
                ) : null}
                {sourceForm ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
                      Borrador de fuente
                    </p>
                    <p className="text-xs leading-relaxed text-norma-muted">
                      Usa la URL http(s) que ya está en el alta. Una página, en
                      materia sanitaria.
                    </p>
                    <button
                      type="button"
                      disabled={!configured || asking}
                      onClick={() => proposeSource()}
                      className="w-full rounded-xl bg-norma-navy px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-35"
                    >
                      Sugerir palabras guía
                    </button>
                  </div>
                ) : null}
                {draftNote ? (
                  <p className="text-xs leading-relaxed text-norma-fg">{DRAFT_NOTE}</p>
                ) : null}
              </div>
            ) : null}

            <form
              onSubmit={onSubmit}
              className="border-t-2 border-norma-border bg-norma-surface/95 px-3 py-3"
            >
              <div className="flex items-end gap-2 rounded-[1.35rem] border-2 border-norma-border bg-norma-raised px-2 py-2 focus-within:border-norma-accent focus-within:ring-2 focus-within:ring-norma-accent/25">
                <textarea
                  ref={inputRef}
                  id="norma-question"
                  rows={1}
                  maxLength={2000}
                  value={question}
                  disabled={!configured || asking}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={
                    configured
                      ? 'Escribe una consulta…'
                      : 'El asistente no está disponible'
                  }
                  className="field-sizing-content max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed text-norma-fg outline-none placeholder:text-norma-subtle disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  aria-label="Enviar consulta"
                  className="mb-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-norma-accent text-white shadow-[0_8px_20px_-10px_rgba(105,88,248,0.9)] transition-opacity hover:bg-norma-accent-soft disabled:opacity-35"
                >
                  <ArrowUp className="size-4" aria-hidden />
                </button>
              </div>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? 'norma-chat' : undefined}
        aria-label={open ? 'Cerrar chat de NORMA' : 'Abrir chat de NORMA'}
        onClick={() => setOpen((value) => !value)}
        className="pointer-events-auto inline-flex size-14 items-center justify-center rounded-full bg-norma-accent text-white shadow-[0_16px_36px_-12px_rgba(105,88,248,0.95)] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-norma-bg"
      >
        <NormaMark className="size-10 rounded-full shadow-none" animated={false} />
      </button>
    </div>
  )
}
