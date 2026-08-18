import type {
  AlertLevel,
  DeliveryConfig,
  DeliveryLevelConfig,
} from '@/features/clients/types/client'
import { ALERT_LEVELS } from '@/features/clients/types/client'
import { pinnedSchedule } from '@/features/sources/lib/frequency'

const DEFAULT_ACTIONS: Record<AlertLevel, string> = {
  GREEN: 'Registrar en bitácora. Sin escalamiento.',
  YELLOW: 'Notificar al analista para seguimiento.',
  ORANGE: 'Escalar al responsable VCGA el mismo día.',
  RED: 'Alerta inmediata al responsable del cliente.',
}

const DEFAULT_LEVEL_FLAGS: Record<
  AlertLevel,
  Omit<DeliveryLevelConfig, 'suggestedAction'>
> = {
  GREEN: { inbox: true, email: false, whatsapp: false, requiresHuman: false },
  YELLOW: { inbox: true, email: true, whatsapp: false, requiresHuman: false },
  ORANGE: { inbox: true, email: true, whatsapp: false, requiresHuman: true },
  RED: { inbox: true, email: true, whatsapp: false, requiresHuman: true },
}

export function defaultDeliveryConfig(): DeliveryConfig {
  return {
    channels: { email: true, whatsapp: false },
    schedule: pinnedSchedule(),
    levels: {
      GREEN: {
        suggestedAction: DEFAULT_ACTIONS.GREEN,
        ...DEFAULT_LEVEL_FLAGS.GREEN,
      },
      YELLOW: {
        suggestedAction: DEFAULT_ACTIONS.YELLOW,
        ...DEFAULT_LEVEL_FLAGS.YELLOW,
      },
      ORANGE: {
        suggestedAction: DEFAULT_ACTIONS.ORANGE,
        ...DEFAULT_LEVEL_FLAGS.ORANGE,
      },
      RED: {
        suggestedAction: DEFAULT_ACTIONS.RED,
        ...DEFAULT_LEVEL_FLAGS.RED,
      },
    },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function asLevel(
  raw: unknown,
  fallback: DeliveryLevelConfig,
): DeliveryLevelConfig {
  if (!isRecord(raw)) return { ...fallback }
  const suggested =
    typeof raw.suggestedAction === 'string'
      ? raw.suggestedAction
      : typeof raw.action === 'string'
        ? raw.action
        : fallback.suggestedAction
  return {
    suggestedAction: suggested,
    inbox: asBool(raw.inbox ?? raw.sendInbox, fallback.inbox),
    email: asBool(raw.email ?? raw.sendEmail, fallback.email),
    whatsapp: asBool(raw.whatsapp ?? raw.sendWhatsapp, fallback.whatsapp),
    requiresHuman: asBool(raw.requiresHuman, fallback.requiresHuman),
  }
}

/** Acepta `deliveryConfig`, `delivery` o el objeto plano del GET/PATCH. */
export function normalizeDeliveryConfig(raw: unknown): DeliveryConfig {
  const fallback = defaultDeliveryConfig()
  if (!isRecord(raw)) return fallback
  const root = isRecord(raw.deliveryConfig)
    ? raw.deliveryConfig
    : isRecord(raw.delivery)
      ? raw.delivery
      : raw
  const channelsRaw = isRecord(root.channels) ? root.channels : {}
  const levelsRaw = isRecord(root.levels) ? root.levels : {}
  return {
    channels: {
      email: asBool(channelsRaw.email, fallback.channels.email),
      whatsapp: asBool(channelsRaw.whatsapp, fallback.channels.whatsapp),
    },
    schedule: pinnedSchedule(
      isRecord(root.schedule) && Array.isArray(root.schedule.weekdays)
        ? root.schedule.weekdays.filter(
            (d): d is number => typeof d === 'number',
          )
        : fallback.schedule.weekdays,
    ),
    levels: {
      GREEN: asLevel(levelsRaw.GREEN, fallback.levels.GREEN),
      YELLOW: asLevel(levelsRaw.YELLOW, fallback.levels.YELLOW),
      ORANGE: asLevel(levelsRaw.ORANGE, fallback.levels.ORANGE),
      RED: asLevel(levelsRaw.RED, fallback.levels.RED),
    },
  }
}

export function deliveryWriteBody(config: DeliveryConfig): DeliveryConfig {
  return {
    channels: {
      email: config.channels.email,
      whatsapp: config.channels.whatsapp,
    },
    schedule: pinnedSchedule(config.schedule.weekdays),
    levels: {
      GREEN: { ...config.levels.GREEN },
      YELLOW: { ...config.levels.YELLOW },
      ORANGE: { ...config.levels.ORANGE },
      RED: { ...config.levels.RED },
    },
  }
}

export function cloneDeliveryConfig(config: DeliveryConfig): DeliveryConfig {
  return deliveryWriteBody(config)
}

export function deliveryConfigsEqual(
  a: DeliveryConfig,
  b: DeliveryConfig,
): boolean {
  if (a.channels.email !== b.channels.email) return false
  if (a.channels.whatsapp !== b.channels.whatsapp) return false
  const leftDays = [...a.schedule.weekdays].sort()
  const rightDays = [...b.schedule.weekdays].sort()
  if (leftDays.length !== rightDays.length) return false
  if (leftDays.some((d, i) => d !== rightDays[i])) return false
  return ALERT_LEVELS.every((level) => {
    const left = a.levels[level]
    const right = b.levels[level]
    return (
      left.suggestedAction === right.suggestedAction &&
      left.inbox === right.inbox &&
      left.email === right.email &&
      left.whatsapp === right.whatsapp &&
      left.requiresHuman === right.requiresHuman
    )
  })
}
