import { useEffect, useState } from 'react'

import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/UI/dialog'
import { Button } from '../../../components/UI/button'
import { Input } from '../../../components/UI/input'
import { Textarea } from '../../../components/UI/textarea'
import type { Note } from '../types'

const COLORS = [
  'bg-[var(--note-red)]',
  'bg-[var(--note-green)]',
  'bg-[var(--note-blue)]',
  'bg-[var(--note-yellow)]',
  'bg-[var(--note-purple)]',
]
interface noteDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialData?: Note | null
  onSubmit: (note: Note) => void
}

export function NoteDialog({
  open: controlledOpen,
  onOpenChange,
  initialData,
  onSubmit,
}: noteDialogProps) {
  const [open, setOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const dialogOpen = isControlled ? controlledOpen : open
  const setDialogOpen = onOpenChange ?? setOpen

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [selectedColor, setSelectedColor] = useState(
    initialData?.color ?? COLORS[0]
  )

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setContent(initialData.content)
      setSelectedColor(initialData.color)
    }
  }, [initialData])

  function handleSubmit() {
    const note: Note = {
      id: initialData?.id ?? crypto.randomUUID(),
      title,
      content,
      color: selectedColor,
      date: '',
    }

    onSubmit(note)
    setOpen(false)

    setTitle('')
    setContent('')
  }
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!initialData && (
        <DialogTrigger asChild>
          <Button className="rounded-full w-14 h-14 shadow-lg shadow-amber-100 bg-amber-400 hover:bg-amber-500 text-white p-0">
            <Plus size={28} />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-slate-700">
            Nova anotação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            className=" rounded-[8px] border-slate-200 bg-slate-50/50 px-6"
            placeholder="Título da nota"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <Textarea
            className=" rounded-[8px] border-slate-200 bg-slate-50/50 px-6 min-h-[120px]"
            placeholder="Escreva sua ideia..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />

          <div className="flex gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`
                  w-6 h-6 rounded-full border
                  ${color}
                  ${selectedColor === color ? 'ring-2 ring-slate-400' : ''}
                `}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="mt-6 flex  align-center justify-center">
          <Button
            onClick={() => setDialogOpen(false)}
            className=" bg-primary hover:bg-primary-hover  rounded-[8px]"
          >
            {initialData ? 'Salvar alterações' : 'Criar nota'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
