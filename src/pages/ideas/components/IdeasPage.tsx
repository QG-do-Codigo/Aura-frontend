import { Lightbulb } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { DeleteIdeaDialog } from './DeleteIdeaDialog'
import { IdeaDialog } from './IdeaFormDialog'
import { IdeasGrid } from './IdeasGrid'
import { ideasService } from '../../../services/ideas/ideasService'
import type { Idea, IdeaCategory, IdeaFormData } from '../types'
import { ToastAlert } from '../../../utils/toastAlert'

const fallbackIdeaCategories: IdeaCategory[] = [
  { id: 'negocios', name: 'Negócios' },
  { id: 'pessoal', name: 'Pessoal' },
  { id: 'casa', name: 'Casa' },
  { id: 'aprendizado', name: 'Aprendizado' },
  { id: 'viagem', name: 'Viagem' },
  { id: 'saude', name: 'Saúde' },
  { id: 'arte', name: 'Arte' },
  { id: 'foto', name: 'Foto' },
  { id: 'meta', name: 'Meta' },
  { id: 'inspiracao', name: 'Inspiração' },
]

export function IdeasPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [action, setAction] = useState<'edit' | 'delete' | null>(null)

  const [ideas, setIdeas] = useState<Idea[]>([])
  const [categories, setCategories] = useState<IdeaCategory[]>([])
  const [loading, setLoading] = useState(true)

  const categoriesById = useMemo(() => {
    return Object.fromEntries(categories.map(category => [category.id, category.name]))
  }, [categories])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [categoriesResult, ideasResult] = await Promise.allSettled([
          ideasService.listCategories(),
          ideasService.listIdeas(),
        ])

        if (cancelled) return

        const categoriesData =
          categoriesResult.status === 'fulfilled'
            ? categoriesResult.value.filter(
                category =>
                  Boolean(category.id?.trim()) && Boolean(category.name?.trim())
              )
            : []

        setCategories(
          categoriesData.length ? categoriesData : fallbackIdeaCategories
        )

        setIdeas(
          ideasResult.status === 'fulfilled' ? ideasResult.value : []
        )
      } catch {
        if (!cancelled) {
          setCategories(fallbackIdeaCategories)
          setIdeas([])
          ToastAlert('Erro ao carregar ideias.', 'error')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedIdea = ideas.find(idea => idea.id === selectedId) ?? null

  function handleEdit(id: string) {
    setSelectedId(id)
    setAction('edit')
  }

  function handleDelete(id: string) {
    setSelectedId(id)
    setAction('delete')
  }

  function clearSelection() {
    setSelectedId(null)
    setAction(null)
  }

  async function handleCreate(data: IdeaFormData) {
    try {
      const created = await ideasService.createIdea(data)
      setIdeas(prev => [created, ...prev])
      ToastAlert('Ideia cadastrada com sucesso!', 'success')
    } catch {
      ToastAlert('Erro ao cadastrar ideia.', 'error')
    }
  }

  async function handleUpdate(data: IdeaFormData) {
    if (!selectedIdea) return
    try {
      const updated = await ideasService.updateIdea(selectedIdea.id, data)
      setIdeas(prev =>
        prev.map(idea => (idea.id === updated.id ? updated : idea))
      )
      ToastAlert('Ideia atualizada com sucesso!', 'success')
    } catch {
      ToastAlert('Erro ao atualizar ideia.', 'error')
    }
  }

  async function handleDelete(id: string) {
    try {
      await ideasService.deleteIdea(id)
      setIdeas(prev => prev.filter(idea => idea.id !== id))
      ToastAlert('Ideia removida.', 'success')
    } catch {
      ToastAlert('Erro ao excluir ideia.', 'error')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="relative overflow-hidden rounded-[32px] border border-amber-100 bg-amber-50/80 px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full border border-amber-200/70" />
        <div className="pointer-events-none absolute -right-6 top-12 h-36 w-36 rounded-full border border-amber-200/50" />

        <div className="relative flex flex-col items-center gap-4 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-amber-500 shadow-sm">
            <Lightbulb size={22} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Onde a magica acontece.
          </h1>
          <p className="max-w-2xl text-sm text-slate-500 sm:text-base">
            Capture flashes de genialidade antes que eles sumam. Sua Aura de
            criatividade esta ativa.
          </p>
        </div>
      </section>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-600">
            <Lightbulb size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Ideias que iluminam caminhos
            </h2>
            <p className="text-slate-500">
              Onde a magica continua acontecendo.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <IdeaDialog categories={categories} onSubmit={handleCreate} />
        </div>
      </header>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Carregando ideias...
        </div>
      ) : ideas.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Nenhuma ideia cadastrada ainda.
        </div>
      ) : (
        <IdeasGrid
          ideas={ideas}
          categoriesById={categoriesById}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {action === 'edit' && selectedIdea && (
        <IdeaDialog
          open
          initialData={selectedIdea}
          categories={categories}
          onSubmit={handleUpdate}
          onOpenChange={open => !open && clearSelection()}
        />
      )}
      <DeleteIdeaDialog
        idea={selectedIdea}
        open={action === 'delete'}
        onClose={clearSelection}
        onConfirm={handleDelete}
      />
    </div>
  )
}
