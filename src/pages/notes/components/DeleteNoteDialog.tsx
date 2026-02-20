import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/UI/dialog'
import { Button } from '../../../components/UI/button'

import type { Note } from '../types'

interface Props {
  note: Note | null
  open: boolean
  onClose: () => void
  onConfirm: (id: string) => void
}

export function DeleteNoteDialog({ note, open, onClose, onConfirm }: Props) {
  if (!note) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="text-xl  rounded-2xl border-amber-200 border-4  px-6">
        <DialogHeader>
          <DialogTitle className="text-slate-500 text-3xl ">
            Excluir nota?
          </DialogTitle>
        </DialogHeader>

        <p className="text-slate-500  text-md mb-6">
          Essa ação não pode ser desfeita.
        </p>

        <DialogFooter>
          <Button
            variant="ghost"
            className="text-xl rounded-[10px] "
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            variant="default"
            className="text-xl rounded-[10px] "
            onClick={() => {
              onConfirm(note.id)
              onClose()
            }}
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
