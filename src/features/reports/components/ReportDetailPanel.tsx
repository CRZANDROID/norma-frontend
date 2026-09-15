import { useState } from 'react'
import { toast } from 'sonner'
import type { ReportDetail } from '@/features/reports/types/report'
import { openReportPdf } from '@/features/reports/lib/open-pdf'
import {
  formatReportPeriod,
  reportStatusLabel,
} from '@/features/reports/lib/period'
import { mapApiError } from '@/shared/lib/api-error'
import { reportsApi } from '@/features/reports/api/reports-api'
import { Button } from '@/shared/ui/button'

const IMPACT_LABEL: Record<string, string> = {
  RED: 'Crítico',
  ORANGE: 'Alto',
  YELLOW: 'Medio',
  GREEN: 'Informativo',
}

export function ReportDetailPanel({
  report,
  onUpdated,
}: {
  report: ReportDetail
  onUpdated: (next: ReportDetail) => void
}) {
  const [busy, setBusy] = useState<'view' | 'download' | 'regen' | null>(null)
  const draft = report.status === 'draft'

  async function viewOrDownload(mode: 'view' | 'download') {
    setBusy(mode)
    try {
      await openReportPdf(report.id, mode === 'download')
    } catch (err) {
      toast.error(
        mapApiError(
          err,
          mode === 'download'
            ? 'No se pudo descargar el PDF.'
            : 'No se pudo abrir el PDF.',
        ),
      )
    } finally {
      setBusy(null)
    }
  }

  async function regenerate() {
    setBusy('regen')
    try {
      const next = await reportsApi.regenerate(report.id)
      onUpdated(next)
      toast.success('Informe regenerado con los hallazgos vigentes.')
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo regenerar el informe.'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-accent">
          {reportStatusLabel(report.status)}
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-balance">
          {report.client.name}
        </h2>
        <p className="mt-2 text-sm text-norma-muted">
          {formatReportPeriod(report.dateFrom, report.dateTo)}
          {' · '}
          {report.findingCount} hallazgo
          {report.findingCount === 1 ? '' : 's'}
          {report.generatedBy ? ` · ${report.generatedBy.name}` : ''}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy !== null || !report.fileUrl}
          onClick={() => void viewOrDownload('view')}
        >
          {busy === 'view' ? 'Abriendo…' : 'Ver PDF'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy !== null || !report.fileUrl}
          onClick={() => void viewOrDownload('download')}
        >
          {busy === 'download' ? 'Descargando…' : 'Descargar'}
        </Button>
        {draft ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy !== null}
            onClick={() => void regenerate()}
          >
            {busy === 'regen' ? 'Regenerando…' : 'Regenerar'}
          </Button>
        ) : null}
      </div>
      <ul className="space-y-3">
        {report.findings.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border-2 border-norma-border bg-norma-surface px-4 py-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-norma-muted">
              {IMPACT_LABEL[item.impact] ?? item.impact}
            </p>
            <p className="mt-1 font-display text-sm font-semibold tracking-tight">
              {item.title}
            </p>
            {item.suggestedAction ? (
              <p className="mt-1 text-xs text-norma-accent">
                {item.suggestedAction}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
