import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Save } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import type {
  Client,
  ClientDetail,
  ClientFiscalData,
  ClientFiscalInput,
} from '@/features/clients/types/client'
import { clientsApi } from '@/features/clients/api/clients-api'
import { sourcesApi } from '@/features/sources/api/sources-api'
import {
  SOURCE_CATEGORY_LABELS,
  SOURCE_PLATFORM_LABELS,
  type Source,
  type SourceCategory,
  type SourcePlatform,
} from '@/features/sources/types/source'
import { UnsavedChangesGuard } from '@/shared/hooks/unsaved-changes-guard'
import { mapApiError } from '@/shared/lib/api-error'
import { focusFirstInvalid } from '@/shared/lib/form'
import { duration, easeOut } from '@/shared/lib/motion'
import { cn, slugify } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  EntityLinkPicker,
  linkIdsDirty,
  type EntityLinkOption,
} from '@/shared/ui/entity-link-picker'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Modal } from '@/shared/ui/modal'
import { StatusBadge } from '@/features/clients/components/chips'
import {
  ContactListEditor,
  contactsDirty,
  contactsFromApi,
  contactsToInput,
  type ContactDraft,
} from '@/features/clients/components/ContactListEditor'

/** RFC persona moral/física MX (12–13). */
const RFC_PATTERN = '^[A-Za-zÑñ&]{3,4}\\d{6}[A-Za-z0-9]{3}$'

type FiscalFormState = {
  legalName: string
  rfc: string
  postalCode: string
  cfdi: string
  taxRegime: string
}

const emptyFiscal: FiscalFormState = {
  legalName: '',
  rfc: '',
  postalCode: '',
  cfdi: '',
  taxRegime: '',
}

function fiscalFromData(data: ClientFiscalData | null | undefined): FiscalFormState {
  if (!data) return { ...emptyFiscal }
  return {
    legalName: data.legalName ?? '',
    rfc: data.rfc ?? '',
    postalCode: data.postalCode ?? '',
    cfdi: data.cfdi ?? '',
    taxRegime: data.taxRegime ?? '',
  }
}

function fiscalDirty(current: FiscalFormState, baseline: FiscalFormState) {
  return (
    current.legalName !== baseline.legalName ||
    current.rfc.toUpperCase() !== baseline.rfc.toUpperCase() ||
    current.postalCode !== baseline.postalCode ||
    current.cfdi !== baseline.cfdi ||
    current.taxRegime !== baseline.taxRegime
  )
}

function fiscalHasAny(f: FiscalFormState) {
  return Boolean(
    f.legalName.trim() ||
      f.rfc.trim() ||
      f.postalCode.trim() ||
      f.cfdi.trim() ||
      f.taxRegime.trim(),
  )
}

/** Construye payload `fiscal` o undefined si todo vacío (omitir en create). */
function buildFiscalPayload(f: FiscalFormState): ClientFiscalInput | undefined {
  if (!fiscalHasAny(f)) return undefined
  return {
    legalName: f.legalName.trim(),
    rfc: f.rfc.trim().toUpperCase(),
    postalCode: f.postalCode.trim(),
    cfdi: f.cfdi.trim(),
    taxRegime: f.taxRegime.trim(),
  }
}

