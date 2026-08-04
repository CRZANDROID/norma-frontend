import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { clientsApi } from '@/features/clients/api/clients-api'
import type { Client } from '@/features/clients/types/client'
import { sourcesApi } from '@/features/sources/api/sources-api'
import {
  ChipInput,
  KeywordChips,
  StatusBadge,
} from '@/features/sources/components/chips'
import { SectionPathsEditor } from '@/features/sources/components/SectionPathsEditor'
import type {
  Source,
  SourceCategory,
  SourcePlatform,
  SourceSectionPath,
} from '@/features/sources/types/source'
import {
  SOURCE_CATEGORIES,
  SOURCE_CATEGORY_LABELS,
  SOURCE_PLATFORM_LABELS,
  SOURCE_PLATFORMS,
  sectionsEqual,
} from '@/features/sources/types/source'
import { UnsavedChangesGuard } from '@/shared/hooks/unsaved-changes-guard'
import { mapApiError } from '@/shared/lib/api-error'
import { focusFirstInvalid } from '@/shared/lib/form'
import { slugify } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  EntityLinkPicker,
  type EntityLinkOption,
} from '@/shared/ui/entity-link-picker'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Modal } from '@/shared/ui/modal'
import { Select } from '@/shared/ui/select'

const CATEGORY_OPTIONS = SOURCE_CATEGORIES.map((c) => ({
  value: c,
  label: SOURCE_CATEGORY_LABELS[c],
}))

const PLATFORM_OPTIONS = SOURCE_PLATFORMS.map((p) => ({
  value: p,
  label: SOURCE_PLATFORM_LABELS[p],
}))

function clientToOption(client: Pick<Client, 'id' | 'name' | 'slug'>): EntityLinkOption {
  return {
    id: client.id,
    title: client.name,
    subtitle: client.slug,
  }
}

function mergeClientOptions(
  catalog: Client[],
  linked: { id: string; name: string; slug: string }[],
): EntityLinkOption[] {
  const map = new Map<string, EntityLinkOption>()
  for (const c of catalog) map.set(c.id, clientToOption(c))
  for (const c of linked) {
    if (!map.has(c.id)) map.set(c.id, clientToOption(c))
  }
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title))
}

