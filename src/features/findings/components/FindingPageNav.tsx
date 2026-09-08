import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function FindingPageNav({
  page,
  totalPages,
  disabled = false,
  onPrev,
  onNext,
}: {
  page: number
  totalPages: number
  disabled?: boolean
  onPrev: () => void
  onNext: () => void
}) {
  if (totalPages <= 1) return null
  return (
    <div
      className="flex items-center gap-1"
      role="navigation"
      aria-label="Páginas de hallazgos"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="size-9 px-0"
        disabled={disabled || page <= 1}
        aria-label="Página anterior"
        onClick={onPrev}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Button>
      <p
        className="min-w-[4.5rem] text-center font-mono text-[11px] tabular-nums text-norma-muted"
        aria-live="polite"
      >
        {page} / {totalPages}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="size-9 px-0"
        disabled={disabled || page >= totalPages}
        aria-label="Página siguiente"
        onClick={onNext}
      >
        <ChevronRight className="size-4" aria-hidden />
      </Button>
    </div>
  )
}
