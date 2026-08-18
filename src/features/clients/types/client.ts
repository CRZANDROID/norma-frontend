export type EntityStatus = 'ACTIVE' | 'INACTIVE'

/** Fuente embebida en respuestas de cliente (`sources`). */
export type ClientSourceRef = {
  id: string
  name: string
  code: string
  category: string
  platform: string
  status: EntityStatus
}

/** Datos fiscales 1:1 (`fiscal` en write, `fiscalData` en read). */
export type ClientFiscalData = {
  legalName: string
  rfc: string
  postalCode: string
  cfdi: string
  taxRegime: string
}

export type ClientFiscalInput = {
  legalName: string
  rfc: string
  postalCode: string
  cfdi: string
  taxRegime: string
}

/** Contacto en respuestas de cliente. */
export type ClientContact = {
  id: string
  name: string
  phone: string
  email: string | null
  status: EntityStatus
}

/** Contacto en create/PATCH (`contacts[]`, replace en PATCH). */
export type ClientContactInput = {
  name: string
  phone: string
  email?: string
}

export type AlertLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'

export const ALERT_LEVELS: AlertLevel[] = [
  'GREEN',
  'YELLOW',
  'ORANGE',
  'RED',
]

export const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  GREEN: 'Verde',
  YELLOW: 'Amarillo',
  ORANGE: 'Naranja',
  RED: 'Rojo',
}

/** Horario de entrega (`FRONTEND-CLIENT-DELIVERY.md`). */
export type DeliverySchedule = {
  time: string
  weekdays: number[]
  timezone: string
}

export type DeliveryChannels = {
  email: boolean
  whatsapp: boolean
}

export type DeliveryLevelConfig = {
  suggestedAction: string
  inbox: boolean
  email: boolean
  whatsapp: boolean
  requiresHuman: boolean
}

export type DeliveryConfig = {
  channels: DeliveryChannels
  schedule: DeliverySchedule
  levels: Record<AlertLevel, DeliveryLevelConfig>
}

export type Client = {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  status: EntityStatus
  createdAt: string
  updatedAt: string
  sources?: ClientSourceRef[]
  fiscalData?: ClientFiscalData | null
  contacts?: ClientContact[]
  deliveryConfig?: DeliveryConfig
}

export type RegulatoryProfile = {
  id: string
  clientId: string
  name: string
  description: string | null
  keywords: string[]
  categories: string[]
  products: { categories?: string[] } | null
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export type ClientDetail = Client & {
  profiles: RegulatoryProfile[]
  sources: ClientSourceRef[]
  fiscalData: ClientFiscalData | null
  contacts: ClientContact[]
}

export type CreateClientInput = {
  name: string
  slug: string
  email?: string
  phone?: string
  sourceIds?: string[]
  fiscal?: ClientFiscalInput
  contacts?: ClientContactInput[]
}

export type UpdateClientInput = {
  name?: string
  email?: string | null
  phone?: string | null
  /** Si se envía, reemplaza el set completo de fuentes. */
  sourceIds?: string[]
  /** Si se envía, upsert de datos fiscales. */
  fiscal?: ClientFiscalInput
  /** Si se envía, reemplaza el set completo de contactos. */
  contacts?: ClientContactInput[]
}

export type CreateProfileInput = {
  name: string
  description?: string
  keywords?: string[]
  categories?: string[]
  products?: { categories?: string[] } | null
}

export type UpdateProfileInput = CreateProfileInput
