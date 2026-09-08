import * as React from 'react'
import { cn } from '@/shared/lib/utils'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-32 w-full resize-y rounded-2xl border-2 border-norma-border bg-norma-raised px-3 py-2.5 text-sm text-norma-fg placeholder:text-norma-subtle outline-none transition-[box-shadow,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:border-norma-accent focus-visible:ring-2 focus-visible:ring-norma-accent/25 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    ref={ref}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
