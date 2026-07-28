import { cn } from '@/shared/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-norma-navy/8',
        className,
      )}
    />
  )
}
