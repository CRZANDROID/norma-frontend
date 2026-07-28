import type { ReactNode } from 'react'
import { Button } from '@/shared/ui/button'

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-3xl border-2 border-dashed border-norma-accent/40 bg-norma-raised p-8">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-norma-muted">
        {description}
      </p>
      {actionLabel && onAction ? (
        <Button onClick={onAction}>{actionLabel}</Button>
      ) : null}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-3xl border border-norma-red/25 bg-norma-red/5 p-6">
      <p className="text-sm text-norma-red">{message}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-display text-[2rem] font-semibold tracking-tight text-norma-fg md:text-[2.25rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-norma-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
  )
}
