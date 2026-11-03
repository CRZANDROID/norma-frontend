import { useState } from 'react'
import { toast } from 'sonner'
import {
  ReportRecipientList,
  useReportRecipientSelection,
  type ReportRecipient,
} from '@/features/reports/components/ReportRecipientField'
import type { ReportDetail } from '@/features/reports/types/report'
import { openReportPdf } from '@/features/reports/lib/open-pdf'
import {
  formatReportPeriod,
  reportGeneratedLine,
  reportSentLine,
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
  recipients,
  onUpdated,
}: {
  report: ReportDetail
  recipients: ReportRecipient[]
  onUpdated: (next: ReportDetail) => void
}) {
  const [busy, setBusy] = useState<
    'view' | 'download' | 'regen' | 'send' | 'discard' | null
  >(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const draft = report.status === 'draft'
  const recipientsState = useReportRecipientSelection(recipients)

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

  async function send(contactIds: string[]) {
    if (contactIds.length === 0) return
    setBusy('send')
    try {
      const next = await reportsApi.send(report.id, contactIds)
      onUpdated(next)
      if (next.status === 'sent') {
        toast.success(next.email?.message || 'Informe enviado.')
        return
      }
      toast.warning(
        next.email?.message ||
          'No se envió el correo. El informe sigue en borrador.',
      )
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

  const findingCount = report.findings.length

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
        </p>
        <p className="mt-1 text-xs text-norma-subtle">
          {reportGeneratedLine(report.generatedAt, report.generatedBy?.name)}
        </p>
        {report.status === 'sent' ? (
          <p className="mt-0.5 text-xs text-norma-subtle">
            {reportSentLine(report.sentAt, report.sentBy?.name)}
          </p>
        ) : null}
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

      <div className="flex flex-wrap gap-2" role="group" aria-label="Archivo PDF">
        <Button
          type="button"
          size="sm"
          variant={draft ? 'outline' : 'default'}
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
      </div>

      {draft ? (
        <ReportRecipientList
          recipients={recipients}
          selected={recipientsState.selected}
          onToggle={recipientsState.toggle}
        />
      ) : null}

      {draft ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-norma-border/80 pt-4">
          <Button
            type="button"
            size="sm"
            disabled={busy !== null || recipientsState.noneChosen}
            onClick={() => void send(recipientsState.selected)}
          >
            {busy === 'send' ? 'Enviando…' : 'Enviar'}
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy !== null}
              onClick={() => void regenerate()}
            >
              {busy === 'regen' ? 'Regenerando…' : 'Regenerar'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={busy !== null}
              onClick={() => setConfirmDiscard(true)}
            >
              Descartar
            </Button>
          </div>
        </div>
      ) : null}

      <section
        aria-labelledby="report-findings-heading"
        className="border-t border-norma-border/80 pt-5"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3
            id="report-findings-heading"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-muted"
          >
            Hallazgos
          </h3>
          <p className="text-xs tabular-nums text-norma-subtle">
            {findingCount}
          </p>
        </div>
        {findingCount === 0 ? (
          <p className="mt-2 text-sm leading-relaxed text-norma-muted">
            Este informe no tiene hallazgos.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
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
        )}
      </section>
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
