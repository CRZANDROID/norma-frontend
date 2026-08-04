import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import type { RegulatoryProfile } from '@/features/clients/types/client'
import { mapApiError } from '@/shared/lib/api-error'
import { clientsApi } from '@/features/clients/api/clients-api'
import {
  ChipInput,
  KeywordChips,
  StatusBadge,
} from '@/features/clients/components/chips'
import { UnsavedChangesGuard } from '@/shared/hooks/unsaved-changes-guard'
import { UnsavedChangesDialog } from '@/shared/ui/unsaved-changes-dialog'
import { focusFirstInvalid } from '@/shared/lib/form'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Modal } from '@/shared/ui/modal'
import { EmptyState } from '@/shared/ui/page'

export function ProfileList({
  profiles,
  canEdit,
  canToggleStatus,
  onChanged,
  onCreate,
}: {
  profiles: RegulatoryProfile[]
  /** Crear / editar — ADMIN | ANALYST */
  canEdit: boolean
  /** Activar / desactivar — solo ADMIN (contrato Nest) */
  canToggleStatus: boolean
  onChanged: () => void
  onCreate: () => void
}) {
  const [editing, setEditing] = useState<RegulatoryProfile | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function toggleStatus(profile: RegulatoryProfile) {
    if (!canToggleStatus) return
    setBusy(true)
    try {
      if (profile.status === 'ACTIVE') {
        await clientsApi.deactivateProfile(profile.id)
        toast.success('Perfil desactivado.')
      } else {
        await clientsApi.activateProfile(profile.id)
        toast.success('Perfil activado.')
      }
      setConfirmId(null)
      onChanged()
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo completar.'))
    } finally {
      setBusy(false)
    }
  }

  if (!profiles.length) {
    return (
      <div className="mt-6">
        <EmptyState
          title="Sin perfil regulatorio"
          description="Este cliente aún no tiene perfil regulatorio. Crea uno para guiar la relevancia del agente."
          actionLabel={canEdit ? 'Nuevo perfil' : undefined}
          onAction={canEdit ? onCreate : undefined}
        />
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-end">
        {canEdit ? (
          <Button onClick={onCreate}>Nuevo perfil</Button>
        ) : null}
      </div>
      {profiles.map((profile) => (
        <article
          key={profile.id}
          className="rounded-3xl border-2 border-norma-border bg-norma-raised p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-semibold text-balance">
                  {profile.name}
                </h3>
                <StatusBadge status={profile.status} />
              </div>
              {profile.description ? (
                <p className="mt-1 text-sm text-norma-muted">
                  {profile.description}
                </p>
              ) : null}
            </div>
            {canEdit || canToggleStatus ? (
              <div className="flex gap-2">
                {canEdit ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(profile)}
                  >
                    Editar
                  </Button>
                ) : null}
                {canToggleStatus ? (
                  profile.status === 'ACTIVE' ? (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setConfirmId(profile.id)}
                    >
                      Desactivar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="signal"
                      disabled={busy}
                      onClick={() => void toggleStatus(profile)}
                    >
                      Activar
                    </Button>
                  )
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-norma-subtle">
                Señales del agente
              </p>
              <KeywordChips items={profile.keywords} />
            </div>
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-norma-subtle">
                Categorías
              </p>
              <KeywordChips items={profile.categories} tone="accent" />
            </div>
          </div>
        </article>
      ))}

      <ProfileFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
        clientId={editing?.clientId ?? ''}
        initial={editing}
        onSaved={() => {
          setEditing(null)
          onChanged()
        }}
      />

      <Modal
        open={Boolean(confirmId)}
        onOpenChange={(open) => {
          if (!open) setConfirmId(null)
        }}
        title="Desactivar perfil?"
        description="El histórico se conserva. Puedes reactivar después."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmId(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => {
              const profile = profiles.find((p) => p.id === confirmId)
              if (profile) void toggleStatus(profile)
            }}
          >
            Desactivar
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export function ProfileFormDialog({
  open,
  onOpenChange,
  clientId,
  initial,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  initial?: RegulatoryProfile | null
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [productCats, setProductCats] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setDescription(initial?.description ?? '')
    setKeywords(initial?.keywords ?? [])
    setCategories(initial?.categories ?? [])
    setProductCats(initial?.products?.categories ?? [])
    setDiscardOpen(false)
  }, [open, initial])

  const baselineName = initial?.name ?? ''
  const baselineDescription = initial?.description ?? ''
  const baselineKeywords = initial?.keywords ?? []
  const baselineCategories = initial?.categories ?? []
  const baselineProducts = initial?.products?.categories ?? []

  const dirty =
    open &&
    (name !== baselineName ||
      description !== baselineDescription ||
      keywords.join('\0') !== baselineKeywords.join('\0') ||
      categories.join('\0') !== baselineCategories.join('\0') ||
      productCats.join('\0') !== baselineProducts.join('\0'))

  function handleOpenChange(next: boolean) {
    if (!next && dirty) {
      setDiscardOpen(true)
      return
    }
    onOpenChange(next)
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      focusFirstInvalid(form)
      form.reportValidity()
      return
    }
    setSubmitting(true)
    const payload = {
      name,
      description: description || undefined,
      keywords,
      categories,
      products: productCats.length ? { categories: productCats } : null,
    }
    try {
      if (initial) {
        await clientsApi.updateProfile(initial.id, payload)
        toast.success('Perfil actualizado.')
      } else {
        await clientsApi.createProfile(clientId, payload)
        toast.success('Perfil creado.')
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo guardar el perfil.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <UnsavedChangesGuard when={dirty} />
      <UnsavedChangesDialog
        open={discardOpen}
        onStay={() => setDiscardOpen(false)}
        onLeave={() => {
          setDiscardOpen(false)
          onOpenChange(false)
        }}
      />
      <Modal
        open={open}
        onOpenChange={handleOpenChange}
        title={initial ? 'Editar perfil' : 'Nuevo perfil'}
        description="Define qué señales escucha el agente para este cliente."
        className="w-[min(92vw,560px)]"
      >
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Nombre</Label>
            <Input
              id="profile-name"
              name="name"
              autoComplete="off"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-desc">Descripción</Label>
            <Input
              id="profile-desc"
              name="description"
              autoComplete="off"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <ChipInput
            label="Keywords"
            values={keywords}
            onChange={setKeywords}
            placeholder="ej. etiquetado"
            helper="Señales que el agente buscará en fuentes"
          />
          <ChipInput
            label="Categorías"
            values={categories}
            onChange={setCategories}
            placeholder="ej. salud"
          />
          <ChipInput
            label="Productos"
            values={productCats}
            onChange={setProductCats}
            placeholder="ej. refrescos"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear perfil'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
