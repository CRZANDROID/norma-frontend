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
import { Modal } from '@/shared/ui/modal'

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
  const [busy, setBusy] = useState<
    'view' | 'download' | 'regen' | 'send' | 'discard' | null
  >(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
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

  function announceEmail(next: ReportDetail) {
    if (!next.email) return
    if (next.email.sent) {
      toast.success(next.email.message)
      return
    }
    toast.warning(next.email.message)
  }

  async function send() {
    setBusy('send')
    try {
      const next = await reportsApi.send(report.id)
      onUpdated(next)
      toast.success('Informe enviado.')
      announceEmail(next)
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo enviar el informe.'))
    } finally {
      setBusy(null)
    }
  }

  async function discard() {
    setBusy('discard')
    try {
      const next = await reportsApi.discard(report.id)
      setConfirmDiscard(false)
      onUpdated(next)
      toast.success('Informe descartado. Los hallazgos volvieron a candidatos.')
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo descartar el informe.'))
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
      {report.email && !report.email.sent ? (
        <div
          role="status"
          className="rounded-2xl border border-norma-coral/40 bg-norma-coral/10 px-4 py-3 text-sm leading-relaxed text-norma-fg"
        >
          {report.email.message}
        </div>
      ) : null}
      {report.email?.sent ? (
        <p className="text-sm text-norma-muted">{report.email.message}</p>
      ) : null}
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
            disabled={busy !== null}
            onClick={() => void send()}
          >
            {busy === 'send' ? 'Enviando…' : 'Enviar'}
          </Button>
        ) : null}
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
        {draft ? (
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={busy !== null}
            onClick={() => setConfirmDiscard(true)}
          >
            Descartar
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
            {item.changeNote ? (
              <p className="mt-2 text-xs leading-relaxed text-norma-fg">
                <span className="font-semibold">Qué cambió. </span>
                {item.changeNote}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      <Modal
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Descartar informe"
        description="Los hallazgos vuelven a candidatos. Un informe enviado no se puede descartar."
      >
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={busy === 'discard'}
            onClick={() => setConfirmDiscard(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={busy === 'discard'}
            onClick={() => void discard()}
          >
            {busy === 'discard' ? 'Descartando…' : 'Descartar'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
