import { PageHeader } from '@/shared/ui/page'

export function AlertsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Próximamente"
        title="Alertas"
        description="Inbox de hallazgos del agente. Entra en sprints posteriores."
      />
      <div className="rounded-3xl border-2 border-dashed border-norma-accent/45 bg-norma-raised p-10 text-sm text-norma-muted">
        Vista reservada para findings / semáforo.
      </div>
    </div>
  )
}
