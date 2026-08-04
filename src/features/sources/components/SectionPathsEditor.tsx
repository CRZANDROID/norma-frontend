import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import {
  formatSectionPath,
  parseSectionPathInput,
  type SourceSectionPath,
} from '@/features/sources/types/source'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export function SectionPathsEditor({
  paths,
  onChange,
  disabled,
  id = 'source-sections',
}: {
  paths: SourceSectionPath[]
  onChange: (paths: SourceSectionPath[]) => void
  disabled?: boolean
  id?: string
}) {
  const [draft, setDraft] = useState('')

  function addPath() {
    const parsed = parseSectionPathInput(draft)
    if (!parsed) return
    const key = formatSectionPath(parsed)
    if (paths.some((p) => formatSectionPath(p) === key)) {
      setDraft('')
      return
    }
    onChange([...paths, parsed])
    setDraft('')
  }

  function removeAt(index: number) {
    onChange(paths.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Secciones</Label>
      <p className="text-xs text-norma-subtle">
        Usa <span className="font-mono">›</span> o{' '}
        <span className="font-mono">&gt;</span> para subsecciones. Ej.{' '}
        <span className="font-mono">
          Comunicados &gt; Normatividad &gt; Alertas sanitarias
        </span>
      </p>

      {paths.length > 0 ? (
        <ul className="space-y-1.5">
          {paths.map((path, index) => (
            <li
              key={`${formatSectionPath(path)}-${index}`}
              className="flex items-center gap-2 rounded-2xl border-2 border-norma-border bg-norma-raised px-3 py-2"
            >
              <span className="min-w-0 flex-1 text-sm text-norma-fg">
                {formatSectionPath(path)}
              </span>
              {!disabled ? (
                <button
                  type="button"
                  aria-label={`Quitar sección ${formatSectionPath(path)}`}
                  onClick={() => removeAt(index)}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl text-norma-muted transition-colors hover:bg-norma-surface hover:text-norma-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent/45"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border-2 border-dashed border-norma-border px-3 py-3 text-xs text-norma-subtle">
          Sin secciones definidas.
        </p>
      )}

      {!disabled ? (
        <div className="flex gap-2">
          <Input
            id={id}
            name="sections"
            autoComplete="off"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addPath()
              }
            }}
            placeholder="Comunicados > Normatividad > Alertas sanitarias"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addPath}
            disabled={!draft.trim()}
            aria-label="Añadir sección"
          >
            <Plus className="size-4" aria-hidden />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
