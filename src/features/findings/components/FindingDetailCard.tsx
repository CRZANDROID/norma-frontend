import { ExternalLink, FileText, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { FindingDetail } from '@/features/findings/types/finding'
import {
  FINDING_IMPACT_HINTS,
  FINDING_IMPACT_LABELS,
} from '@/features/findings/types/finding'
import { AiWrittenText } from '@/features/findings/components/AiWrittenText'
import { IMPACT_LAMP } from '@/features/findings/lib/impact'
import { detailCrossfade, duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
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

  return (
    <motion.article
      key={finding.id}
      initial={reduceMotion ? false : detailCrossfade.initial}
      animate={detailCrossfade.animate}
      transition={{ duration: duration.fast, ease: easeOut }}
      className="space-y-5"
    >
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-norma-subtle">
            Clasificación
          </p>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
              lamp.badge,
            )}
          >
            <span className={cn('size-1.5 rounded-full', lamp.fill)} aria-hidden />
            {FINDING_IMPACT_LABELS[finding.impact]}
          </span>
          <Badge variant="inactive" className="font-mono text-[10px] uppercase tracking-wide">
            {finding.status}
          </Badge>
        </div>
        <p className="mt-2 text-xs text-norma-subtle">
          {FINDING_IMPACT_HINTS[finding.impact]}
        </p>
        <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-pretty break-words md:text-2xl">
          {finding.title}
        </h2>
      </header>

      {finding.suggestedAction ? (
        <section className="relative overflow-hidden rounded-2xl p-px">
          {reduceMotion ? null : (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-[-80%] bg-[conic-gradient(from_0deg,transparent_0_72%,rgba(105,88,248,0)_78%,rgba(142,128,255,0.95)_87%,rgba(105,88,248,0)_93%,transparent_100%)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 3.2, ease: 'linear', repeat: Infinity }}
            />
          )}
          <div className="relative rounded-[15px] bg-norma-surface px-4 py-4 ring-1 ring-inset ring-norma-accent/20">
            <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-norma-accent">
              <Sparkles className="size-3.5" aria-hidden />
              Acción sugerida por NORMA
            </h3>
            <p className="mt-2 text-base font-semibold leading-snug text-norma-fg">
              {finding.suggestedAction}
            </p>
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-norma-subtle">
          Justificación del análisis
        </h3>
        <AiWrittenText
          key={finding.id}
          text={finding.justification}
          className="mt-2 max-w-prose text-[15px] leading-relaxed text-pretty break-words text-norma-fg"
        />
      </section>

      <section className="rounded-2xl border-2 border-norma-border bg-norma-raised/80 px-4 py-3.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-norma-subtle">
          Documento fuente
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <FileText className="size-5 shrink-0 text-norma-muted" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" translate="no">
              {finding.document.filename}
            </p>
            <p className="truncate text-xs text-norma-muted">
              {finding.source?.name ?? 'Fuente'}
              {finding.document.processingStatus === 'CLASSIFIED'
                ? ' · Clasificada'
                : finding.document.processingStatus
                  ? ` · ${finding.document.processingStatus}`
                  : ''}
            </p>
          </div>
          {canOpenOrigin ? (
            <Button asChild size="sm">
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir documento
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </Button>
          ) : null}
        </div>
        {!documentUrl ? (
          <p className="mt-3 text-sm text-norma-subtle">
            Este hallazgo no trae el enlace de la página o el PDF original.
          </p>
        ) : !canOpenOrigin ? (
          <p className="mt-3 break-all font-mono text-sm" translate="no">
            {documentUrl}
          </p>
        ) : null}
      </section>
    </motion.article>
  )
}