export function SourceDetailHeader({ source }: { source: Source }) {
  const clients = source.clients ?? []

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
          <Badge variant="accent">
            {SOURCE_CATEGORY_LABELS[source.category]}
          </Badge>
          <Badge variant="signal">
            {SOURCE_PLATFORM_LABELS[source.platform]}
          </Badge>
          {source.frequency ? (
            <span className="text-xs text-norma-muted">{source.frequency}</span>
          ) : null}
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
            Clientes vinculados
          </p>
          {clients.length > 0 ? (
            <div
              className="mt-2 flex flex-wrap gap-1.5"
              aria-label="Clientes vinculados"
            >
              {clients.map((client) => (
                <Link
                  key={client.id}
                  to={`/clientes/${client.id}?tab=datos`}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-norma-signal/12 px-2.5 py-1 text-[11px] font-semibold text-norma-signal ring-1 ring-norma-signal/15 transition-colors hover:bg-norma-signal/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
                >
                  <span className="truncate">{client.name}</span>
                  <span className="font-mono text-[10px] opacity-70">
                    {client.slug}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-norma-subtle">
              Ningún cliente usa esta fuente todavía.
            </p>
          )}
          <p className="mt-2 text-xs text-norma-subtle">
            Para agregar o quitar clientes, edítalos desde{' '}
            <Link
              to="/clientes"
              className="font-medium text-norma-signal underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
            >
              Clientes
            </Link>
            .
          </p>
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
  const [category, setCategory] = useState<SourceCategory>(source.category)
  const [platform, setPlatform] = useState<SourcePlatform>(source.platform)
  const [url, setUrl] = useState(source.url ?? '')
  const [frequency, setFrequency] = useState(source.frequency ?? '')
  const [sections, setSections] = useState<SourceSectionPath[]>(source.sections)
  const [keywordsGuide, setKeywordsGuide] = useState(source.keywordsGuide)
  const [saving, setSaving] = useState(false)
  const [confirmOff, setConfirmOff] = useState(false)
  const [busyStatus, setBusyStatus] = useState(false)

  useEffect(() => {
    setName(source.name)
    setCategory(source.category)
    setPlatform(source.platform)
    setUrl(source.url ?? '')
    setFrequency(source.frequency ?? '')
    setSections(source.sections)
    setKeywordsGuide(source.keywordsGuide)
  }, [source])

  const dirty =
    name !== source.name ||
    category !== source.category ||
    platform !== source.platform ||
    url !== (source.url ?? '') ||
    frequency !== (source.frequency ?? '') ||
    !sectionsEqual(sections, source.sections) ||
    keywordsGuide.join('\0') !== source.keywordsGuide.join('\0')

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
      const updated = await sourcesApi.update(source.id, {
        name,
        category,
        platform,
        url: url || null,
        frequency: frequency || null,
        sections,
        keywordsGuide,
      })
      onSaved({ ...updated, clients: updated.clients ?? source.clients })
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
      onSaved({ ...updated, clients: updated.clients ?? source.clients })
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
      <UnsavedChangesGuard when={canEdit && dirty} />
      <form
        className="@container mt-6 space-y-8"
        onSubmit={onSubmit}
        noValidate
      >
        <div className="grid items-start gap-8 @[52rem]:grid-cols-[minmax(16rem,24rem)_minmax(20rem,1fr)]">
          <div className="space-y-4">
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
            <div className="grid gap-4 sm:grid-cols-2 @[52rem]:grid-cols-1">
              <div className="space-y-1.5">
                <Label htmlFor="source-category">Categoría</Label>
                <Select
                  id="source-category"
                  value={category}
                  disabled={!canEdit}
                  onValueChange={(v) => setCategory(v as SourceCategory)}
                  options={CATEGORY_OPTIONS}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="source-platform">Plataforma</Label>
                <Select
                  id="source-platform"
                  value={platform}
                  disabled={!canEdit}
                  onValueChange={(v) => setPlatform(v as SourcePlatform)}
                  options={PLATFORM_OPTIONS}
                />
              </div>
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
          </div>

          <div className="min-w-0 w-full space-y-6 @[52rem]:sticky @[52rem]:top-4">
            <div className="rounded-2xl border-2 border-norma-border bg-norma-raised/50 p-4">
              <SectionPathsEditor
                paths={sections}
                onChange={setSections}
                disabled={!canEdit}
              />
            </div>

            <div className="rounded-2xl border-2 border-norma-border bg-norma-raised/50 p-4">
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
            </div>
          </div>
        </div>

        {canEdit ? (
          <div className="flex flex-wrap gap-2 border-t-2 border-norma-border pt-5">
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
  const [category, setCategory] = useState<SourceCategory>('OFFICIAL')
  const [platform, setPlatform] = useState<SourcePlatform>('WEB')
  const [url, setUrl] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [sections, setSections] = useState<SourceSectionPath[]>([])
  const [keywordsGuide, setKeywordsGuide] = useState<string[]>([])
  const [clientIds, setClientIds] = useState<string[]>([])
  const [clientOptions, setClientOptions] = useState<EntityLinkOption[]>([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [codeTouched, setCodeTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setName('')
      setCode('')
      setCategory('OFFICIAL')
      setPlatform('WEB')
      setUrl('')
      setFrequency('daily')
      setSections([])
      setKeywordsGuide([])
      setClientIds([])
      setClientOptions([])
      setCodeTouched(false)
      return
    }

    let cancelled = false
    setLoadingClients(true)
    void clientsApi
      .list({ status: 'ACTIVE' })
      .then((rows) => {
        if (!cancelled) setClientOptions(mergeClientOptions(rows, []))
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(mapApiError(err, 'No se pudieron cargar los clientes.'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingClients(false)
      })

    return () => {
      cancelled = true
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
      const created = await sourcesApi.create({
        name,
        code,
        category,
        platform,
        url: url || undefined,
        frequency: frequency || undefined,
        sections,
        keywordsGuide,
        clientIds,
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
      description="Catálogo de origen y, opcionalmente, clientes que la usarán."
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-source-category">Categoría</Label>
            <Select
              id="new-source-category"
              value={category}
              onValueChange={(v) => setCategory(v as SourceCategory)}
              options={CATEGORY_OPTIONS}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-source-platform">Plataforma</Label>
            <Select
              id="new-source-platform"
              value={platform}
              onValueChange={(v) => setPlatform(v as SourcePlatform)}
              options={PLATFORM_OPTIONS}
            />
          </div>
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
        <div className="space-y-1.5">
          <Label htmlFor="new-source-frequency">Frecuencia</Label>
          <Input
            id="new-source-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          />
        </div>
        <SectionPathsEditor
          id="new-source-sections"
          paths={sections}
          onChange={setSections}
        />
        <ChipInput
          label="Palabras guía"
          values={keywordsGuide}
          onChange={setKeywordsGuide}
          placeholder="Añadir palabra clave…"
        />

        <EntityLinkPicker
          label="Clientes"
          helper="Opcional. También puedes vincularlos al editar cada cliente."
          options={clientOptions}
          selectedIds={clientIds}
          onChange={setClientIds}
          loading={loadingClients}
          emptyLabel="Aún no hay clientes activos."
          searchPlaceholder="Buscar clientes…"
          compact
        />

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
