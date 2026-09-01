import { ExternalLink } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { FindingDetail } from '@/features/findings/types/finding'
import { FINDING_IMPACT_HINTS, FINDING_IMPACT_LABELS } from '@/features/findings/types/finding'
import { formatFindingWhen } from '@/features/findings/lib/format'
import { IMPACT_LAMP } from '@/features/findings/lib/impact'
import { detailCrossfade, duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function FindingDetailCard({ finding }: { finding: FindingDetail }) {
  const reduceMotion = useReducedMotion()
  const lamp = IMPACT_LAMP[finding.impact]
  const documentUrl = finding.document.url
  const canOpenOrigin = !!documentUrl && isHttpUrl(documentUrl)
  const classifiedBy = [
    finding.aiMeta?.model,
    finding.aiMeta?.promptVersion,
  ].filter(Boolean)

  return (
    <motion.article
      key={finding.id}
      initial={reduceMotion ? false : detailCrossfade.initial}
      animate={detailCrossfade.animate}
      transition={{ duration: duration.fast, ease: easeOut }}
      className="space-y-6"
    >
      <p className="font-mono text-xs tracking-wide text-norma-signal">
        NORMA clasificó esta norma
        {finding.aiMeta?.relevant === false
          ? ' · fuera del perfil'
          : finding.aiMeta?.relevant === true
            ? ' · alineada al perfil'
            : null}
        {classifiedBy.length > 0 ? (
          <>
            {' · '}
            <span translate="no">{classifiedBy.join(' · ')}</span>
          </>
        ) : null}
      </p>

      <header>
        <p className={cn('text-xs font-semibold uppercase tracking-[0.16em]', lamp.text)}>
          {FINDING_IMPACT_LABELS[finding.impact]}
          <span className="ml-2 font-sans font-medium normal-case tracking-normal text-norma-subtle">
            {FINDING_IMPACT_HINTS[finding.impact]}
          </span>
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-pretty break-words">
          {finding.title}
        </h2>
        <p className="mt-2 min-w-0 truncate text-sm text-norma-muted">
          {finding.client.name}
          {finding.source ? ` · ${finding.source.name}` : ''}
          {finding.createdAt ? ` · ${formatFindingWhen(finding.createdAt)}` : ''}
        </p>
      </header>

      <section>
        <h3 className="sr-only">Justificación</h3>
        <p className="max-w-prose text-[15px] leading-relaxed text-pretty break-words text-norma-fg">
          {finding.justification}
        </p>
      </section>

      {finding.suggestedAction ? (
        <section className="max-w-prose">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-norma-subtle">
            Acción sugerida
          </h3>
          <p className="mt-2 text-base font-medium leading-snug text-norma-fg">
            {finding.suggestedAction}
          </p>
        </section>
      ) : null}

      <section className="max-w-prose border-t border-norma-border pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-norma-subtle">
          Documento original
        </h3>
        <p className="mt-2 break-words text-sm text-norma-muted">
          <span translate="no">{finding.document.filename}</span>
          {finding.document.processingStatus === 'CLASSIFIED'
            ? ' · Clasificada'
            : finding.document.processingStatus
              ? ` · ${finding.document.processingStatus}`
              : ''}
        </p>
        {documentUrl ? (
          <div className="mt-3 space-y-3">
            {canOpenOrigin ? (
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                translate="no"
                className="block break-all font-mono text-sm text-norma-signal underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
              >
                {documentUrl}
              </a>
            ) : (
              <p className="break-all font-mono text-sm" translate="no">
                {documentUrl}
              </p>
            )}
            {canOpenOrigin ? (
              <Button asChild className="min-h-11">
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir para verificar
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </Button>
            ) : null}
            <p className="text-xs text-norma-subtle">Se abre en otra pestaña.</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-norma-subtle">
            Este hallazgo no trae el enlace de la página o el PDF original.
          </p>
        )}
      </section>
    </motion.article>
  )
}
