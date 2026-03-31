import type { HealthItem } from '../types'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/UI/dialog'
import { Button } from '../../../components/UI/button'

interface HealthDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: HealthItem | null
  isLoading: boolean
  onEdit: () => void
  onDelete: () => void
}

const HEALTH_TIME_ZONE = 'America/Sao_Paulo'

function formatTime(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: HEALTH_TIME_ZONE,
  })
}

export function HealthDetailsDialog({
  open,
  onOpenChange,
  item,
  isLoading,
  onEdit,
  onDelete,
}: HealthDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da rotina</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
            Carregando detalhes...
          </div>
        )}

        {!isLoading && !item && (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            Não foi possível carregar os detalhes.
          </div>
        )}

        {!isLoading && item && (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase text-slate-400">Título</p>
              <p className="text-base font-semibold text-slate-800">
                {item.title}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Descrição</p>
              <p className="text-sm text-slate-600">
                {item.description || 'Sem descrição.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase text-slate-400">Tipo</p>
                <p className="text-sm text-slate-700">
                  {item.type === 'MEDICINE' ? 'Medicamento' : 'Treino'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Repetição</p>
                <p className="text-sm text-slate-700">
                  {item.repeatDaily ? 'Diário' : 'Agendado'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Horário</p>
              <p className="text-sm text-slate-700">{formatTime(item.time)}</p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button
            type="button"
            className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
            onClick={onEdit}
            disabled={!item}
          >
            Editar
          </Button>
          <Button
            type="button"
            className="rounded-full bg-rose-500 text-white hover:bg-rose-600"
            onClick={onDelete}
            disabled={!item}
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
