import { useId, useState, type KeyboardEvent } from 'react'
import { Mail, Phone, Plus, UserRound, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ClientContactInput } from '@/features/clients/types/client'
import { duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export type ContactDraft = {
  key: string
  name: string
  phone: string
  email: string
}

type ContactListEditorProps = {
  contacts: ContactDraft[]
  onChange: (next: ContactDraft[]) => void
  disabled?: boolean
  compact?: boolean
}

function newKey() {
  return `c_${Math.random().toString(36).slice(2, 10)}`
}

export function contactsFromApi(
  rows: { name: string; phone: string; email?: string | null }[] | undefined,
): ContactDraft[] {
  return (rows ?? []).map((c) => ({
    key: newKey(),
    name: c.name,
    phone: c.phone,
    email: c.email ?? '',
  }))
}

export function contactsToInput(rows: ContactDraft[]): ClientContactInput[] {
  return rows.map((c) => ({
    name: c.name.trim(),
    phone: c.phone.trim(),
    ...(c.email.trim() ? { email: c.email.trim() } : {}),
  }))
}

export function contactsDirty(a: ContactDraft[], b: ContactDraft[]) {
  if (a.length !== b.length) return true
  return a.some(
    (row, i) =>
      row.name !== b[i].name ||
      row.phone !== b[i].phone ||
      row.email !== b[i].email,
  )
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function ContactListEditor({
  contacts,
  onChange,
  disabled = false,
  compact = false,
}: ContactListEditorProps) {
  const reduceMotion = useReducedMotion()
  const formId = useId()
  const [draftName, setDraftName] = useState('')
  const [draftPhone, setDraftPhone] = useState('')
  const [draftEmail, setDraftEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)

  function resetDraft() {
    setDraftName('')
    setDraftPhone('')
    setDraftEmail('')
    setError(null)
  }

  function addContact() {
    if (disabled) return
    const name = draftName.trim()
    const phone = draftPhone.trim()
    const email = draftEmail.trim()
    if (name.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.')
      return
    }
    if (phone.length < 7) {
      setError('El teléfono debe tener al menos 7 caracteres.')
      return
    }
    onChange([
      ...contacts,
      { key: newKey(), name, phone, email },
    ])
    resetDraft()
  }

  function onComposerKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addContact()
    }
  }

  function removeContact(key: string) {
    if (disabled) return
    onChange(contacts.filter((c) => c.key !== key))
    if (editingKey === key) setEditingKey(null)
  }

  function updateContact(key: string, patch: Partial<ContactDraft>) {
    onChange(
      contacts.map((c) => (c.key === key ? { ...c, ...patch } : c)),
    )
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
            Contactos
          </p>
          <p className="text-xs text-norma-subtle">
            Personas de enlace del cliente. 
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums',
            contacts.length > 0
              ? 'bg-norma-accent/12 text-norma-accent ring-1 ring-norma-accent/20'
              : 'bg-norma-navy/6 text-norma-subtle',
          )}
          aria-live="polite"
        >
          <UserRound className="size-3" aria-hidden />
          {contacts.length}{' '}
          {contacts.length === 1 ? 'contacto' : 'contactos'}
        </span>
      </div>

      <div
        className={cn(
          'overflow-hidden rounded-2xl border-2 border-norma-border bg-norma-raised/50',
          disabled && 'opacity-60',
        )}
      >
        {!disabled ? (
          <div className="space-y-2 border-b border-norma-border/80 p-3">
            <div
              className={cn(
                'grid gap-2',
                compact
                  ? 'grid-cols-1'
                  : 'sm:grid-cols-[1.2fr_1fr_1.2fr_auto]',
              )}
            >
              <div className="space-y-1">
                <Label htmlFor={`${formId}-name`} className="sr-only">
                  Nombre del contacto
                </Label>
                <Input
                  id={`${formId}-name`}
                  name="contact-name"
                  autoComplete="name"
                  placeholder="Nombre"
                  value={draftName}
                  onChange={(e) => {
                    setDraftName(e.target.value)
                    setError(null)
                  }}
                  onKeyDown={onComposerKeyDown}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${formId}-phone`} className="sr-only">
                  Teléfono
                </Label>
                <Input
                  id={`${formId}-phone`}
                  name="contact-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Teléfono"
                  value={draftPhone}
                  onChange={(e) => {
                    setDraftPhone(e.target.value)
                    setError(null)
                  }}
                  onKeyDown={onComposerKeyDown}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${formId}-email`} className="sr-only">
                  Correo (opcional)
                </Label>
                <Input
                  id={`${formId}-email`}
                  name="contact-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Correo (opcional)"
                  value={draftEmail}
                  onChange={(e) => {
                    setDraftEmail(e.target.value)
                    setError(null)
                  }}
                  onKeyDown={onComposerKeyDown}
                  className="h-10 rounded-xl"
                />
              </div>
              <Button
                type="button"
                onClick={addContact}
                className={cn('h-10 gap-1.5', compact && 'w-full')}
                aria-label="Agregar contacto"
              >
                <Plus className="size-4" aria-hidden />
                Agregar
              </Button>
            </div>
            {error ? (
              <p className="text-xs text-norma-coral" role="alert">
                {error}
              </p>
            ) : (
              <p className="text-[11px] text-norma-subtle">
                Enter agrega el contacto a la lista. 
              </p>
            )}
          </div>
        ) : null}

        <div
          className={cn(
            'overflow-y-auto overscroll-contain p-2',
            compact ? 'max-h-48' : 'max-h-64',
          )}
        >
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-norma-accent/10 text-norma-accent">
                <UserRound className="size-5" aria-hidden />
              </span>
              <p className="text-sm text-norma-muted">
                Aún no hay contactos.
              </p>
              <p className="text-xs text-norma-subtle">
                Usa el formulario de arriba para agregar el primero.
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              <AnimatePresence initial={false}>
                {contacts.map((contact, index) => {
                  const editing = editingKey === contact.key
                  return (
                    <motion.li
                      key={contact.key}
                      layout={!reduceMotion}
                      initial={
                        reduceMotion ? false : { opacity: 0, y: 6 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        reduceMotion
                          ? undefined
                          : {
                              opacity: 0,
                              y: -4,
                              transition: { duration: 0.12 },
                            }
                      }
                      transition={{
                        duration: duration.fast,
                        ease: easeOut,
                        delay: reduceMotion
                          ? 0
                          : Math.min(index * 0.02, 0.12),
                      }}
                      className="rounded-2xl border border-norma-border/80 bg-norma-surface/70"
                    >
                      <div className="flex items-start gap-3 p-3">
                        <span
                          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-norma-accent/12 text-[11px] font-bold tracking-wide text-norma-accent"
                          aria-hidden
                        >
                          {initials(contact.name)}
                        </span>
                        <div className="min-w-0 flex-1 space-y-2">
                          {editing && !disabled ? (
                            <div className="grid gap-2 sm:grid-cols-3">
                              <Input
                                value={contact.name}
                                onChange={(e) =>
                                  updateContact(contact.key, {
                                    name: e.target.value,
                                  })
                                }
                                className="h-9 rounded-xl"
                                aria-label="Nombre"
                              />
                              <Input
                                value={contact.phone}
                                onChange={(e) =>
                                  updateContact(contact.key, {
                                    phone: e.target.value,
                                  })
                                }
                                className="h-9 rounded-xl"
                                aria-label="Teléfono"
                              />
                              <Input
                                type="email"
                                value={contact.email}
                                onChange={(e) =>
                                  updateContact(contact.key, {
                                    email: e.target.value,
                                  })
                                }
                                className="h-9 rounded-xl"
                                aria-label="Correo"
                              />
                            </div>
                          ) : (
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-norma-fg">
                                {contact.name}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-norma-muted">
                                <span className="inline-flex items-center gap-1">
                                  <Phone className="size-3 opacity-70" aria-hidden />
                                  {contact.phone}
                                </span>
                                {contact.email ? (
                                  <span className="inline-flex max-w-full items-center gap-1 truncate">
                                    <Mail className="size-3 shrink-0 opacity-70" aria-hidden />
                                    <span className="truncate">{contact.email}</span>
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </div>
                        {!disabled ? (
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingKey(editing ? null : contact.key)
                              }
                              className="rounded-xl px-2 py-1.5 text-[11px] font-medium text-norma-signal transition-colors hover:bg-norma-signal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
                            >
                              {editing ? 'Listo' : 'Editar'}
                            </button>
                            <button
                              type="button"
                              aria-label={`Quitar ${contact.name}`}
                              onClick={() => removeContact(contact.key)}
                              className="inline-flex size-8 items-center justify-center rounded-xl text-norma-muted transition-colors hover:bg-norma-coral/10 hover:text-norma-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
                            >
                              <X className="size-4" aria-hidden />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
