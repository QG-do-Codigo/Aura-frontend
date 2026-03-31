import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/UI/dialog'
import { Button } from '../../../components/UI/button'
import type { HealthItem } from '../types'

interface HealthDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: HealthItem | null
  onConfirm: () => void
}

export function HealthDeleteDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: HealthDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Excluir rotina</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-slate-600">
          Tem certeza que deseja excluir{' '}
          <span className="font-semibold">{item?.title ?? 'esta rotina'}</span>?
        </div>
        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="rounded-full bg-rose-500 text-white hover:bg-rose-600"
            onClick={onConfirm}
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