function FiscalFields({
  idPrefix,
  values,
  disabled,
  onChange,
}: {
  idPrefix: string
  values: FiscalFormState
  disabled?: boolean
  onChange: (next: FiscalFormState) => void
}) {
  function patch(partial: Partial<FiscalFormState>) {
    onChange({ ...values, ...partial })
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
          Datos fiscales
        </p>
        <p className="mt-0.5 text-xs text-norma-subtle">
          Razón social, RFC, CP, uso CFDI y régimen (SAT). Opcional.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-legal-name`}>Razón social</Label>
        <Input
          id={`${idPrefix}-legal-name`}
          name="legalName"
          autoComplete="organization"
          value={values.legalName}
          disabled={disabled}
          onChange={(e) => patch({ legalName: e.target.value })}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-rfc`}>RFC</Label>
          <Input
            id={`${idPrefix}-rfc`}
            name="rfc"
            autoComplete="off"
            spellCheck={false}
            className="font-mono uppercase"
            value={values.rfc}
            disabled={disabled}
            pattern={RFC_PATTERN}
            title="RFC mexicano de 12 o 13 caracteres"
            onChange={(e) => patch({ rfc: e.target.value.toUpperCase() })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-postal`}>Código postal</Label>
          <Input
            id={`${idPrefix}-postal`}
            name="postalCode"
            inputMode="numeric"
            autoComplete="postal-code"
            className="font-mono"
            value={values.postalCode}
            disabled={disabled}
            pattern="\d{5}"
            maxLength={5}
            title="5 dígitos"
            onChange={(e) =>
              patch({ postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })
            }
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-cfdi`}>Uso CFDI</Label>
          <Input
            id={`${idPrefix}-cfdi`}
            name="cfdi"
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
            placeholder="G03"
            value={values.cfdi}
            disabled={disabled}
            onChange={(e) => patch({ cfdi: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-tax-regime`}>Régimen fiscal</Label>
          <Input
            id={`${idPrefix}-tax-regime`}
            name="taxRegime"
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
            placeholder="601"
            value={values.taxRegime}
            disabled={disabled}
            onChange={(e) => patch({ taxRegime: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

function sourceToOption(
  source: Pick<Source, 'id' | 'name' | 'code' | 'category' | 'platform'>,
): EntityLinkOption {
  return {
    id: source.id,
    title: source.name,
    subtitle: source.code,
    meta: `${SOURCE_CATEGORY_LABELS[source.category as SourceCategory] ?? source.category} · ${SOURCE_PLATFORM_LABELS[source.platform as SourcePlatform] ?? source.platform}`,
  }
}

function mergeSourceOptions(
  catalog: Source[],
  linked: {
    id: string
    name: string
    code: string
    category: string
    platform: string
  }[],
): EntityLinkOption[] {
  const map = new Map<string, EntityLinkOption>()
  for (const s of catalog) map.set(s.id, sourceToOption(s))
  for (const s of linked) {
    if (!map.has(s.id)) {
      map.set(
        s.id,
        sourceToOption({
          id: s.id,
          name: s.name,
          code: s.code,
          category: s.category as SourceCategory,
          platform: s.platform as SourcePlatform,
        }),
      )
    }
  }
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title))
}

export function ClientDetailHeader({
  client,
}: {
  client: Client | ClientDetail
}) {
  const sources = client.sources ?? []

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-norma-border pb-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-balance">
            {client.name}
          </h2>
          <StatusBadge status={client.status} />
        </div>
        <p className="mt-1 font-mono text-xs text-norma-subtle">{client.slug}</p>
        {sources.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Fuentes vinculadas">
            {sources.map((source) => (
              <Link
                key={source.id}
                to={`/fuentes/${source.id}`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-norma-signal/12 px-2.5 py-1 text-[11px] font-semibold text-norma-signal ring-1 ring-norma-signal/15 transition-colors hover:bg-norma-signal/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
              >
                <span className="truncate">{source.name}</span>
                <span className="font-mono text-[10px] opacity-70">{source.code}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-norma-subtle">
            Sin fuentes vinculadas todavía.
          </p>
        )}
        <Link
          to={`/clientes/${client.id}/semaforo`}
          className="mt-4 inline-flex items-center rounded-xl border-2 border-norma-border bg-norma-raised px-3 py-2 text-xs font-medium text-norma-signal transition-colors hover:border-norma-signal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
        >
          Semáforo y canales
        </Link>
      </div>
    </div>
  )
}

export function ClientDataForm({
  client,
  canEdit,
  onSaved,
}: {
  client: ClientDetail
  canEdit: boolean
  onSaved: (client: Client) => void
}) {
  const [name, setName] = useState(client.name)
  const [email, setEmail] = useState(client.email ?? '')
  const [phone, setPhone] = useState(client.phone ?? '')
  const baselineFiscal = useMemo(
    () => fiscalFromData(client.fiscalData),
    [client.fiscalData],
  )
  const [fiscal, setFiscal] = useState(baselineFiscal)
  const baselineSourceIds = useMemo(
    () => (client.sources ?? []).map((s) => s.id),
    [client.sources],
  )
  const [sourceIds, setSourceIds] = useState(baselineSourceIds)
  const baselineContacts = useMemo(
    () => contactsFromApi(client.contacts),
    [client.contacts],
  )
  const [contacts, setContacts] = useState<ContactDraft[]>(baselineContacts)
  const [sourceOptions, setSourceOptions] = useState<EntityLinkOption[]>([])
  const [loadingSources, setLoadingSources] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmOff, setConfirmOff] = useState(false)
  const [busyStatus, setBusyStatus] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    setName(client.name)
    setEmail(client.email ?? '')
    setPhone(client.phone ?? '')
    setFiscal(fiscalFromData(client.fiscalData))
    setSourceIds((client.sources ?? []).map((s) => s.id))
    setContacts(contactsFromApi(client.contacts))
  }, [client])

  const linkedSourceKey = baselineSourceIds.slice().sort().join(',')

  useEffect(() => {
    let cancelled = false
    setLoadingSources(true)
    void sourcesApi
      .list({ status: 'ACTIVE' })
      .then((rows) => {
        if (cancelled) return
        setSourceOptions(mergeSourceOptions(rows, client.sources ?? []))
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(mapApiError(err, 'No se pudieron cargar las fuentes.'))
          setSourceOptions(mergeSourceOptions([], client.sources ?? []))
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSources(false)
      })
    return () => {
      cancelled = true
    }
    // linkedSourceKey tracks membership changes without depending on array identity
    // eslint-disable-next-line react-hooks/exhaustive-deps -- catalog refresh on client/links
  }, [client.id, linkedSourceKey])

  const dirty =
    name !== client.name ||
    email !== (client.email ?? '') ||
    phone !== (client.phone ?? '') ||
    fiscalDirty(fiscal, baselineFiscal) ||
    linkIdsDirty(sourceIds, baselineSourceIds) ||
    contactsDirty(contacts, baselineContacts)

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
      const fiscalChanged = fiscalDirty(fiscal, baselineFiscal)
      const fiscalPayload = buildFiscalPayload(fiscal)
      if (
        fiscalChanged &&
        fiscalHasAny(fiscal) &&
        (!fiscalPayload?.legalName ||
          !fiscalPayload.rfc ||
          !fiscalPayload.postalCode ||
          !fiscalPayload.cfdi ||
          !fiscalPayload.taxRegime)
      ) {
        toast.error('Completa todos los datos fiscales o déjalos vacíos.')
        return
      }
      const contactsChanged = contactsDirty(contacts, baselineContacts)
      for (const c of contacts) {
        if (c.name.trim().length < 2 || c.phone.trim().length < 7) {
          toast.error(
            'Cada contacto necesita nombre (≥2) y teléfono (≥7 caracteres).',
          )
          return
        }
      }
      const updated = await clientsApi.update(client.id, {
        name,
        email: email || null,
        phone: phone || null,
        sourceIds,
        ...(fiscalChanged && fiscalPayload ? { fiscal: fiscalPayload } : {}),
        ...(contactsChanged ? { contacts: contactsToInput(contacts) } : {}),
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
        client.status === 'ACTIVE'
          ? await clientsApi.deactivate(client.id)
          : await clientsApi.activate(client.id)
      onSaved(updated)
      toast.success(
        updated.status === 'ACTIVE' ? 'Cliente activado.' : 'Cliente desactivado.',
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
        className={cn('@container mt-6 space-y-8', dirty && canEdit && 'pb-24')}
        onSubmit={onSubmit}
        noValidate
      >
        <div className="grid items-start gap-8 @[52rem]:grid-cols-[minmax(16rem,22rem)_minmax(22rem,1fr)]">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="client-name">Nombre</Label>
              <Input
                id="client-name"
                name="name"
                autoComplete="organization"
                value={name}
                disabled={!canEdit}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-slug">Slug</Label>
              <Input
                id="client-slug"
                name="slug"
                autoComplete="off"
                spellCheck={false}
                value={client.slug}
                disabled
                className="font-mono text-norma-subtle"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-email">Correo</Label>
              <Input
                id="client-email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                value={email}
                disabled={!canEdit}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-phone">Teléfono</Label>
              <Input
                id="client-phone"
                name="tel"
                type="tel"
                autoComplete="tel"
                value={phone}
                disabled={!canEdit}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="min-w-0 w-full @[52rem]:sticky @[52rem]:top-4">
            <div className="rounded-2xl border-2 border-norma-border bg-norma-raised/50 p-4">
              <FiscalFields
                idPrefix="client"
                values={fiscal}
                disabled={!canEdit}
                onChange={setFiscal}
              />
            </div>
          </div>
        </div>

        <ContactListEditor
          contacts={contacts}
          onChange={setContacts}
          disabled={!canEdit}
        />

        <EntityLinkPicker
          label="Fuentes de monitoreo"
          helper="Orígenes donde el agente buscará regulaciones para este cliente."
          options={sourceOptions}
          selectedIds={sourceIds}
          onChange={setSourceIds}
          loading={loadingSources}
          disabled={!canEdit}
          emptyLabel="Aún no hay fuentes activas. Crea una en Fuentes."
          searchPlaceholder="Buscar por nombre, código o tipo…"
          defaultOpen
        />

        {canEdit ? (
          <div className="flex flex-col gap-3 border-t-2 border-norma-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-norma-fg">
                Guardar cambios del cliente
              </p>
              <p className="text-xs text-norma-subtle">
                Aplica datos, fiscales, contactos y fuentes de monitoreo.
              </p>
            </div>
            <Button
              type="submit"
              className="shrink-0 self-start sm:self-center"
              disabled={!dirty || saving}
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        ) : null}

        {canEdit ? (
          <div className="rounded-2xl border border-norma-coral/25 bg-norma-coral/[0.06] px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-norma-fg">
                  {client.status === 'ACTIVE'
                    ? 'Desactivar cliente'
                    : 'Activar cliente'}
                </p>
                <p className="text-xs text-norma-subtle">
                  {client.status === 'ACTIVE'
                    ? 'El histórico se conserva. Puedes reactivar después.'
                    : 'Vuelve a habilitar este cliente en el piloto.'}
                </p>
              </div>
              {client.status === 'ACTIVE' ? (
                <Button
                  type="button"
                  variant="danger"
                  className="shrink-0 self-start sm:self-center"
                  onClick={() => setConfirmOff(true)}
                >
                  Desactivar cliente
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="signal"
                  className="shrink-0 self-start sm:self-center"
                  disabled={busyStatus}
                  onClick={() => void toggleStatus()}
                >
                  Activar cliente
                </Button>
              )}
            </div>
          </div>
        ) : null}

        <AnimatePresence>
          {canEdit && dirty ? (
            <motion.div
              key="floating-save"
              role="status"
              aria-live="polite"
              initial={
                reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      y: 12,
                      scale: 0.98,
                      transition: { duration: duration.fast, ease: easeOut },
                    }
              }
              transition={{ duration: duration.ui, ease: easeOut }}
              className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
            >
              <div className="pointer-events-auto flex max-w-lg items-center gap-3 rounded-2xl border-2 border-norma-accent/30 bg-norma-surface/95 px-4 py-3 shadow-[0_16px_40px_-12px_rgba(13,27,42,0.35)] backdrop-blur-md">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-norma-fg">
                    Cambios sin guardar
                  </p>
                  <p className="text-[11px] text-norma-subtle">
                    Datos, fiscales, contactos o fuentes.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="shrink-0 gap-1.5 shadow-[0_10px_28px_-12px_rgba(105,88,248,0.75)]"
                >
                  <Save className="size-4" aria-hidden />
                  {saving ? 'Guardando…' : 'Guardar'}
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </form>

      <Modal
        open={confirmOff}
        onOpenChange={setConfirmOff}
        title={`Desactivar ${client.name}?`}
        description="El histórico se conserva. Puedes reactivar después."
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
            {busyStatus ? 'Desactivando…' : 'Desactivar'}
          </Button>
        </div>
      </Modal>
    </>
  )
}

export function CreateClientDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (client: Client) => void
}) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [fiscal, setFiscal] = useState<FiscalFormState>({ ...emptyFiscal })
  const [contacts, setContacts] = useState<ContactDraft[]>([])
  const [sourceIds, setSourceIds] = useState<string[]>([])
  const [sourceOptions, setSourceOptions] = useState<EntityLinkOption[]>([])
  const [loadingSources, setLoadingSources] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setName('')
      setSlug('')
      setEmail('')
      setPhone('')
      setFiscal({ ...emptyFiscal })
      setContacts([])
      setSourceIds([])
      setSourceOptions([])
      setSlugTouched(false)
      return
    }

    let cancelled = false
    setLoadingSources(true)
    void sourcesApi
      .list({ status: 'ACTIVE' })
      .then((rows) => {
        if (!cancelled) setSourceOptions(mergeSourceOptions(rows, []))
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(mapApiError(err, 'No se pudieron cargar las fuentes.'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSources(false)
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
      const fiscalPayload = buildFiscalPayload(fiscal)
      if (
        fiscalHasAny(fiscal) &&
        (!fiscalPayload?.legalName ||
          !fiscalPayload.rfc ||
          !fiscalPayload.postalCode ||
          !fiscalPayload.cfdi ||
          !fiscalPayload.taxRegime)
      ) {
        toast.error('Completa todos los datos fiscales o déjalos vacíos.')
        setSubmitting(false)
        return
      }
      for (const c of contacts) {
        if (c.name.trim().length < 2 || c.phone.trim().length < 7) {
          toast.error(
            'Cada contacto necesita nombre (≥2) y teléfono (≥7 caracteres).',
          )
          setSubmitting(false)
          return
        }
      }
      const created = await clientsApi.create({
        name,
        slug,
        email: email || undefined,
        phone: phone || undefined,
        sourceIds,
        ...(fiscalPayload ? { fiscal: fiscalPayload } : {}),
        ...(contacts.length > 0 ? { contacts: contactsToInput(contacts) } : {}),
      })
      toast.success('Cliente creado.')
      onCreated(created)
      onOpenChange(false)
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo crear el cliente.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo cliente"
      description="Define el tenant y el catálogo de fuentes a monitorear."
    >
      <form
        className="max-h-[70vh] space-y-4 overflow-y-auto overscroll-contain pr-1"
        onSubmit={onSubmit}
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor="new-name">Nombre</Label>
          <Input
            id="new-name"
            name="name"
            autoComplete="organization"
            required
            value={name}
            onChange={(e) => {
              const v = e.target.value
              setName(v)
              if (!slugTouched) setSlug(slugify(v))
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-slug">Slug</Label>
          <Input
            id="new-slug"
            name="slug"
            autoComplete="off"
            spellCheck={false}
            required
            pattern="[a-z0-9-]+"
            className="font-mono"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value)
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-email">Correo</Label>
          <Input
            id="new-email"
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-phone">Teléfono</Label>
          <Input
            id="new-phone"
            name="tel"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="border-t border-norma-border/80 pt-4">
          <FiscalFields
            idPrefix="new-client"
            values={fiscal}
            onChange={setFiscal}
          />
        </div>

        <ContactListEditor
          contacts={contacts}
          onChange={setContacts}
          compact
        />

        <EntityLinkPicker
          label="Fuentes de monitoreo"
          helper="Opcional. Puedes ajustarlas después al editar el cliente."
          options={sourceOptions}
          selectedIds={sourceIds}
          onChange={setSourceIds}
          loading={loadingSources}
          emptyLabel="Aún no hay fuentes activas."
          searchPlaceholder="Buscar fuentes…"
          compact
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
