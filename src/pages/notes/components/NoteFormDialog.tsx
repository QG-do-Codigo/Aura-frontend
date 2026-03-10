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

const COLORS = ['#EE9A9A', '#7EDCA3', '#89B7E6', '#EBD67A', '#AEA0E6']
const TITLE_MAX_LENGTH = 30
const CONTENT_MAX_LENGTH = 320

interface NoteDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialData?: Note | null
  onSubmit: (note: Note) => void | Promise<void>
}

export function NoteDialog({
  open: controlledOpen,
  onOpenChange,
  initialData,
  onSubmit,
}: NoteDialogProps) {
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

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return
    if (title.trim().length > TITLE_MAX_LENGTH) return
    if (content.trim().length > CONTENT_MAX_LENGTH) return

    const note: Note = {
      id: initialData?.id ?? '',
      title: title.trim(),
      content: content.trim(),
      color: selectedColor,
      date: '',
    }

    try {
      await onSubmit(note)
      setDialogOpen(false)

      setTitle('')
      setContent('')
    } catch {
      // Error feedback is handled by the hook/service layer.
    }
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
            className="w-full rounded-[8px] border-slate-200 bg-slate-50/50 px-6"
            placeholder="Título da nota"
            value={title}
            maxLength={TITLE_MAX_LENGTH}
            onChange={e => setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH))}
          />
          <Textarea
            className="w-full rounded-[8px] border-slate-200 bg-slate-50/50 px-6 min-h-[120px] whitespace-pre-wrap break-all"
            style={{ overflowWrap: 'anywhere' }}
            placeholder="Escreva sua ideia..."
            value={content}
            maxLength={CONTENT_MAX_LENGTH}
            onChange={e =>
              setContent(e.target.value.slice(0, CONTENT_MAX_LENGTH))
            }
          />

          <div className="flex gap-3">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                style={{
                  backgroundColor: color,
                  borderColor: '#7FA4C2',
                  boxShadow:
                    selectedColor === color
                      ? '0 0 0 2px #7FA4C2'
                      : '0 0 0 0 transparent',
                }}
                className={`h-7 w-7 rounded-full border-2 transition ${selectedColor === color ? 'scale-105' : ''}`}
                aria-label={`Selecionar cor ${color}`}
                aria-pressed={selectedColor === color}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="mt-6 flex  align-center justify-center">
          <Button
            onClick={handleSubmit}
            className=" bg-primary hover:bg-primary-hover  rounded-[8px]"
          >
            {initialData ? 'Salvar alterações' : 'Criar nota'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
