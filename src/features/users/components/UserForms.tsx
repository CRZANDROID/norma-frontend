import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { usersApi } from '@/features/users/api/users-api'
import { RoleBadge, StatusBadge } from '@/features/users/components/chips'
import type {
  MembershipClientOption,
  NormaUser,
  UserMembership,
  UserRole,
} from '@/features/users/types/user'
import {
  USER_ROLE_LABELS,
  USER_ROLES,
} from '@/features/users/types/user'
import { UnsavedChangesGuard } from '@/shared/hooks/unsaved-changes-guard'
import { mapApiError } from '@/shared/lib/api-error'
import { focusFirstInvalid } from '@/shared/lib/form'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Modal } from '@/shared/ui/modal'
import { Select } from '@/shared/ui/select'

const ROLE_OPTIONS = USER_ROLES.map((role) => ({
  value: role,
  label: USER_ROLE_LABELS[role],
}))

export function UserDetailHeader({ user }: { user: NormaUser }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-norma-border pb-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-balance">
            {user.name}
          </h2>
          <StatusBadge status={user.status} />
          <RoleBadge role={user.role} />
        </div>
        <p className="mt-1 text-sm text-norma-muted">{user.email}</p>
      </div>
    </div>
  )
}

export function UserRoleForm({
  user,
  canEdit,
  onSaved,
}: {
  user: NormaUser
  canEdit: boolean
  onSaved: (user: NormaUser) => void
}) {
  const [role, setRole] = useState<UserRole>(user.role)
  const [saving, setSaving] = useState(false)
  const [confirmOff, setConfirmOff] = useState(false)
  const [busyStatus, setBusyStatus] = useState(false)

  useEffect(() => {
    setRole(user.role)
  }, [user])

  const dirty = role !== user.role

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
      const updated = await usersApi.updateRole(user.id, { role })
      onSaved(updated)
      toast.success('Rol actualizado.')
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
        user.status === 'ACTIVE'
          ? await usersApi.deactivate(user.id)
          : await usersApi.activate(user.id)
      onSaved(updated)
      toast.success(
        updated.status === 'ACTIVE'
          ? 'Usuario activado.'
          : 'Usuario desactivado.',
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
      <form className="mt-6 max-w-xl space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="user-role">Rol global</Label>
          <Select
            id="user-role"
            value={role}
            disabled={!canEdit}
            onValueChange={(v) => setRole(v as UserRole)}
            options={ROLE_OPTIONS}
          />
        </div>

        {canEdit ? (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={!dirty || saving}>
              {saving ? 'Guardando…' : 'Guardar rol'}
            </Button>
            {user.status === 'ACTIVE' ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => setConfirmOff(true)}
              >
                Desactivar usuario
              </Button>
            ) : (
              <Button
                type="button"
                variant="signal"
                disabled={busyStatus}
                onClick={() => void toggleStatus()}
              >
                Activar usuario
              </Button>
            )}
          </div>
        ) : null}
      </form>

      <Modal
        open={confirmOff}
        onOpenChange={setConfirmOff}
        title={`Desactivar ${user.name}?`}
        description="El acceso de negocio se corta. Puedes reactivar después."
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

