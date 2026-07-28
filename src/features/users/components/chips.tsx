import { Badge } from '@/shared/ui/badge'
import type { UserRole } from '@/features/users/types/user'
import { USER_ROLE_LABELS } from '@/features/users/types/user'

export function StatusBadge({ status }: { status: 'ACTIVE' | 'INACTIVE' }) {
  return (
    <Badge variant={status === 'ACTIVE' ? 'active' : 'inactive'}>
      {status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
    </Badge>
  )
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge variant={role === 'ADMIN' ? 'accent' : 'signal'}>
      {USER_ROLE_LABELS[role]}
    </Badge>
  )
}
