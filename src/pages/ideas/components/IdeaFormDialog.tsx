import { useEffect, useMemo, useState } from 'react'

import { Lightbulb, Plus } from 'lucide-react'
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
import type { Idea, IdeaCategory, IdeaFormData } from '../types'
import { getIdeaCategoryMeta } from '../categoryMeta'
import { ToastAlert } from '../../../utils/toastAlert'

const TITLE_MAX_LENGTH = 36
const CONTENT_MAX_LENGTH = 320

interface IdeaDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialData?: Idea | null
  categories: IdeaCategory[]
  onSubmit: (data: IdeaFormData) => void | Promise<void>
  triggerLabel?: string
  triggerClassName?: string
}

export function IdeaDialog({
  open: controlledOpen,
  onOpenChange,
  initialData,
  categories,
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
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '')

  const categoriesWithFallback = useMemo(() => categories ?? [], [categories])
  const initialDataId = initialData?.id ?? null
  const selectedCategoryName = useMemo(() => {
    return categoriesWithFallback.find(item => item.id === categoryId)?.name
  }, [categoriesWithFallback, categoryId])

  const { Icon: CategoryIcon, iconClassName: categoryIconClassName } =
    getIdeaCategoryMeta(selectedCategoryName)

  useEffect(() => {
    if (!initialData) return
    setTitle(initialData.title)
    setContent(initialData.content)
    setCategoryId(initialData.categoryId)
  }, [initialDataId])

  useEffect(() => {
    if (!initialData && !categoryId && categoriesWithFallback.length > 0) {
      setCategoryId(categoriesWithFallback[0].id)
    }
  }, [categoriesWithFallback, categoryId, initialData])

  async function handleSubmit() {
    if (!title.trim() || !content.trim() || !categoryId.trim()) {
      ToastAlert('Preencha título, descrição e categoria.', 'error')
      return
    }
    if (title.trim().length > TITLE_MAX_LENGTH) {
      ToastAlert(`Título deve ter no máximo ${TITLE_MAX_LENGTH} caracteres.`, 'error')
      return
    }
    if (content.trim().length > CONTENT_MAX_LENGTH) {
      ToastAlert(`Descrição deve ter no máximo ${CONTENT_MAX_LENGTH} caracteres.`, 'error')
      return
    }

    const idea: IdeaFormData = {
      title: title.trim(),
      content: content.trim(),
      categoryId: categoryId.trim(),
    }

    try {
      await onSubmit(idea)
      setDialogOpen(false)

      setTitle('')
      setContent('')
      setCategoryId(categoriesWithFallback[0]?.id ?? '')
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
            {initialData ? (
              <div className="flex items-center gap-3 rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-white border border-slate-200">
                  <CategoryIcon size={16} className={categoryIconClassName} />
                </span>
                <span>{selectedCategoryName ?? 'Categoria'}</span>
              </div>
            ) : (
              <>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={event => setCategoryId(event.target.value)}
                    className="h-12 w-full appearance-none rounded-[14px] border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none"
                    disabled={categoriesWithFallback.length === 0}
                  >
                    {categoriesWithFallback.length === 0 ? (
                      <option value="">Carregando categorias...</option>
                    ) : (
                      categoriesWithFallback.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))
                    )}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ▾
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-50 border border-slate-200">
                    <CategoryIcon size={16} className={categoryIconClassName} />
                  </span>
                  <span>Ícone automático pela categoria</span>
                </div>
              </>
            )}
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
