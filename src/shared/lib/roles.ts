/** ADMIN y ANALYST recorren el flujo operativo. El alta de usuarios sigue siendo solo ADMIN. */
export function canOperate(role: string | null | undefined) {
  return role === 'ADMIN' || role === 'ANALYST'
}
