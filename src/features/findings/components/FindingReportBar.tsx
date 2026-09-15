import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'sonner'
import { reportsApi } from '@/features/reports'
import { mapApiError } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

const navyBtn =
  'border-white/25 bg-white/10 text-white hover:bg-white/18 hover:text-white'

export function FindingReportBar({
  clientId,
  dateFrom,
  dateTo,
}: {
  clientId: string
  dateFrom: string | null
  dateTo: string | null
}) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  async function generate() {
    setBusy(true)
    try {
      const next = await reportsApi.create({
        clientId,
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
      })
      toast.success(
        `Informe listo (${next.findingCount} hallazgo${next.findingCount === 1 ? '' : 's'}).`,
        {
          action: {
            label: 'Ver informe',
            onClick: () => navigate(`/informes/${next.id}`),
          },
        },
      )
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo generar el informe.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 [@media(min-height:50rem)]:mt-4">
      <Button
        type="button"
        size="sm"
        className={cn(navyBtn)}
        disabled={!clientId || busy}
        onClick={() => void generate()}
      >
        {busy ? 'Generando…' : 'Generar PDF'}
      </Button>
      <span className="hidden text-[11px] text-white/45 [@media(min-height:50rem)]:inline">
        El lote se arma con Incluidos. Ver y descargar viven en Informes.
      </span>
    </div>
  )
}
