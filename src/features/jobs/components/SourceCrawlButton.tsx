import { useState } from 'react'
import { toast } from 'sonner'
import { jobsApi } from '@/features/jobs/api/jobs-api'
import { mapApiError } from '@/shared/lib/api-error'
import { Button } from '@/shared/ui/button'

export function SourceCrawlButton({
  sourceId,
  sourceName,
  disabled,
}: {
  sourceId: string
  sourceName: string
  disabled?: boolean
}) {
  const [busy, setBusy] = useState(false)

  async function crawlNow() {
    setBusy(true)
    try {
      const result = await jobsApi.crawl({ sourceId })
      if (result.skipped) {
        toast.message(
          result.reason === 'already-in-flight'
            ? 'Ya hay un rastreo en curso para esta fuente.'
            : 'Esta fuente ya se rastreó hoy.',
        )
        return
      }
      toast.success(
        result.enqueued
          ? `Rastreo encolado (${sourceName}).`
          : 'Solicitud de rastreo enviada.',
      )
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo encolar el rastreo.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || busy}
      onClick={() => void crawlNow()}
    >
      {busy ? 'Encolando…' : 'Rastrear ahora'}
    </Button>
  )
}
