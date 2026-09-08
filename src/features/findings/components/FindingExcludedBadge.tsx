import { Badge } from '@/shared/ui/badge'

export function FindingExcludedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="caution" className={className}>
      Fuera del informe
    </Badge>
  )
}
