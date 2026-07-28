import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-[transform,background-color,box-shadow,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-norma-accent focus-visible:ring-offset-2 focus-visible:ring-offset-norma-bg active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-norma-accent text-white shadow-[0_10px_28px_-12px_rgba(105,88,248,0.75)] hover:bg-norma-accent-soft hover:shadow-[0_14px_32px_-12px_rgba(105,88,248,0.85)]',
        ghost: 'text-norma-muted hover:bg-norma-raised hover:text-norma-fg',
        outline:
          'border-2 border-norma-border bg-norma-raised text-norma-fg hover:bg-norma-surface',
        danger:
          'bg-norma-coral/10 text-norma-coral border border-norma-coral/25 hover:bg-norma-coral/20',
        signal:
          'bg-norma-signal/10 text-norma-signal border border-norma-signal/25 hover:bg-norma-signal/20',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-xl px-3 text-xs',
        lg: 'h-11 rounded-2xl px-6',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
