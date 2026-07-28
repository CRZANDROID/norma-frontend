import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/shared/lib/utils'

export function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-[11px] font-medium uppercase tracking-[0.14em] text-norma-subtle',
        className,
      )}
      {...props}
    />
  )
}
