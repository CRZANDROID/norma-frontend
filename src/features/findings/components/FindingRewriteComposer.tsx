import { useEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react'
import { ArrowUp, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/shared/lib/utils'
import { NormaBorderBeam } from '@/shared/ui/border-beam'
import { NormaThinkingOrb } from '@/shared/ui/thinking-orb'

export const REWRITE_PROMPT_MAX = 2000

const FIELD =
  'bg-[color-mix(in_oklab,var(--color-norma-bg),var(--color-norma-navy)_22%)]'

/** Library md stroke is 1px at ~0.26 opacity; these CSS vars make the orbit readable. */
const BEAM_STYLE = {
  '--beam-stroke-opacity': 6,
  '--beam-inner-opacity': 3,
  '--beam-bloom-opacity': 4,
} as CSSProperties

const BEAM_SPIN_S = 2.5

const ORBIT =
  'pointer-events-none absolute inset-[-75%] bg-[conic-gradient(from_0deg,transparent_0_58%,var(--color-norma-signal)_68%,var(--color-norma-accent-soft)_78%,var(--color-norma-accent)_86%,var(--color-norma-accent-soft)_92%,transparent_97%)]'

export function FindingRewriteComposer({
  prompt,
  rewriting,
  onPromptChange,
  onSubmit,
}: {
  prompt: string
  rewriting: boolean
  onPromptChange: (value: string) => void
  onSubmit: () => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const reduceMotion = useReducedMotion()
  const canSend = !rewriting && !!prompt.trim()

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    if (canSend) onSubmit()
  }

  return (
    <NormaBorderBeam
      theme="dark"
      colorVariant="ocean"
      strength={1}
      brightness={2.1}
      saturation={1.45}
      hueRange={16}
      duration={BEAM_SPIN_S}
      style={BEAM_STYLE}
    >
      <div className="relative overflow-hidden rounded-[1.35rem] p-[1.5px]">
        {reduceMotion ? (
          <span aria-hidden className={cn(ORBIT, 'opacity-80')} />
        ) : (
          <motion.span
            aria-hidden
            className={ORBIT}
            animate={{ rotate: 360 }}
            transition={{ duration: BEAM_SPIN_S, ease: 'linear', repeat: Infinity }}
          />
        )}
        <div
          className={cn(
            'relative flex min-h-[10.5rem] flex-col rounded-[1.25rem] px-3.5 pb-2.5 pt-3',
            FIELD,
          )}
          onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest('button')) return
            textareaRef.current?.focus()
          }}
        >
          <div className="flex min-h-0 flex-1 items-start gap-2.5">
            <Sparkles className="mt-1 size-3.5 shrink-0 text-norma-accent" aria-hidden />
            <textarea
              ref={textareaRef}
              id="finding-rewrite-prompt"
              aria-label="Qué debe cambiar"
              rows={3}
              maxLength={REWRITE_PROMPT_MAX}
              disabled={rewriting}
              placeholder="Qué debe cambiar en el briefing…"
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              onKeyDown={onKeyDown}
              className="field-sizing-content max-h-40 min-h-[4.75rem] w-full flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-norma-fg outline-none placeholder:text-norma-subtle disabled:cursor-not-allowed disabled:opacity-55"
            />
          </div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="pb-2 text-[11px] tabular-nums text-norma-subtle">
              {prompt.trim().length}/{REWRITE_PROMPT_MAX}
            </p>
            <button
              type="button"
              disabled={!canSend && !rewriting}
              aria-label={rewriting ? 'Reescribiendo briefing' : 'Reescribir briefing'}
              onClick={() => {
                if (canSend) onSubmit()
              }}
              className={cn(
                'inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[color-mix(in_oklab,var(--color-norma-bg),var(--color-norma-navy)_22%)] active:scale-[0.97] disabled:pointer-events-none',
                rewriting
                  ? 'bg-norma-accent/20 text-norma-accent'
                  : canSend
                    ? 'bg-norma-accent text-white hover:bg-norma-accent-soft'
                    : 'bg-norma-navy/12 text-norma-navy/70',
              )}
            >
              {rewriting ? (
                <NormaThinkingOrb state="composing" size={20} aria-hidden />
              ) : (
                <ArrowUp className="size-4" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>
    </NormaBorderBeam>
  )
}
