import type { AlertLevel } from '@/features/clients/types/client'

export type PreviewFinding = {
  id: string
  level: AlertLevel
  title: string
  excerpt: string
  sourceName: string
  sourceCode: string
  publishedAt: string
  justification: string
  suggestedAction: string
  clientName: string
}

export const LEVEL_COPY: Record<
  AlertLevel,
  { label: string; meaning: string; tempo: string }
> = {
  GREEN: {
    label: 'Verde',
    meaning: 'Se anota. El día sigue.',
    tempo: 'Bitácora',
  },
  YELLOW: {
    label: 'Amarillo',
    meaning: 'El analista lo mira en el turno.',
    tempo: 'Seguimiento',
  },
  ORANGE: {
    label: 'Naranja',
    meaning: 'El responsable VCGA lo ve hoy.',
    tempo: 'Mismo día',
  },
  RED: {
    label: 'Rojo',
    meaning: 'El cliente se entera de inmediato.',
    tempo: 'Inmediato',
  },
}

/** Ejemplos del piloto Arca. No salen de una cola real (Sprint 7). */
export const PREVIEW_FINDINGS: PreviewFinding[] = [
  {
    id: 'prev-red-ieps',
    level: 'RED',
    title: 'Iniciativa de IEPS a bebidas saborizadas en Gaceta Parlamentaria',
    excerpt:
      'La minuta propone un ajuste a la tasa sobre bebidas con azúcares añadidos y un calendario de entrada en vigor en el siguiente ejercicio.',
    sourceName: 'Gaceta Parlamentaria — Cámara de Diputados',
    sourceCode: 'diputados-gaceta',
    publishedAt: '2026-08-18T11:20:00.000Z',
    justification:
      'Toca de lleno el mix de Arca (refrescos y saborizadas) y cambia costo en el corto plazo. El perfil de bebidas marca IEPS como palabra guía.',
    suggestedAction: 'Alerta inmediata al responsable del cliente.',
    clientName: 'Arca Continental',
  },
  {
    id: 'prev-orange-etiquetado',
    level: 'ORANGE',
    title: 'DOF publica precisiones al etiquetado frontal de alimentos y bebidas',
    excerpt:
      'El acuerdo aclara umbrales de azúcares y la ubicación del sello en envases menores a 300 ml.',
    sourceName: 'Diario Oficial de la Federación',
    sourceCode: 'dof',
    publishedAt: '2026-08-18T07:05:00.000Z',
    justification:
      'No crea un impuesto nuevo, pero obliga a revisar artes de empaque en SKUs del piloto. Impacto operativo en semanas, no en horas.',
    suggestedAction: 'Escalar al responsable VCGA el mismo día.',
    clientName: 'Arca Continental',
  },
  {
    id: 'prev-orange-escuelas',
    level: 'ORANGE',
    title: 'Dictamen sobre publicidad de alimentos en planteles de Jalisco',
    excerpt:
      'El Congreso local avanza un dictamen que restringe publicidad de productos con sellos en un radio de escuelas públicas.',
    sourceName: 'Congreso de Jalisco',
    sourceCode: 'jalisco-congreso',
    publishedAt: '2026-08-17T16:40:00.000Z',
    justification:
      'Es estatal y aún no es ley, pero Jalisco es plaza relevante del cliente. El perfil incluye publicidad infantil y escuelas.',
    suggestedAction: 'Escalar al responsable VCGA el mismo día.',
    clientName: 'Arca Continental',
  },
  {
    id: 'prev-yellow-pet',
    level: 'YELLOW',
    title: 'Comunicado sobre metas de recuperación de envases PET',
    excerpt:
      'Se reiteran metas de acopio y se anuncia una mesa de trabajo con la industria de bebidas para el último trimestre.',
    sourceName: 'Diario Oficial de la Federación',
    sourceCode: 'dof',
    publishedAt: '2026-08-16T09:10:00.000Z',
    justification:
      'Alinea con el perfil de envases, sin obligación inmediata. Conviene seguimiento, no un llamado al cliente hoy.',
    suggestedAction: 'Notificar al analista para seguimiento.',
    clientName: 'Arca Continental',
  },
  {
    id: 'prev-yellow-nom',
    level: 'YELLOW',
    title: 'Proyecto de NOM: actualización de métodos de muestreo en bebidas',
    excerpt:
      'Consulta pública de 60 días para armonizar métodos de laboratorio. No modifica límites vigentes.',
    sourceName: 'Diario Oficial de la Federación',
    sourceCode: 'dof',
    publishedAt: '2026-08-15T12:00:00.000Z',
    justification:
      'Relevante para calidad y cumplimiento técnico, con plazo holgado. El analista puede agendarlo en el tablero semanal.',
    suggestedAction: 'Notificar al analista para seguimiento.',
    clientName: 'Arca Continental',
  },
  {
    id: 'prev-green-nomen',
    level: 'GREEN',
    title: 'Fe de erratas en nomenclatura de un acuerdo ya publicado',
    excerpt:
      'Corrección de una clave de trámite. El sentido jurídico del acuerdo no cambia.',
    sourceName: 'Diario Oficial de la Federación',
    sourceCode: 'dof',
    publishedAt: '2026-08-14T08:00:00.000Z',
    justification:
      'No altera obligaciones ni plazos. Queda en bitácora para traza, sin escalamiento.',
    suggestedAction: 'Registrar en bitácora. Sin escalamiento.',
    clientName: 'Arca Continental',
  },
  {
    id: 'prev-green-agenda',
    level: 'GREEN',
    title: 'Calendario de sesiones ordinarias — Gaceta',
    excerpt:
      'Publicación rutinaria del calendario. No incluye iniciativas nuevas del sector.',
    sourceName: 'Gaceta Parlamentaria — Cámara de Diputados',
    sourceCode: 'diputados-gaceta',
    publishedAt: '2026-08-13T18:30:00.000Z',
    justification:
      'Contexto de agenda legislativa, sin materia de bebidas, etiquetado ni impuestos.',
    suggestedAction: 'Registrar en bitácora. Sin escalamiento.',
    clientName: 'Arca Continental',
  },
]
