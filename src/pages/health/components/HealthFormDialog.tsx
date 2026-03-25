import { useEffect, useMemo, useState } from 'react'
import type { CreateHealthInput, HealthItem, HealthType } from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../../../components/UI/dialog'
import { Button } from '../../../components/UI/button'
import { Input } from '../../../components/UI/input'
import { Textarea } from '../../../components/UI/textarea'
import { Label } from '../../../components/UI/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/UI/select'
import { Switch } from '../../../components/UI/switch'

interface HealthFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateHealthInput, id?: string) => void
  initialData?: HealthItem | null
  defaultType?: HealthType
  allowTypeChange?: boolean
}

function toInputDate(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function HealthFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  defaultType,
  allowTypeChange = true,
}: HealthFormDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<HealthType>('MEDICINE')
  const [time, setTime] = useState('')
  const [repeatDaily, setRepeatDaily] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isEditing = Boolean(initialData?.id)

  useEffect(() => {
    if (!open) return
    setTitle(initialData?.title ?? '')
    setDescription(initialData?.description ?? '')
    setType(initialData?.type ?? defaultType ?? 'MEDICINE')
    setTime(toInputDate(initialData?.time) || '')
    setRepeatDaily(initialData?.repeatDaily ?? true)
    setSubmitError(null)
  }, [open, initialData, defaultType])

  const isValid = useMemo(
    () => title.trim().length > 0 && time.length > 0,
    [title, time]
  )

  async function handleSubmit() {
    if (!isValid) return
    try {
      await onSubmit(
        {
          title: title.trim(),
          description: description.trim(),
          type,
          time: new Date(time).toISOString(),
          repeatDaily,
        },
        initialData?.id
      )
      onOpenChange(false)
    } catch (err) {
      setSubmitError('Não foi possível salvar. Verifique os dados.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar rotina' : 'Rotina de saúde'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os detalhes do compromisso.'
              : 'Cadastre um medicamento ou treino para acompanhar.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {submitError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
              {submitError}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="health-title">Título</Label>
            <Input
              id="health-title"
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="Ex: Vitamina D"
              className="rounded-[10px] border-slate-200 bg-slate-50/70 px-4"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="health-description">Descrição</Label>
            <Textarea
              id="health-description"
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="Observações ou lembrete"
              className="rounded-[10px] border-slate-200 bg-slate-50/70 px-4"
            />
          </div>

          {allowTypeChange ? (
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select
                value={type}
                onValueChange={value => setType(value as HealthType)}
              >
                <SelectTrigger className="rounded-[10px] border-slate-200 bg-slate-50/70">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEDICINE">Medicamento</SelectItem>
                  <SelectItem value="WORKOUT">Treino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Input
                value={type === 'MEDICINE' ? 'Medicamento' : 'Treino'}
                readOnly
                className="rounded-[10px] border-slate-200 bg-slate-50/70 px-4 text-slate-500"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="health-time">Horário</Label>
            <Input
              id="health-time"
              type="datetime-local"
              value={time}
              onChange={event => setTime(event.target.value)}
              className="rounded-[10px] border-slate-200 bg-slate-50/70 px-4"
            />
          </div>

          <div className="flex items-center justify-between rounded-[12px] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Repetir diariamente</p>
              <p className="text-xs text-slate-500">
                Mantém o lembrete ativo todos os dias.
              </p>
            </div>
            <Switch checked={repeatDaily} onCheckedChange={setRepeatDaily} />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="rounded-full">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            {isEditing ? 'Salvar alterações' : 'Criar rotina'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
