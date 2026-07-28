import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import type { Client } from '@/features/clients/types/client'
import { clientsApi } from '@/features/clients/api/clients-api'
import { slugify } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Modal } from '@/shared/ui/modal'
import { StatusBadge } from '@/features/clients/components/chips'

export function ClientDetailHeader({ client }: { client: Client }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-norma-border pb-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {client.name}
          </h2>
          <StatusBadge status={client.status} />
        </div>
        <p className="mt-1 font-mono text-xs text-norma-subtle">{client.slug}</p>
      </div>
    </div>
  )
}

export function ClientDataForm({
  client,
  canEdit,
  onSaved,
}: {
  client: Client
  canEdit: boolean
  onSaved: (client: Client) => void
}) {
  const [name, setName] = useState(client.name)
  const [email, setEmail] = useState(client.email ?? '')
  const [phone, setPhone] = useState(client.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [confirmOff, setConfirmOff] = useState(false)
  const [busyStatus, setBusyStatus] = useState(false)

  useEffect(() => {
    setName(client.name)
    setEmail(client.email ?? '')
    setPhone(client.phone ?? '')
  }, [client])

  const dirty =
    name !== client.name ||
    email !== (client.email ?? '') ||
    phone !== (client.phone ?? '')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canEdit || !dirty) return
    setSaving(true)
    try {
      const updated = await clientsApi.update(client.id, {
        name,
        email: email || null,
        phone: phone || null,
      })
      onSaved(updated)
      toast.success('Cambios guardados.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar.')
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
      toast.error(err instanceof Error ? err.message : 'No se pudo completar.')
    } finally {
      setBusyStatus(false)
    }
  }

  return (
    <>
      <form className="mt-6 max-w-lg space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="client-name">Nombre</Label>
          <Input
            id="client-name"
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
            value={client.slug}
            disabled
            className="font-mono text-norma-subtle"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="client-email">Correo</Label>
          <Input
            id="client-email"
            type="email"
            value={email}
            disabled={!canEdit}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="client-phone">Teléfono</Label>
          <Input
            id="client-phone"
            type="tel"
            value={phone}
            disabled={!canEdit}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {canEdit ? (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={!dirty || saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
            {client.status === 'ACTIVE' ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => setConfirmOff(true)}
              >
                Desactivar cliente
              </Button>
            ) : (
              <Button
                type="button"
                variant="signal"
                disabled={busyStatus}
                onClick={() => void toggleStatus()}
              >
                Activar cliente
              </Button>
            )}
          </div>
        ) : null}
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
  const [slugTouched, setSlugTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setName('')
      setSlug('')
      setEmail('')
      setPhone('')
      setSlugTouched(false)
    }
  }, [open])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const created = await clientsApi.create({
        name,
        slug,
        email: email || undefined,
        phone: phone || undefined,
      })
      toast.success('Cliente creado.')
      onCreated(created)
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo crear.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo cliente"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="new-name">Nombre</Label>
          <Input
            id="new-name"
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-phone">Teléfono</Label>
          <Input
            id="new-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
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
