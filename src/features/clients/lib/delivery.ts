import type { AlertLevel, ClientDelivery, ImpactAction } from '@/features/clients/types/client'
import { ALERT_LEVELS } from '@/features/clients/types/client'

const DEFAULT_ACTIONS: Record<AlertLevel, string> = {
  GREEN: 'Registrar como contexto',
  YELLOW: 'Dar seguimiento',
  ORANGE: 'Elaborar nota y monitorear avance',
  RED: 'Alertar de inmediato y preparar nota ejecutiva',
}

export function defaultImpactActions(): ImpactAction[] {
  return ALERT_LEVELS.map((impact) => ({
    impact,
    suggestedAction: DEFAULT_ACTIONS[impact],
  }))
}

export function defaultClientDelivery(clientId?: string): ClientDelivery {
  return {
    clientId,
    impactActions: defaultImpactActions(),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function actionFor(rows: unknown[], impact: AlertLevel): ImpactAction {
  const row = rows.find((item) => isRecord(item) && item.impact === impact)
  const suggested =
    isRecord(row) && typeof row.suggestedAction === 'string'
      ? row.suggestedAction
      : '—'
  return { impact, suggestedAction: suggested }
}

/** Shape Nest: `{ impactActions: [{ impact, suggestedAction, ... }] }`. */
export function normalizeClientDelivery(raw: unknown): ClientDelivery | null {
  if (!isRecord(raw)) return null
  const root = isRecord(raw.deliveryConfig)
    ? raw.deliveryConfig
    : isRecord(raw.delivery)
      ? raw.delivery
      : raw
  const rows = Array.isArray(root.impactActions) ? root.impactActions : null
  if (!rows) return null
  return {
    id: typeof root.id === 'string' ? root.id : undefined,
    clientId: typeof root.clientId === 'string' ? root.clientId : undefined,
    impactActions: ALERT_LEVELS.map((impact) => actionFor(rows, impact)),
  }
}
