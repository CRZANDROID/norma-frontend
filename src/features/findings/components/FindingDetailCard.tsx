import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Ban, ExternalLink, FileText, Pencil, Sparkles, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { findingsApi } from '@/features/findings/api/findings-api'
import { FindingExcludedBadge } from '@/features/findings/components/FindingExcludedBadge'
// Semáforo a mano (PATCH { impact }): descomentar picker + onImpactChange.
// import { FindingImpactPicker } from '@/features/findings/components/FindingImpactPicker'
import { FindingRevealedMarkdown } from '@/features/findings/components/FindingRevealedMarkdown'
import { FindingRewriteComposer, REWRITE_PROMPT_MAX } from '@/features/findings/components/FindingRewriteComposer'
import { FindingRewriteNotice } from '@/features/findings/components/FindingRewriteNotice'
import { formatFindingWhen } from '@/features/findings/lib/format'
import { canExcludeFromReport, IMPACT_LAMP } from '@/features/findings/lib/impact'
import type { FindingDetail } from '@/features/findings/types/finding'
import {
  FINDING_IMPACT_HINTS,
  FINDING_IMPACT_LABELS,
} from '@/features/findings/types/finding'
import { UnsavedChangesGuard } from '@/shared/hooks/unsaved-changes-guard'
import { mapApiError } from '@/shared/lib/api-error'
import { detailCrossfade, duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { UnsavedChangesDialog } from '@/shared/ui/unsaved-changes-dialog'

const TITLE_MAX = 160
const JUSTIFICATION_MAX = 20_000

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function rewriteFailed(error: unknown): string {
  if (axios.isAxiosError(error) && (!error.response || error.response.status === 503)) {
    return 'No se pudo reescribir. Intenta de nuevo.'
  }
  return mapApiError(error, 'No se pudo reescribir. Intenta de nuevo.')
}

function rewriteUnprocessableMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 422) return null
  const raw = (error.response.data as { message?: string | string[] } | undefined)
    ?.message
  if (Array.isArray(raw)) {
    const joined = raw.filter((part) => typeof part === 'string' && part.trim()).join('. ')
    return joined || 'NORMA no pudo aplicar ese pedido al briefing.'
  }
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  return 'NORMA no pudo aplicar ese pedido al briefing.'
}

