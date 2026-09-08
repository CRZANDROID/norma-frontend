import type {
  FindingDetail,
  FindingListItem,
} from '@/features/findings/types/finding'

export function toFindingListItem(row: FindingDetail): FindingListItem {
  return {
    id: row.id,
    title: row.title,
    impact: row.impact,
    status: row.status,
    suggestedAction: row.suggestedAction,
    excludedFromNextReport: row.excludedFromNextReport,
    justificationShort: row.justificationShort,
    client: row.client,
    source: row.source,
    document: row.document,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function shortJustification(text: string, max = 240): string {
  const plain = text.replace(/\s+/g, ' ').trim()
  if (plain.length <= max) return plain
  return `${plain.slice(0, max - 1).trimEnd()}…`
}
