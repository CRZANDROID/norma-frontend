import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { duration, easeOut, fadeScale } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-norma-navy/35 backdrop-blur-[6px]"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.fast, ease: easeOut }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={reduceMotion ? false : fadeScale.initial}
                animate={fadeScale.animate}
                exit={fadeScale.exit}
                transition={{ duration: duration.modal, ease: easeOut }}
                className={cn(
                  'fixed left-1/2 top-1/2 z-50 w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 border-norma-border bg-norma-surface p-6 shadow-[0_24px_60px_-20px_rgba(13,27,42,0.4)] outline-none',
                  className,
                )}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="font-display text-xl font-semibold tracking-tight text-norma-fg">
                      {title}
                    </Dialog.Title>
                    {description ? (
                      <Dialog.Description className="mt-1 text-sm text-norma-muted">
                        {description}
                      </Dialog.Description>
                    ) : (
                      <Dialog.Description className="sr-only">
                        {title}
                      </Dialog.Description>
                    )}
                  </div>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" aria-label="Cerrar">
                      <X className="size-4" />
                    </Button>
                  </Dialog.Close>
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  )
}
