import { useState } from 'react'
import { X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { duration, easeOut } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export function StatusBadge({ status }: { status: 'ACTIVE' | 'INACTIVE' }) {
  return (
    <Badge variant={status === 'ACTIVE' ? 'active' : 'inactive'}>
      {status === 'ACTIVE' ? 'Activa' : 'Pausada'}
    </Badge>
  )
}

export function KeywordChips({
  items,
  tone = 'signal',
}: {
  items: string[]
  tone?: 'signal' | 'accent'
}) {
  const reduceMotion = useReducedMotion()
  if (!items.length) {
    return <span className="text-xs text-norma-subtle">Sin palabras guía</span>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <motion.span
          key={item}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: duration.fast,
            ease: easeOut,
            delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.24),
          }}
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-semibold',
            tone === 'signal'
              ? 'bg-norma-signal/12 text-norma-signal ring-1 ring-norma-signal/15'
              : 'bg-norma-accent/12 text-norma-accent ring-1 ring-norma-accent/15',
          )}
        >
          {item}
        </motion.span>
      ))}
    </div>
  )
}

export function ChipInput({
  label,
  values,
  onChange,
  placeholder,
  helper,
}: {
  label: string
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  helper?: string
}) {
  const [draft, setDraft] = useState('')

  function addChip() {
    const value = draft.trim()
    if (!value) return
    if (values.includes(value)) {
      setDraft('')
      return
    }
    onChange([...values, value])
    setDraft('')
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-subtle">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-1 rounded-full bg-norma-signal/12 px-2.5 py-1 text-[11px] font-semibold text-norma-signal"
          >
            {value}
            <button
              type="button"
              aria-label={`Quitar ${value}`}
              className="rounded-full p-0.5 transition-colors hover:bg-norma-navy/10"
              onClick={() => onChange(values.filter((v) => v !== value))}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addChip()
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addChip}>
          Añadir
        </Button>
      </div>
      {helper ? <p className="text-xs text-norma-subtle">{helper}</p> : null}
    </div>
  )
}
