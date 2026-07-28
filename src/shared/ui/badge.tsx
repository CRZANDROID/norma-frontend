import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
  {
    variants: {
      variant: {
        active: 'bg-norma-green/12 text-norma-green',
        inactive: 'bg-norma-navy/6 text-norma-subtle',
        signal: 'bg-norma-signal/12 text-norma-signal',
        accent: 'bg-norma-accent/12 text-norma-accent',
      },
    },
    defaultVariants: {
      variant: 'active',
    },
  },
)

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
