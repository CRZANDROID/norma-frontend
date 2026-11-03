import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  ReportRecipientList,
  reportsApi,
  useReportRecipientSelection,
  type ReportRecipient,
} from '@/features/reports'
import { mapApiError } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'

const navyBtn =
  'border-white/25 bg-white/10 text-white hover:bg-white/18 hover:text-white'

export function FindingReportBar({
  clientId,
  dateFrom,
  dateTo,
  autoSend,
  recipients,
}: {
  clientId: string
  dateFrom: string | null
  dateTo: string | null
  autoSend: boolean
  recipients: ReportRecipient[]
}) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const recipientsState = useReportRecipientSelection(recipients)

  async function generate(contactIds?: string[]) {
    setBusy(true)
    try {
      const next = await reportsApi.create({
        clientId,
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
        ...(contactIds ? { contactIds } : {}),
      })
      setSendOpen(false)
      const openReport = {
        label: 'Ver informe',
        onClick: () => navigate(`/informes/${next.id}`),
      }
      if (next.email && !next.email.sent) {
        toast.warning(next.email.message, { action: openReport })
        return
      }
      const count = `${next.findingCount} hallazgo${next.findingCount === 1 ? '' : 's'}`
      toast.success(
        next.status === 'sent'
          ? `Informe generado y enviado (${count}).`
          : `Borrador listo (${count}). Confírmalo en Informes.`,
        { action: openReport },
      )
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo generar el informe.'))
    } finally {
      setBusy(false)
    }
  }

  function openSend() {
    recipientsState.reset()
    setSendOpen(true)
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 [@media(min-height:50rem)]:mt-4">
      <Button
        type="button"
        size="sm"
        className={cn(navyBtn)}
        disabled={!clientId || busy}
        onClick={() => {
          if (autoSend) {
            openSend()
            return
          }
          void generate()
        }}
      >
        {busy ? 'Generando…' : 'Generar PDF'}
      </Button>
      <span className="hidden text-[11px] text-white/45 [@media(min-height:50rem)]:inline">
        El lote se arma con Incluidos. Ver y descargar viven en Informes.
      </span>
      {autoSend ? (
        <Modal
          open={sendOpen}
          onOpenChange={(next) => {
            if (busy) return
            setSendOpen(next)
          }}
          title="Generar y enviar"
          description="Este cliente envía el informe al generarlo."
          className="flex max-h-[min(90vh,40rem)] flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            <ReportRecipientList
              recipients={recipients}
              selected={recipientsState.selected}
              onToggle={recipientsState.toggle}
            />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => setSendOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={busy || recipientsState.noneChosen}
              onClick={() => void generate(recipientsState.selected)}
            >
              {busy ? 'Enviando…' : 'Enviar'}
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
