import { useEffect, useState } from 'react'
import { documentsApi } from '@/features/documents'
import type { DocumentDetail, DocumentListItem } from '@/features/documents'
import { DOCUMENT_STATUS_LABELS } from '@/features/documents'
import {
  pagePathLabel,
  splitPagesByKind,
} from '@/features/dashboard/lib/agent-watch'
import { mapApiError } from '@/shared/lib/api-error'
import { Badge } from '@/shared/ui/badge'
import { Modal } from '@/shared/ui/modal'
import { Skeleton } from '@/shared/ui/skeleton'

function pageBadge(status: DocumentListItem['processingStatus']) {
  if (status === 'CLASSIFIED' || status === 'READY_FOR_AI') return 'active' as const
  if (status === 'FAILED') return 'danger' as const
  if (status === 'DEDUPED') return 'inactive' as const
  return 'signal' as const
}

function PageRow({
  doc,
  onOpen,
}: {
  doc: DocumentListItem
  onOpen: (doc: DocumentListItem) => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(doc)}
        className="flex w-full items-start justify-between gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-left hover:border-norma-navy/10 hover:bg-norma-navy/4"
      >
        <span className="min-w-0">
          <span className="block break-all font-mono text-[13px] leading-snug text-norma-fg">
            {pagePathLabel(doc.url, doc.filename)}
          </span>
          {doc.textPreview ? (
            <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-norma-muted">
              {doc.textPreview}
            </span>
          ) : doc.lastError ? (
            <span className="mt-1 block text-sm text-norma-coral">
              {doc.lastError}
            </span>
          ) : (
            <span className="mt-1 block text-sm text-norma-subtle">
              Sin texto aún
            </span>
          )}
        </span>
        <Badge variant={pageBadge(doc.processingStatus)}>
          {DOCUMENT_STATUS_LABELS[doc.processingStatus]}
        </Badge>
      </button>
    </li>
  )
}

function KindSection({
  title,
  pages,
  onOpen,
}: {
  title: string
  pages: DocumentListItem[]
  onOpen: (doc: DocumentListItem) => void
}) {
  if (pages.length === 0) return null
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-norma-subtle">
        {title}
        <span className="ml-1.5 tabular-nums text-norma-muted">
          {pages.length}
        </span>
      </p>
      <ul className="mt-2 grid gap-1 lg:grid-cols-2">
        {pages.map((doc) => (
          <PageRow key={doc.id} doc={doc} onOpen={onOpen} />
        ))}
      </ul>
    </section>
  )
}

export function ExtractedPages({
  pages,
  onOpen,
  loading = false,
}: {
  pages: DocumentListItem[]
  onOpen: (doc: DocumentListItem) => void
  loading?: boolean
}) {
  const { pdf, word, html, other } = splitPagesByKind(pages)
  const visible = pdf.length + word.length + html.length + other.length

  if (loading && visible === 0) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Cargando documentos">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-2/3" />
      </div>
    )
  }

  if (visible === 0) {
    return (
      <p className="text-[13px] leading-relaxed text-norma-subtle">
        Aún no hay PDF, Word ni HTML extraídos de esta fuente.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <KindSection title="Documentos PDF" pages={pdf} onOpen={onOpen} />
      <KindSection title="Documentos Word" pages={word} onOpen={onOpen} />
      <KindSection title="Páginas HTML" pages={html} onOpen={onOpen} />
      <KindSection title="Otros archivos" pages={other} onOpen={onOpen} />
    </div>
  )
}

export function ExtractedPageModal({
  doc,
  onClose,
}: {
  doc: DocumentListItem | null
  onClose: () => void
}) {
  const [detail, setDetail] = useState<DocumentDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!doc) {
      setDetail(null)
      setError(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setDetail(null)
    void documentsApi
      .get(doc.id)
      .then((next) => {
        if (!cancelled) setDetail(next)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(mapApiError(err, 'No se pudo leer el texto de esta página.'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [doc])

  const text = detail?.extractedText || doc?.textPreview

  return (
    <Modal
      open={Boolean(doc)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={doc ? pagePathLabel(doc.url, doc.filename) : 'Página'}
      description={doc?.url ?? 'Texto extraído de la página rastreada.'}
      className="w-[min(94vw,56rem)] max-h-[min(90dvh,52rem)] overflow-hidden"
    >
      <div className="min-h-0 max-h-[min(72dvh,40rem)] overflow-y-auto pr-1">
        {loading && !text ? (
          <p className="text-sm text-norma-muted">Leyendo el texto extraído…</p>
        ) : error ? (
          <p className="text-sm text-norma-coral" role="alert">
            {error}
          </p>
        ) : text ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-norma-fg">
            {text}
          </p>
        ) : (
          <p className="text-sm text-norma-subtle">
            Esta página aún no tiene texto extraído.
          </p>
        )}
      </div>
    </Modal>
  )
}
