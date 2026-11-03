import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

export type ReportRecipient = {
  id: string
  name: string
  email: string
}

export function reportRecipients(
  contacts:
    | ReadonlyArray<{
        id: string
        name: string
        email: string | null
        status: string
      }>
    | undefined,
): ReportRecipient[] {
  return (contacts ?? [])
    .filter((row) => row.status === 'ACTIVE' && !!row.id && !!row.email?.trim())
    .map((row) => ({
      id: row.id,
      name: row.name.trim() || 'Sin nombre',
      email: row.email!.trim(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export function ReportRecipientField({
  recipients,
  tone = 'surface',
  action,
}: {
  recipients: ReportRecipient[]
  tone?: 'surface' | 'navy'
  action: {
    label: string
    busyLabel: string
    busy: boolean
    className?: string
    onSend: (contactIds: string[]) => void
  }
}) {
  const recipientKey = recipients.map((row) => row.id).join('\n')
  const [seenKey, setSeenKey] = useState(recipientKey)
  const [selected, setSelected] = useState<string[]>(() =>
    recipients.map((row) => row.id),
  )
  if (seenKey !== recipientKey) {
    setSeenKey(recipientKey)
    setSelected(recipients.map((row) => row.id))
  }

  const onNavy = tone === 'navy'
  const noneChosen = selected.length === 0

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  return (
    <div className="flex max-w-full flex-wrap items-start gap-2">
      <Button
        type="button"
        size="sm"
        className={action.className}
        disabled={action.busy || noneChosen}
        onClick={() => action.onSend(selected)}
      >
        {action.busy ? action.busyLabel : action.label}
      </Button>
      <fieldset
        className={cn(
          'min-w-[14rem] max-w-xs rounded-2xl px-3 py-2',
          onNavy
            ? 'border border-white/20 bg-white/8'
            : 'border-2 border-norma-border bg-norma-surface',
        )}
      >
        <legend
          className={cn(
            'px-1 text-[11px] font-semibold uppercase tracking-[0.14em]',
            onNavy ? 'text-white/55' : 'text-norma-muted',
          )}
        >
          Destinatarios
        </legend>
        {recipients.length === 0 ? (
          <p
            className={cn(
              'py-1 text-xs leading-snug',
              onNavy ? 'text-white/70' : 'text-norma-subtle',
            )}
          >
            No hay contactos activos con correo.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {recipients.map((row) => {
              const checked = selected.includes(row.id)
              return (
                <li key={row.id}>
                  <label
                    className={cn(
                      'flex min-h-10 cursor-pointer items-center gap-2.5 rounded-xl px-1.5',
                      onNavy ? 'hover:bg-white/8' : 'hover:bg-norma-raised',
                    )}
                  >
                    <input
                      type="checkbox"
                      name={`recipient-${row.id}`}
                      className="size-3.5 shrink-0 rounded border-norma-border accent-norma-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/40"
                      checked={checked}
                      onChange={() => toggle(row.id)}
                    />
                    <span className="min-w-0">
                      <span
                        className={cn(
                          'block truncate text-sm font-medium',
                          onNavy ? 'text-white' : 'text-norma-fg',
                        )}
                      >
                        {row.name}
                      </span>
                      <span
                        className={cn(
                          'block truncate text-xs',
                          onNavy ? 'text-white/65' : 'text-norma-muted',
                        )}
                      >
                        {row.email}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
        {recipients.length > 0 && noneChosen ? (
          <p
            className={cn(
              'px-1.5 pb-1 text-xs',
              onNavy ? 'text-white/70' : 'text-norma-subtle',
            )}
          >
            Elige al menos uno para enviar.
          </p>
        ) : null}
      </fieldset>
    </div>
  )
}
