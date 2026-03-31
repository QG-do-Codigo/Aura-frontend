import type { ReactNode } from 'react'

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../UI/alert-dialog'

interface LogoutConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  trigger: ReactNode
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  trigger,
}: LogoutConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="rounded-[20px] border border-slate-200 bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900">
            Tem certeza que deseja sair?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500">
            Seu progresso ficará salvo, mas você precisará efetuar login novamente para voltar.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-3 mt-4">
          <AlertDialogCancel className="w-full sm:w-auto">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full sm:w-auto bg-rose-600 text-white hover:bg-rose-700"
          >
            Sair da conta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
