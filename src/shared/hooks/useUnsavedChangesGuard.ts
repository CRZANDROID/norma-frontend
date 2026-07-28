import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'

const LEAVE_MESSAGE =
  'Tienes cambios sin guardar. ¿Salir sin guardar?'

/**
 * Warns on tab close/refresh (beforeunload) and blocks in-app
 * navigations via React Router when `dirty` is true.
 * Requires a data router (createBrowserRouter).
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const blocker = useBlocker(dirty)

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm(LEAVE_MESSAGE)) {
      blocker.proceed()
    } else {
      blocker.reset()
    }
  }, [blocker])
}

export function confirmDiscardIfDirty(dirty: boolean): boolean {
  if (!dirty) return true
  return window.confirm(LEAVE_MESSAGE)
}
