import { useEffect, useState, type FormEvent } from 'react'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { sourcesApi } from '@/features/sources/api/sources-api'
import {
  ChipInput,
  KeywordChips,
  StatusBadge,
} from '@/features/sources/components/chips'
import type {
  Source,
  SourceType,
} from '@/features/sources/types/source'
import {
  SOURCE_TYPE_LABELS,
  SOURCE_TYPES,
} from '@/features/sources/types/source'
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard'
import { mapApiError } from '@/shared/lib/api-error'
import { focusFirstInvalid } from '@/shared/lib/form'
import { slugify } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Modal } from '@/shared/ui/modal'
import { Select } from '@/shared/ui/select'

const SOURCE_TYPE_OPTIONS = SOURCE_TYPES.map((t) => ({
  value: t,
  label: SOURCE_TYPE_LABELS[t],
}))

const textareaClass =
  'flex min-h-[96px] w-full rounded-2xl border-2 border-norma-border bg-norma-raised px-3 py-2 font-mono text-xs text-norma-fg placeholder:text-norma-subtle outline-none transition-[box-shadow,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:border-norma-accent focus-visible:ring-2 focus-visible:ring-norma-accent/25 disabled:cursor-not-allowed disabled:opacity-50'

function configToText(config: Record<string, unknown> | null): string {
  if (!config) return ''
  try {
    return JSON.stringify(config, null, 2)
  } catch {
    return ''
  }
}

function parseConfig(text: string): Record<string, unknown> | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  const parsed: unknown = JSON.parse(trimmed)
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('El config debe ser un objeto JSON.')
  }
  return parsed as Record<string, unknown>
}

export function SourceDetailHeader({ source }: { source: Source }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-norma-border pb-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-balance">
            {source.name}
          </h2>
          <StatusBadge status={source.status} />
        </div>
        <p className="mt-1 font-mono text-xs text-norma-subtle">{source.code}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="accent">{SOURCE_TYPE_LABELS[source.type]}</Badge>
          {source.jurisdiction ? (
            <Badge variant="signal">{source.jurisdiction}</Badge>
          ) : null}
          {source.frequency ? (
            <span className="text-xs text-norma-muted">{source.frequency}</span>
          ) : null}
        </div>
      </div>
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border-2 border-norma-border bg-norma-raised px-3 py-2 text-xs font-medium text-norma-signal transition-colors hover:border-norma-signal/40"
        >
          Abrir URL
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      ) : null}
    </div>
  )
}

