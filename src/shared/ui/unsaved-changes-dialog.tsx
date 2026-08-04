import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'

export const UNSAVED_CHANGES_TITLE = 'Cambios sin guardar'
export const UNSAVED_CHANGES_DESCRIPTION =
  'Si sales ahora, se perderán los cambios que no hayas guardado.'

export function UnsavedChangesDialog({
  open,
  onStay,
  onLeave,
}: {
  open: boolean
  onStay: () => void
  onLeave: () => void
}) {
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) onStay()
      }}
      title={UNSAVED_CHANGES_TITLE}
      description={UNSAVED_CHANGES_DESCRIPTION}
      overlayClassName="z-[70]"
      className="z-[70]"
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onStay}>
          Seguir editando
        </Button>
        <Button type="button" variant="danger" onClick={onLeave}>
          Salir sin guardar
        </Button>
      </div>
    </Modal>
  )
}
