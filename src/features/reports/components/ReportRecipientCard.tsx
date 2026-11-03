import { cn } from '@/shared/lib/utils'

export type ReportRecipient = {
  name: string
  email: string
}

export function reportRecipients(
  contacts:
    | ReadonlyArray<{
        name: string
        email: string | null
        status: string
      }>
    | undefined,
): ReportRecipient[] {
  return (contacts ?? [])
    .filter((row) => row.status === 'ACTIVE' && !!row.email?.trim())
    .map((row) => ({
      name: row.name.trim() || 'Sin nombre',
      email: row.email!.trim(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export function ReportRecipientCard({
  recipients,
  tone = 'surface',
}: {
  recipients: ReportRecipient[]
  tone?: 'surface' | 'navy'
}) {
  const onNavy = tone === 'navy'
  return (
    <div
      className={cn(
        'min-w-[12rem] max-w-xs rounded-xl px-3 py-2',
        onNavy
          ? 'border border-white/15 bg-white/8'
          : 'border border-norma-border bg-norma-raised',
      )}
    >
      <p
        className={cn(
          'text-[10px] font-semibold uppercase tracking-[0.14em]',
          onNavy ? 'text-white/50' : 'text-norma-muted',
        )}
      >
        Recibe
      </p>
      {recipients.length === 0 ? (
        <p
          className={cn(
            'mt-1 text-xs leading-snug',
            onNavy ? 'text-white/70' : 'text-norma-subtle',
          )}
        >
          Nadie con correo activo.
        </p>
      ) : (
        <ul className="mt-1 space-y-1.5">
          {recipients.map((row) => (
            <li key={`${row.email}-${row.name}`} className="min-w-0">
              <p
                className={cn(
                  'truncate text-xs font-medium',
                  onNavy ? 'text-white' : 'text-norma-fg',
                )}
              >
                {row.name}
              </p>
              <p
                className={cn(
                  'truncate text-[11px]',
                  onNavy ? 'text-white/65' : 'text-norma-muted',
                )}
              >
                {row.email}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