export function FindingDetailCard({
  finding,
  excludedFilterOn = false,
  onUpdated,
}: {
  finding: FindingDetail
  excludedFilterOn?: boolean
  onUpdated: (next: FindingDetail) => void
}) {
  const reduceMotion = useReducedMotion()
  const lamp = IMPACT_LAMP[finding.impact]
  const documentUrl = finding.document.url
  const canOpenOrigin = !!documentUrl && isHttpUrl(documentUrl)
  const canExclude = canExcludeFromReport(finding.impact)
  const lastRewrite = finding.aiMeta?.lastRewrite ?? null

  const [editing, setEditing] = useState(false)
  const [rewriteOpen, setRewriteOpen] = useState(false)
  const [title, setTitle] = useState(finding.title)
  const [justification, setJustification] = useState(finding.justification)
  const [prompt, setPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  // const [changingImpact, setChangingImpact] = useState(false)
  const [rewriting, setRewriting] = useState(false)
  const [togglingReport, setTogglingReport] = useState(false)
  const [leaveEditOpen, setLeaveEditOpen] = useState(false)
  const [rewriteHint, setRewriteHint] = useState<{
    tone: 'note' | 'blocked'
    text: string
  } | null>(null)
  const [revealRewrite, setRevealRewrite] = useState(false)
  const pendingAfterDiscard = useRef<'read' | 'rewrite' | null>(null)
  const rewriteLock = useRef(false)
  const briefingRef = useRef<HTMLDivElement>(null)
  const [briefingMinHeight, setBriefingMinHeight] = useState<number | null>(null)

  useEffect(() => {
    setEditing(false)
    setRewriteOpen(false)
    setTitle(finding.title)
    setJustification(finding.justification)
    setPrompt('')
    setSaving(false)
    // setChangingImpact(false)
    setRewriting(false)
    setTogglingReport(false)
    setLeaveEditOpen(false)
    setRewriteHint(null)
    setRevealRewrite(false)
    setBriefingMinHeight(null)
    pendingAfterDiscard.current = null
    rewriteLock.current = false
    // Reset only when the selected finding changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- finding.id
  }, [finding.id])

  useEffect(() => {
    if (editing) return
    setTitle(finding.title)
    setJustification(finding.justification)
  }, [editing, finding.title, finding.justification])

  const dirty = useMemo(() => {
    if (!editing) return false
    return (
      title.trim() !== finding.title ||
      justification !== finding.justification
    )
  }, [editing, finding.justification, finding.title, justification, title])

  const dismissRewriteHint = useCallback(() => setRewriteHint(null), [])
  const busy = saving || rewriting || togglingReport

  function exitEdit() {
    setEditing(false)
    setTitle(finding.title)
    setJustification(finding.justification)
    setLeaveEditOpen(false)
    const next = pendingAfterDiscard.current
    pendingAfterDiscard.current = null
    if (next === 'rewrite') setRewriteOpen(true)
  }

  function requestLeaveEdit(next: 'read' | 'rewrite') {
    if (!dirty) {
      setEditing(false)
      setTitle(finding.title)
      setJustification(finding.justification)
      if (next === 'rewrite') setRewriteOpen(true)
      return
    }
    pendingAfterDiscard.current = next
    setLeaveEditOpen(true)
  }

  async function onSave() {
    const nextTitle = title.trim()
    const nextJustification = justification
    if (!nextTitle) {
      toast.error('El título no puede estar vacío.')
      return
    }
    if (!nextJustification.trim()) {
      toast.error('El briefing no puede estar vacío.')
      return
    }
    if (nextTitle.length > TITLE_MAX || nextJustification.length > JUSTIFICATION_MAX) {
      toast.error('Revisa la longitud del título o del briefing.')
      return
    }
    const body: { title?: string; justification?: string } = {}
    if (nextTitle !== finding.title) body.title = nextTitle
    if (nextJustification !== finding.justification) {
      body.justification = nextJustification
    }
    if (!body.title && !body.justification) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      const next = await findingsApi.patch(finding.id, body)
      onUpdated(next)
      setEditing(false)
      toast.success('Cambios guardados.')
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo guardar el hallazgo.'))
    } finally {
      setSaving(false)
    }
  }

  async function onRewrite() {
    const instruction = prompt.trim()
    if (!instruction) {
      toast.error('Escribe qué debe cambiar la IA.')
      return
    }
    if (instruction.length > REWRITE_PROMPT_MAX) {
      toast.error(`El prompt no puede pasar de ${REWRITE_PROMPT_MAX} caracteres.`)
      return
    }
    if (rewriteLock.current) return
    rewriteLock.current = true
    setRewriting(true)
    setRewriteHint(null)
    try {
      const next = await findingsApi.rewrite(finding.id, instruction)
      if (next.rewriteNote) {
        setRewriteHint({ tone: 'note', text: next.rewriteNote })
      } else if (!next.rewriteChanged) {
        setRewriteHint({
          tone: 'note',
          text: 'NORMA no cambió el briefing con ese pedido.',
        })
      }
      if (next.rewriteChanged) {
        const reserved = briefingRef.current?.offsetHeight ?? null
        setBriefingMinHeight(reserved)
        setPrompt('')
        setRewriteOpen(false)
        setRevealRewrite(true)
      } else {
        setRewriteOpen(false)
      }
      onUpdated(next)
    } catch (err) {
      const blocked = rewriteUnprocessableMessage(err)
      if (blocked) {
        setRewriteHint({ tone: 'blocked', text: blocked })
      } else {
        toast.error(rewriteFailed(err))
      }
    } finally {
      rewriteLock.current = false
      setRewriting(false)
    }
  }

  // PATCH { impact }. El rewrite nunca reclasifica. GREEN limpia excludedFromNextReport.
  // async function onImpactChange(impact: FindingImpact) {
  //   if (impact === finding.impact) return
  //   setChangingImpact(true)
  //   try {
  //     const next = await findingsApi.patch(finding.id, { impact })
  //     onUpdated(next)
  //     toast.success(`Semáforo: ${FINDING_IMPACT_LABELS[next.impact]}.`)
  //   } catch (err) {
  //     toast.error(mapApiError(err, 'No se pudo cambiar el semáforo.'))
  //   } finally {
  //     setChangingImpact(false)
  //   }
  // }

  async function onToggleReport() {
    if (!canExclude) return
    setTogglingReport(true)
    try {
      const next = finding.excludedFromNextReport
        ? await findingsApi.include(finding.id)
        : await findingsApi.exclude(finding.id)
      onUpdated(next)
      toast.success(
        next.excludedFromNextReport
          ? 'Fuera del próximo informe.'
          : 'Volvió al próximo informe.',
      )
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo actualizar el informe.'))
    } finally {
      setTogglingReport(false)
    }
  }

  return (
    <motion.article
      key={finding.id}
      initial={reduceMotion ? false : detailCrossfade.initial}
      animate={detailCrossfade.animate}
      transition={{ duration: duration.fast, ease: easeOut }}
      className="space-y-5"
    >
      <UnsavedChangesGuard when={dirty} />
      <UnsavedChangesDialog
        open={leaveEditOpen}
        onStay={() => {
          pendingAfterDiscard.current = null
          setLeaveEditOpen(false)
        }}
        onLeave={exitEdit}
      />

      <header>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-norma-subtle">
              Clasificación
            </p>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
                lamp.badge,
              )}
            >
              <span className={cn('size-1.5 rounded-full', lamp.fill)} aria-hidden />
              {FINDING_IMPACT_LABELS[finding.impact]}
            </span>
            {finding.excludedFromNextReport ? <FindingExcludedBadge /> : null}
          </div>
          {canExclude ? (
            <Button
              type="button"
              size="sm"
              variant={finding.excludedFromNextReport ? 'signal' : 'danger'}
              disabled={busy}
              onClick={() => void onToggleReport()}
            >
              {finding.excludedFromNextReport ? (
                <Undo2 className="size-3.5" aria-hidden />
              ) : (
                <Ban className="size-3.5" aria-hidden />
              )}
              {togglingReport
                ? 'Actualizando…'
                : finding.excludedFromNextReport
                  ? 'Volver a incluir'
                  : 'Sacar del informe'}
            </Button>
          ) : null}
        </div>
        {/* <div className="mt-3">
          <FindingImpactPicker
            value={finding.impact}
            disabled={busy}
            onChange={(impact) => void onImpactChange(impact)}
          />
        </div> */}
        <p className="mt-2 text-xs text-norma-subtle">
          {FINDING_IMPACT_HINTS[finding.impact]}
          {canExclude
            ? null
            : ' · Los informativos no entran al informe.'}
        </p>
        {editing ? (
          <div className="mt-3 space-y-1.5">
            <Label htmlFor="finding-title">Título de la medida</Label>
            <Input
              id="finding-title"
              value={title}
              maxLength={TITLE_MAX}
              disabled={busy}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-[11px] tabular-nums text-norma-subtle">
              {title.trim().length}/{TITLE_MAX}
            </p>
          </div>
        ) : (
          <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-pretty break-words md:text-2xl">
            {finding.title}
          </h2>
        )}
        {lastRewrite?.at ? (
          <p className="mt-2 line-clamp-2 text-[11px] text-norma-subtle">
            Reescrito {formatFindingWhen(lastRewrite.at)}
            {lastRewrite.prompt ? ` · “${lastRewrite.prompt}”` : ''}
          </p>
        ) : null}
      </header>

      {finding.suggestedAction ? (
        <section className="relative overflow-hidden rounded-2xl p-px">
          {reduceMotion ? null : (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-[-80%] bg-[conic-gradient(from_0deg,transparent_0_72%,rgba(105,88,248,0)_78%,rgba(142,128,255,0.95)_87%,rgba(105,88,248,0)_93%,transparent_100%)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 3.2, ease: 'linear', repeat: Infinity }}
            />
          )}
          <div className="relative rounded-[15px] bg-norma-surface px-4 py-4 ring-1 ring-inset ring-norma-accent/20">
            <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-norma-accent">
              <Sparkles className="size-3.5" aria-hidden />
              Acción sugerida por NORMA
            </h3>
            <p className="mt-2 text-base font-semibold leading-snug text-norma-fg">
              {finding.suggestedAction}
            </p>
          </div>
        </section>
      ) : null}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-norma-subtle">
            Justificación del análisis
          </h3>
          <div className="flex flex-wrap gap-2">
            {editing ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  disabled={busy || !dirty}
                  onClick={() => void onSave()}
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => requestLeaveEdit('read')}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setRewriteOpen(false)
                    setEditing(true)
                  }}
                >
                  <Pencil className="size-3.5" aria-hidden />
                  Editar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  aria-expanded={rewriteOpen}
                  onClick={() => setRewriteOpen((open) => !open)}
                >
                  <Sparkles className="size-3.5" aria-hidden />
                  Editar con NORMA
                </Button>
              </>
            )}
          </div>
        </div>
        <AnimatePresence initial={false}>
          {rewriteOpen && !editing ? (
            <motion.div
              key="rewrite"
              initial={reduceMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: duration.ui, ease: easeOut }}
              className="mt-3"
            >
              <FindingRewriteComposer
                prompt={prompt}
                rewriting={rewriting}
                onPromptChange={setPrompt}
                onSubmit={() => void onRewrite()}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
        {editing ? (
          <div className="mt-2 space-y-1.5">
            <Textarea
              id="finding-justification"
              aria-label="Briefing en Markdown"
              className="min-h-48 font-mono text-[13px] leading-relaxed"
              maxLength={JUSTIFICATION_MAX}
              disabled={busy}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
            <p className="text-[11px] tabular-nums text-norma-subtle">
              {justification.length}/{JUSTIFICATION_MAX}
            </p>
          </div>
        ) : (
          <div ref={briefingRef}>
            <FindingRevealedMarkdown
              className="mt-2"
              play={revealRewrite}
              reserveMinHeight={briefingMinHeight}
              text={finding.justification}
            />
          </div>
        )}
      </section>

      {excludedFilterOn && finding.excludedFromNextReport ? (
        <p className="text-xs text-norma-subtle">
          Este hallazgo está fuera del próximo informe. Si lo vuelves a incluir,
          saldrá de este filtro.
        </p>
      ) : null}

      <section className="rounded-2xl border-2 border-norma-border bg-norma-raised/80 px-4 py-3.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-norma-subtle">
          Documento fuente
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <FileText className="size-5 shrink-0 text-norma-muted" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" translate="no">
              {finding.document.filename}
            </p>
            <p className="truncate text-xs text-norma-muted">
              {finding.source?.name ?? 'Fuente'}
              {finding.document.processingStatus === 'CLASSIFIED'
                ? ' · Clasificada'
                : finding.document.processingStatus
                  ? ` · ${finding.document.processingStatus}`
                  : ''}
            </p>
          </div>
          {canOpenOrigin ? (
            <Button asChild size="sm">
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir documento
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </Button>
          ) : null}
        </div>
        {!documentUrl ? (
          <p className="mt-3 text-sm text-norma-subtle">
            Este hallazgo no trae el enlace de la página o el PDF original.
          </p>
        ) : !canOpenOrigin ? (
          <p className="mt-3 break-all font-mono text-sm" translate="no">
            {documentUrl}
          </p>
        ) : null}
      </section>
      <FindingRewriteNotice hint={rewriteHint} onDismiss={dismissRewriteHint} />
    </motion.article>
  )
}
