import { useState } from 'react'
import { cn } from '@/shared/lib/utils'

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

export function useReportRecipientSelection(recipients: ReportRecipient[]) {
  const recipientKey = recipients.map((row) => row.id).join('\n')
  const [seenKey, setSeenKey] = useState(recipientKey)
  const [selected, setSelected] = useState<string[]>(() =>
    recipients.map((row) => row.id),
  )
  if (seenKey !== recipientKey) {
    setSeenKey(recipientKey)
    setSelected(recipients.map((row) => row.id))
  }

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  return {
    selected,
    toggle,
    noneChosen: selected.length === 0,
  }
}

export function ReportRecipientList({
  recipients,
  selected,
  onToggle,
  tone = 'surface',
}: {
  recipients: ReportRecipient[]
  selected: string[]
  onToggle: (id: string) => void
  tone?: 'surface' | 'navy'
}) {
  const onNavy = tone === 'navy'
  const chosen = recipients.filter((row) => selected.includes(row.id)).length

  return (
    <section aria-labelledby="report-recipients-heading">
      <div className="flex items-baseline justify-between gap-3">
        <h3
          id="report-recipients-heading"
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.14em]',
            onNavy ? 'text-white/55' : 'text-norma-muted',
          )}
        >
          Destinatarios
        </h3>
        {recipients.length > 0 ? (
          <p
            className={cn(
              'text-xs tabular-nums',
              onNavy ? 'text-white/55' : 'text-norma-subtle',
            )}
          >
            {chosen} de {recipients.length}
          </p>
        ) : null}
      </div>
      {recipients.length === 0 ? (
        <p
          className={cn(
            'mt-2 rounded-2xl px-4 py-3 text-sm leading-relaxed',
            onNavy
              ? 'border border-white/20 bg-white/8 text-white/80'
              : 'border-2 border-norma-border bg-norma-surface text-norma-muted',
          )}
        >
          No hay contactos activos con correo.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {recipients.map((row) => {
            const checked = selected.includes(row.id)
            return (
              <li key={row.id}>
                <label
                  className={cn(
                    'flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-norma-accent/45',
                    onNavy
                      ? checked
                        ? 'border border-white/50 bg-white/14'
                        : 'border border-white/20 bg-white/8 hover:bg-white/14'
                      : checked
                        ? 'border-2 border-norma-accent/40 bg-norma-accent/10'
                        : 'border-2 border-norma-border bg-norma-surface hover:bg-norma-raised',
                  )}
                >
                  <input
                    type="checkbox"
                    name={`destinatario-${row.id}`}
                    checked={checked}
                    onChange={() => onToggle(row.id)}
                    className="size-4 shrink-0 accent-norma-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        'block truncate font-display text-sm font-semibold tracking-tight',
                        onNavy ? 'text-white' : 'text-norma-fg',
                      )}
                    >
                      {row.name}
                    </span>
                    <span
                      translate="no"
                      className={cn(
                        'block truncate text-sm',
                        onNavy ? 'text-white/70' : 'text-norma-muted',
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
      {recipients.length > 0 && chosen === 0 ? (
        <p
          role="status"
          className={cn(
            'mt-2 text-sm',
            onNavy ? 'text-white/75' : 'text-norma-muted',
          )}
        >
          Elige al menos uno para enviar.
        </p>
      ) : null}
    </section>
  )
}
