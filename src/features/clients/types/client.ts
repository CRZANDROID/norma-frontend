export type EntityStatus = 'ACTIVE' | 'INACTIVE'

export type Client = {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  status: EntityStatus
  createdAt: string
  updatedAt: string
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
}

export type CreateClientInput = {
  name: string
  slug: string
  email?: string
  phone?: string
}

export type UpdateClientInput = {
  name?: string
  email?: string | null
  phone?: string | null
}

export type CreateProfileInput = {
  name: string
  description?: string
  keywords?: string[]
  categories?: string[]
  products?: { categories?: string[] } | null
}

export type UpdateProfileInput = CreateProfileInput
