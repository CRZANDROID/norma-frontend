import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'
import { UnsavedChangesDialog } from '@/shared/ui/unsaved-changes-dialog'

/**
 * Avisa al cerrar/refrescar la pestaña (`beforeunload`, diálogo nativo del
 * navegador — no personalizable) y bloquea navegación in-app con un modal
 * del design system. Requiere data router (`createBrowserRouter`).
 */
export function UnsavedChangesGuard({ when }: { when: boolean }) {
  useEffect(() => {
    if (!when) return
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [when])

  const blocker = useBlocker(when)

  return (
    <UnsavedChangesDialog
      open={blocker.state === 'blocked'}
      onStay={() => {
        if (blocker.state === 'blocked') blocker.reset()
      }}
      onLeave={() => {
        if (blocker.state === 'blocked') blocker.proceed()
      }}
    />
  )
}
