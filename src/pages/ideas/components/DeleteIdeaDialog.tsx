import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/UI/dialog'
import { Button } from '../../../components/UI/button'

import type { Idea } from '../types'

interface Props {
  idea: Idea | null
  open: boolean
  onClose: () => void
  onConfirm: (id: string) => void
}

export function DeleteIdeaDialog({ idea, open, onClose, onConfirm }: Props) {
  if (!idea) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="text-xl rounded-2xl border-amber-200 border-4 px-6">
        <DialogHeader>
          <DialogTitle className="text-slate-500 text-3xl">
            Excluir ideia?
          </DialogTitle>
        </DialogHeader>

        <p className="text-slate-500 text-md mb-6">
          Essa ação não pode ser desfeita.
        </p>

        <DialogFooter>
          <Button variant="ghost" className="text-xl rounded-[10px]" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            variant="default"
            className="text-xl rounded-[10px]"
            onClick={() => {
              onConfirm(idea.id)
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
