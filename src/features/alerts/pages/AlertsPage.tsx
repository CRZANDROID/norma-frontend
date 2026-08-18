import { useMemo, useState } from 'react'
import type { AlertLevel } from '@/features/clients/types/client'
import { ALERT_LEVELS } from '@/features/clients/types/client'
import { FindingBoard } from '@/features/alerts/components/FindingBoard'
import { SemaphoreRail } from '@/features/alerts/components/SemaphoreRail'
import { PREVIEW_FINDINGS } from '@/features/alerts/lib/preview-findings'
import { PageHeader } from '@/shared/ui/page'

export function AlertsPage() {
  const [level, setLevel] = useState<AlertLevel | 'ALL'>('ALL')
  const [selectedId, setSelectedId] = useState(PREVIEW_FINDINGS[0]?.id ?? null)

  const counts = useMemo(() => {
    const next = { GREEN: 0, YELLOW: 0, ORANGE: 0, RED: 0 } as Record<
      AlertLevel,
      number
    >
    for (const item of PREVIEW_FINDINGS) next[item.level] += 1
    return next
  }, [])

  const visible = useMemo(() => {
    const rows =
      level === 'ALL'
        ? PREVIEW_FINDINGS
        : PREVIEW_FINDINGS.filter((item) => item.level === level)
    return [...rows].sort(
      (a, b) => ALERT_LEVELS.indexOf(b.level) - ALERT_LEVELS.indexOf(a.level),
    )
  }, [level])

  return (
    <div>
      <PageHeader
        eyebrow="Previsualización"
        title="Alertas"
        description="Así se leerá el semáforo cuando los agentes clasifiquen cada hallazgo. Todavía no hay cola ni API de findings."
      />

      <p className="mb-5 rounded-2xl border-2 border-norma-accent/25 bg-norma-accent/8 px-4 py-3 text-sm text-norma-muted">
        Ejemplos del piloto Arca, con fuentes que ya existen en el catálogo.
        El color no sale de un modelo: es la propuesta de lectura para el
        consultor.
      </p>

      <div className="space-y-5">
        <SemaphoreRail counts={counts} active={level} onSelect={setLevel} />
        <FindingBoard
          findings={visible}
          selectedId={
            visible.some((item) => item.id === selectedId)
              ? selectedId
              : (visible[0]?.id ?? null)
          }
          onSelect={setSelectedId}
        />
      </div>
    </div>
  )
}
