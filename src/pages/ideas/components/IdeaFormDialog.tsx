import { useEffect, useState } from 'react'

import {
  BookOpen,
  Camera,
  Heart,
  Home,
  Lightbulb,
  Moon,
  Palette,
  Plus,
  Rocket,
  Sparkles,
  Star,
  Sun,
  Target,
} from 'lucide-react'
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
import type { Idea } from '../types'

const COLORS = ['#EE9A9A', '#7EDCA3', '#89B7E6', '#EBD67A', '#AEA0E6']
const TITLE_MAX_LENGTH = 36
const CONTENT_MAX_LENGTH = 320
const CATEGORIES = [
  'IDEIA DE NEGOCIO',
  'PROJETO PESSOAL',
  'CASA',
  'APRENDIZADO',
  'VIAGEM',
  'SAUDE E BEM-ESTAR',
]

const ICONS = [
  { id: 'lightbulb', Icon: Lightbulb, color: 'text-amber-500' },
  { id: 'star', Icon: Star, color: 'text-amber-400' },
  { id: 'heart', Icon: Heart, color: 'text-rose-400' },
  { id: 'home', Icon: Home, color: 'text-emerald-500' },
  { id: 'camera', Icon: Camera, color: 'text-slate-500' },
  { id: 'book', Icon: BookOpen, color: 'text-orange-400' },
  { id: 'palette', Icon: Palette, color: 'text-fuchsia-500' },
  { id: 'target', Icon: Target, color: 'text-sky-500' },
  { id: 'rocket', Icon: Rocket, color: 'text-red-500' },
  { id: 'sparkles', Icon: Sparkles, color: 'text-yellow-500' },
  { id: 'sun', Icon: Sun, color: 'text-amber-500' },
  { id: 'moon', Icon: Moon, color: 'text-indigo-500' },
]

interface IdeaDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialData?: Idea | null
  onSubmit: (idea: Idea) => void | Promise<void>
  triggerLabel?: string
  triggerClassName?: string
}

export function IdeaDialog({
  open: controlledOpen,
  onOpenChange,
  initialData,
  onSubmit,
  triggerLabel = 'Nova ideia',
  triggerClassName,
}: IdeaDialogProps) {
  const [open, setOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const dialogOpen = isControlled ? controlledOpen : open
  const setDialogOpen = onOpenChange ?? setOpen

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [selectedColor, setSelectedColor] = useState(
    initialData?.color ?? COLORS[0]
  )
  const [category, setCategory] = useState(CATEGORIES[0])
  const [tags, setTags] = useState('')
  const [selectedIconId, setSelectedIconId] = useState(ICONS[0].id)

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setContent(initialData.content)
      setSelectedColor(initialData.color)
      setCategory(initialData.category ?? CATEGORIES[0])
      setTags(initialData.tags?.join(', ') ?? '')
      const iconMatch = ICONS.find(item => item.Icon === initialData.icon)
      if (iconMatch) setSelectedIconId(iconMatch.id)
    }
  }, [initialData])

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return
    if (title.trim().length > TITLE_MAX_LENGTH) return
    if (content.trim().length > CONTENT_MAX_LENGTH) return

    const iconMatch = ICONS.find(item => item.id === selectedIconId)
    const idea: Idea = {
      id: initialData?.id ?? '',
      title: title.trim(),
      content: content.trim(),
      color: selectedColor,
      date: '',
      category,
      tags: tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      icon: iconMatch?.Icon ?? Lightbulb,
    }

    try {
      await onSubmit(idea)
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
          <Button
            className={
              triggerClassName ??
              'rounded-full bg-orange-500 px-5 py-2 text-white shadow-md hover:bg-orange-600'
            }
          >
            <Plus size={16} />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-100 text-orange-500">
              <Lightbulb size={18} />
            </span>
            {initialData ? 'Editar Ideia' : 'Nova Ideia'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Titulo da ideia
            </p>
            <Input
              className="w-full rounded-[12px] border-slate-200 bg-slate-50/60 px-5"
              placeholder="Ex: Startup Sustentavel, Podcast"
              value={title}
              maxLength={TITLE_MAX_LENGTH}
              onChange={e =>
                setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH))
              }
            />
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Descricao
            </p>
            <Textarea
              className="w-full rounded-[16px] border-slate-200 bg-slate-50/60 px-5 min-h-[120px] whitespace-pre-wrap break-all"
              style={{ overflowWrap: 'anywhere' }}
              placeholder="Descreva sua ideia em detalhes..."
              value={content}
              maxLength={CONTENT_MAX_LENGTH}
              onChange={e =>
                setContent(e.target.value.slice(0, CONTENT_MAX_LENGTH))
              }
            />
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Categoria
            </p>
            <div className="relative">
              <select
                value={category}
                onChange={event => setCategory(event.target.value)}
                className="h-12 w-full appearance-none rounded-[14px] border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none"
              >
                {CATEGORIES.map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
              </span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Icone
              </p>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map(({ id, Icon, color }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedIconId(id)}
                    className={`grid h-10 w-10 place-items-center rounded-xl border ${
                      selectedIconId === id
                        ? 'border-orange-400 bg-orange-50 text-orange-500'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                    aria-pressed={selectedIconId === id}
                  >
                    <Icon
                      size={16}
                      className={
                        selectedIconId === id ? 'text-orange-500' : color
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Cor do card
              </p>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    className={`h-10 w-10 rounded-xl border-2 transition ${
                      selectedColor === color
                        ? 'border-slate-400'
                        : 'border-transparent'
                    }`}
                    aria-label={`Selecionar cor ${color}`}
                    aria-pressed={selectedColor === color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            className="rounded-full px-5"
            onClick={() => setDialogOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-full bg-orange-500 px-6 hover:bg-orange-600"
          >
            {initialData ? 'Salvar ideia' : 'Salvar ideia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
