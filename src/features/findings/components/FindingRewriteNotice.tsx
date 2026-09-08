import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Sparkles, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { duration, easeOut } from '@/shared/lib/motion'

export const FINDING_REWRITE_HINT_HOST_ID = 'finding-rewrite-hint-host'

export type RewriteHintTone = 'note' | 'blocked'

export type RewriteHint = {
  tone: RewriteHintTone
  text: string
}

const AUTO_DISMISS_MS = 6500

export function FindingRewriteNotice({
  hint,
  onDismiss,
}: {
  hint: RewriteHint | null
  onDismiss: () => void
}) {
  const reduceMotion = useReducedMotion()
  const host =
    typeof document === 'undefined'
      ? null
      : document.getElementById(FINDING_REWRITE_HINT_HOST_ID)

  useEffect(() => {
    if (!hint) return
    const id = window.setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => window.clearTimeout(id)
  }, [hint, onDismiss])

  if (!host) return null

  return createPortal(
    <AnimatePresence>
      {hint ? (
        <motion.div
          key={`${hint.tone}:${hint.text}`}
          role="status"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 10 }
          }
          transition={{
            duration: reduceMotion ? duration.fast : duration.modal,
            ease: easeOut,
          }}
          className="pointer-events-auto flex w-full max-w-[22.5rem] items-center gap-2.5 rounded-2xl bg-norma-navy px-3 py-2 pl-3.5 text-white shadow-[0_16px_40px_-18px_rgba(13,27,42,0.7)]"
        >
          <span
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              hint.tone === 'blocked' ? 'bg-norma-coral' : 'bg-norma-accent-soft',
            )}
            aria-hidden
          />
          <Sparkles className="size-3.5 shrink-0 text-norma-accent-soft" aria-hidden />
          <p className="min-w-0 flex-1 text-[13px] leading-snug text-white/95">
            {hint.text}
          </p>
          <button
            type="button"
            aria-label="Cerrar aviso"
            onClick={onDismiss}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white/12 text-white transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent-soft active:scale-[0.97]"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    host,
  )
}