export function SourceDataForm({
  source,
  canEdit,
  onSaved,
}: {
  source: Source
  canEdit: boolean
  onSaved: (source: Source) => void
}) {
  const [name, setName] = useState(source.name)
  const [type, setType] = useState<SourceType>(source.type)
  const [url, setUrl] = useState(source.url ?? '')
  const [section, setSection] = useState(source.section ?? '')
  const [jurisdiction, setJurisdiction] = useState(source.jurisdiction ?? '')
  const [frequency, setFrequency] = useState(source.frequency ?? '')
  const [keywordsGuide, setKeywordsGuide] = useState(source.keywordsGuide)
  const [configText, setConfigText] = useState(configToText(source.config))
  const [saving, setSaving] = useState(false)
  const [confirmOff, setConfirmOff] = useState(false)
  const [busyStatus, setBusyStatus] = useState(false)

  useEffect(() => {
    setName(source.name)
    setType(source.type)
    setUrl(source.url ?? '')
    setSection(source.section ?? '')
    setJurisdiction(source.jurisdiction ?? '')
    setFrequency(source.frequency ?? '')
    setKeywordsGuide(source.keywordsGuide)
    setConfigText(configToText(source.config))
  }, [source])

  const dirty =
    name !== source.name ||
    type !== source.type ||
    url !== (source.url ?? '') ||
    section !== (source.section ?? '') ||
    jurisdiction !== (source.jurisdiction ?? '') ||
    frequency !== (source.frequency ?? '') ||
    keywordsGuide.join('\0') !== source.keywordsGuide.join('\0') ||
    configText.trim() !== configToText(source.config).trim()

  useUnsavedChangesGuard(canEdit && dirty)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      focusFirstInvalid(form)
      form.reportValidity()
      return
    }
    if (!canEdit || !dirty) return
    setSaving(true)
    try {
      let config: Record<string, unknown> | null
      try {
        config = parseConfig(configText)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'JSON de config inválido.',
        )
        document.getElementById('source-config')?.focus()
        return
      }
      const updated = await sourcesApi.update(source.id, {
        name,
        type,
        url: url || null,
        section: section || null,
        jurisdiction: jurisdiction || null,
        frequency: frequency || null,
        keywordsGuide,
        config,
      })
      onSaved(updated)
      toast.success('Cambios guardados.')
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo guardar.'))
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus() {
    setBusyStatus(true)
    try {
      const updated =
        source.status === 'ACTIVE'
          ? await sourcesApi.deactivate(source.id)
          : await sourcesApi.activate(source.id)
      onSaved(updated)
      toast.success(
        updated.status === 'ACTIVE'
          ? 'Fuente reanudada.'
          : 'Fuente pausada.',
      )
      setConfirmOff(false)
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo completar.'))
    } finally {
      setBusyStatus(false)
    }
  }

  return (
    <>
      <form className="mt-6 max-w-xl space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="source-name">Nombre</Label>
          <Input
            id="source-name"
            name="name"
            autoComplete="off"
            value={name}
            disabled={!canEdit}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="source-code">Código</Label>
          <Input
            id="source-code"
            name="code"
            autoComplete="off"
            spellCheck={false}
            value={source.code}
            disabled
            className="font-mono text-norma-subtle"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="source-type">Tipo</Label>
          <Select
            id="source-type"
            value={type}
            disabled={!canEdit}
            onValueChange={(v) => setType(v as SourceType)}
            options={SOURCE_TYPE_OPTIONS}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="source-url">URL</Label>
          <Input
            id="source-url"
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            value={url}
            disabled={!canEdit}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="source-section">Sección</Label>
            <Input
              id="source-section"
              name="section"
              autoComplete="off"
              value={section}
              disabled={!canEdit}
              onChange={(e) => setSection(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="source-jurisdiction">Jurisdicción</Label>
            <Input
              id="source-jurisdiction"
              name="jurisdiction"
              autoComplete="off"
              spellCheck={false}
              value={jurisdiction}
              disabled={!canEdit}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="federal, JAL…"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="source-frequency">Frecuencia</Label>
          <Input
            id="source-frequency"
            name="frequency"
            autoComplete="off"
            spellCheck={false}
            value={frequency}
            disabled={!canEdit}
            onChange={(e) => setFrequency(e.target.value)}
            placeholder="daily, weekly…"
          />
        </div>

        {canEdit ? (
          <ChipInput
            label="Palabras guía"
            values={keywordsGuide}
            onChange={setKeywordsGuide}
            placeholder="Añadir palabra clave…"
          />
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
              Palabras guía
            </p>
            <KeywordChips items={keywordsGuide} />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="source-config">Config (JSON)</Label>
          <textarea
            id="source-config"
            className={textareaClass}
            value={configText}
            disabled={!canEdit}
            onChange={(e) => setConfigText(e.target.value)}
            placeholder='{"connector": "dof", "notes": "…"}'
            spellCheck={false}
          />
        </div>

        {canEdit ? (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={!dirty || saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
            {source.status === 'ACTIVE' ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => setConfirmOff(true)}
              >
                Pausar fuente
              </Button>
            ) : (
              <Button
                type="button"
                variant="signal"
                disabled={busyStatus}
                onClick={() => void toggleStatus()}
              >
                Reanudar fuente
              </Button>
            )}
          </div>
        ) : null}
      </form>

      <Modal
        open={confirmOff}
        onOpenChange={setConfirmOff}
        title={`Pausar ${source.name}?`}
        description="El histórico se conserva. Puedes reanudar después."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmOff(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={busyStatus}
            onClick={() => void toggleStatus()}
          >
            {busyStatus ? 'Pausando…' : 'Pausar'}
          </Button>
        </div>
      </Modal>
    </>
  )
}

export function CreateSourceDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (source: Source) => void
}) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState<SourceType>('DOF')
  const [url, setUrl] = useState('')
  const [section, setSection] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [keywordsGuide, setKeywordsGuide] = useState<string[]>([])
  const [configText, setConfigText] = useState('')
  const [codeTouched, setCodeTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setName('')
      setCode('')
      setType('DOF')
      setUrl('')
      setSection('')
      setJurisdiction('')
      setFrequency('daily')
      setKeywordsGuide([])
      setConfigText('')
      setCodeTouched(false)
    }
  }, [open])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      focusFirstInvalid(form)
      form.reportValidity()
      return
    }
    setSubmitting(true)
    try {
      let config: Record<string, unknown> | null
      try {
        config = parseConfig(configText)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'JSON de config inválido.',
        )
        document.getElementById('new-source-config')?.focus()
        return
      }
      const created = await sourcesApi.create({
        name,
        code,
        type,
        url: url || undefined,
        section: section || undefined,
        jurisdiction: jurisdiction || undefined,
        frequency: frequency || undefined,
        keywordsGuide,
        config,
      })
      toast.success('Fuente creada.')
      onCreated(created)
      onOpenChange(false)
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo crear.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Nueva fuente"
    >
      <form
        className="max-h-[70vh] space-y-4 overflow-y-auto overscroll-contain pr-1"
        onSubmit={onSubmit}
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor="new-source-name">Nombre</Label>
          <Input
            id="new-source-name"
            name="name"
            autoComplete="off"
            required
            value={name}
            onChange={(e) => {
              const v = e.target.value
              setName(v)
              if (!codeTouched) setCode(slugify(v))
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-source-code">Código</Label>
          <Input
            id="new-source-code"
            name="code"
            autoComplete="off"
            spellCheck={false}
            required
            pattern="[a-z0-9-]+"
            className="font-mono"
            value={code}
            onChange={(e) => {
              setCodeTouched(true)
              setCode(e.target.value)
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-source-type">Tipo</Label>
          <Select
            id="new-source-type"
            value={type}
            onValueChange={(v) => setType(v as SourceType)}
            options={SOURCE_TYPE_OPTIONS}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-source-url">URL</Label>
          <Input
            id="new-source-url"
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-source-section">Sección</Label>
            <Input
              id="new-source-section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-source-jurisdiction">Jurisdicción</Label>
            <Input
              id="new-source-jurisdiction"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="federal, JAL…"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-source-frequency">Frecuencia</Label>
          <Input
            id="new-source-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          />
        </div>
        <ChipInput
          label="Palabras guía"
          values={keywordsGuide}
          onChange={setKeywordsGuide}
          placeholder="Añadir palabra clave…"
        />
        <div className="space-y-1.5">
          <Label htmlFor="new-source-config">Config (JSON, opcional)</Label>
          <textarea
            id="new-source-config"
            className={textareaClass}
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            placeholder='{"connector": "dof"}'
            spellCheck={false}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear fuente'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