function MembershipRow({
  membership,
  canEdit,
  onUpdated,
}: {
  membership: UserMembership
  canEdit: boolean
  onUpdated: (membership: UserMembership) => void
}) {
  const [role, setRole] = useState<UserRole>(membership.role)
  const [saving, setSaving] = useState(false)
  const [busyStatus, setBusyStatus] = useState(false)
  const [confirmOff, setConfirmOff] = useState(false)

  useEffect(() => {
    setRole(membership.role)
  }, [membership])

  const dirty = role !== membership.role

  async function saveRole() {
    if (!canEdit || !dirty) return
    setSaving(true)
    try {
      const updated = await usersApi.updateMembership(membership.id, { role })
      onUpdated(updated)
      toast.success('Membresía actualizada.')
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo guardar.'))
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus() {
    setBusyStatus(true)
    try {
      const nextStatus =
        membership.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      const updated = await usersApi.updateMembership(membership.id, {
        status: nextStatus,
      })
      onUpdated(updated)
      toast.success(
        updated.status === 'ACTIVE'
          ? 'Membresía activada.'
          : 'Membresía desactivada.',
      )
      setConfirmOff(false)
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo completar.'))
    } finally {
      setBusyStatus(false)
    }
  }

  return (
    <li className="rounded-2xl border-2 border-norma-border bg-norma-raised/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{membership.clientName}</p>
          <p className="truncate font-mono text-[11px] text-norma-subtle">
            {membership.clientSlug}
          </p>
        </div>
        <StatusBadge status={membership.status} />
      </div>

      {canEdit ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-[180px] flex-1 space-y-1.5">
            <Label htmlFor={`mem-role-${membership.id}`}>Rol en cliente</Label>
            <Select
              id={`mem-role-${membership.id}`}
              value={role}
              onValueChange={(v) => setRole(v as UserRole)}
              options={ROLE_OPTIONS}
            />
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!dirty || saving}
            onClick={() => void saveRole()}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
          {membership.status === 'ACTIVE' ? (
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={busyStatus}
              onClick={() => setConfirmOff(true)}
            >
              Desactivar
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="signal"
              disabled={busyStatus}
              onClick={() => void toggleStatus()}
            >
              Activar
            </Button>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-norma-muted">
          {USER_ROLE_LABELS[membership.role]}
        </p>
      )}

      <Modal
        open={confirmOff}
        onOpenChange={setConfirmOff}
        title={`Desactivar membresía en ${membership.clientName}?`}
        description="El acceso a este cliente se corta. Puedes reactivar después."
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
    </li>
  )
}

export function UserMemberships({
  user,
  canEdit,
  onUserChange,
}: {
  user: NormaUser
  canEdit: boolean
  onUserChange: (user: NormaUser) => void
}) {
  const [createOpen, setCreateOpen] = useState(false)

  function patchMembership(updated: UserMembership) {
    onUserChange({
      ...user,
      memberships: user.memberships.map((m) =>
        m.id === updated.id ? updated : m,
      ),
    })
  }

  return (
    <div className="mt-8 border-t-2 border-norma-border pt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight text-balance">
            Membresías
          </h3>
          <p className="mt-1 text-sm text-norma-muted">
            Acceso por cliente y rol dentro de cada tenant.
          </p>
        </div>
        {canEdit ? (
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            aria-label="Nueva membresía"
          >
            <Plus className="size-4" />
            Ligar a cliente
          </Button>
        ) : null}
      </div>

      {user.memberships.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-norma-border bg-norma-raised/40 px-4 py-6 text-sm text-norma-muted">
          Este usuario aún no tiene membresías en clientes.
        </p>
      ) : (
        <ul className="space-y-3">
          {user.memberships.map((membership) => (
            <MembershipRow
              key={membership.id}
              membership={membership}
              canEdit={canEdit}
              onUpdated={patchMembership}
            />
          ))}
        </ul>
      )}

      <CreateMembershipDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        user={user}
        onCreated={(membership) => {
          onUserChange({
            ...user,
            memberships: [...user.memberships, membership],
          })
        }}
      />
    </div>
  )
}

function CreateMembershipDialog({
  open,
  onOpenChange,
  user,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: NormaUser
  onCreated: (membership: UserMembership) => void
}) {
  const [clients, setClients] = useState<MembershipClientOption[]>([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [clientId, setClientId] = useState<string | undefined>(undefined)
  const [role, setRole] = useState<UserRole>('ANALYST')
  const [submitting, setSubmitting] = useState(false)

  const linkedClientIds = useMemo(
    () => new Set(user.memberships.map((m) => m.clientId)),
    [user.memberships],
  )

  const availableClients = useMemo(
    () => clients.filter((c) => !linkedClientIds.has(c.id)),
    [clients, linkedClientIds],
  )

  const clientOptions = useMemo(
    () =>
      availableClients.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.slug})`,
      })),
    [availableClients],
  )

  useEffect(() => {
    if (!open) {
      setClientId(undefined)
      setRole('ANALYST')
      setClients([])
      return
    }

    let cancelled = false
    setLoadingClients(true)
    void usersApi
      .listClientsForMembership()
      .then((rows) => {
        if (cancelled) return
        setClients(rows)
        const available = rows.filter((c) => !linkedClientIds.has(c.id))
        setClientId(available[0]?.id)
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
    // linkedClientIds read when dialog opens; sync effect below keeps selection valid
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch on open
  }, [open])

  useEffect(() => {
    if (!open || availableClients.length === 0) return
    if (!clientId || !availableClients.some((c) => c.id === clientId)) {
      setClientId(availableClients[0].id)
    }
  }, [open, availableClients, clientId])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      focusFirstInvalid(form)
      form.reportValidity()
      return
    }
    if (!clientId) return
    setSubmitting(true)
    try {
      const created = await usersApi.createMembership(user.id, {
        clientId,
        role,
      })
      toast.success('Membresía creada.')
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
      title="Ligar a cliente"
      description={`Asignar acceso de ${user.name} a un cliente.`}
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="new-mem-client">Cliente</Label>
          {loadingClients ? (
            <p className="text-sm text-norma-muted">Cargando clientes…</p>
          ) : availableClients.length === 0 ? (
            <p className="text-sm text-norma-muted">
              No hay clientes disponibles para ligar.
            </p>
          ) : clientId ? (
            <Select
              id="new-mem-client"
              value={clientId}
              onValueChange={setClientId}
              options={clientOptions}
            />
          ) : (
            <p className="text-sm text-norma-muted">Cargando clientes…</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-mem-role">Rol en cliente</Label>
          <Select
            id="new-mem-role"
            value={role}
            onValueChange={(v) => setRole(v as UserRole)}
            options={ROLE_OPTIONS}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              submitting || loadingClients || availableClients.length === 0
            }
          >
            {submitting ? 'Guardando…' : 'Crear membresía'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (user: NormaUser) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('ANALYST')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setName('')
      setEmail('')
      setPassword('')
      setRole('ANALYST')
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
      const created = await usersApi.create({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      })
      toast.success('Usuario creado.')
      onCreated(created)
      onOpenChange(false)
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo crear el usuario.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo usuario"
      description="Crea una cuenta con contraseña. Luego puedes ligarla a un cliente."
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="new-user-name">Nombre</Label>
          <Input
            id="new-user-name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-user-email">Correo</Label>
          <Input
            id="new-user-email"
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-user-password">Contraseña</Label>
          <Input
            id="new-user-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-norma-muted">Mínimo 8 caracteres.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-user-role">Rol global</Label>
          <Select
            id="new-user-role"
            value={role}
            onValueChange={(v) => setRole(v as UserRole)}
            options={ROLE_OPTIONS}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
