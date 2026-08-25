import { Badge } from '@/shared/ui/badge'
import type { DocumentListItem } from '@/features/documents/types/document'
import { DOCUMENT_STATUS_LABELS } from '@/features/documents/types/document'

function statusVariant(status: DocumentListItem['processingStatus']) {
  if (status === 'READY_FOR_AI') return 'active' as const
  if (status === 'FAILED') return 'accent' as const
  if (status === 'DEDUPED') return 'inactive' as const
  return 'signal' as const
}

function shortId(id: string): string {
  return id.length > 10 ? `${id.slice(0, 8)}…` : id
}

export function DocumentsRegistry({
  documents,
  error,
}: {
  documents: DocumentListItem[]
  error: string | null
}) {
  return (
    <div className="rounded-3xl border-2 border-norma-border bg-norma-surface px-5 py-4 shadow-[0_18px_40px_-22px_rgba(13,27,42,0.35)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-norma-subtle">
        Registro documental
      </p>
      <p className="mt-1 text-sm text-norma-muted">
        Texto y ficha de las fuentes piloto. El original crudo no se muestra.
      </p>
      {error ? (
        <p className="mt-2 text-xs text-norma-red">{error}</p>
      ) : documents.length === 0 ? (
        <p className="mt-2 text-sm text-norma-subtle">
          Aún no hay documentos registrados de DOF, Diputados o Jalisco.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-baseline justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs">{doc.sourceCode || '—'}</p>
                {doc.processingStatus === 'DEDUPED' && doc.canonicalDocumentId ? (
                  <p className="text-[11px] text-norma-subtle">
                    Duplicado de {shortId(doc.canonicalDocumentId)}
                  </p>
                ) : doc.lastError ? (
                  <p className="text-[11px] text-norma-muted">{doc.lastError}</p>
                ) : doc.textPreview ? (
                  <p className="line-clamp-1 text-[11px] text-norma-muted">
                    {doc.textPreview}
                  </p>
                ) : null}
              </div>
              <Badge variant={statusVariant(doc.processingStatus)}>
                {DOCUMENT_STATUS_LABELS[doc.processingStatus]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
