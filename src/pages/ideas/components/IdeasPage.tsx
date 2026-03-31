import { Lightbulb } from 'lucide-react'
import { useState } from 'react'

import { DeleteIdeaDialog } from './DeleteIdeaDialog'
import { IdeaDialog } from './IdeaFormDialog'
import { IdeasGrid } from './IdeasGrid'
import { ideasMock } from '../mocks/ideasMock'

export function IdeasPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [action, setAction] = useState<'edit' | 'delete' | null>(null)

  const ideas = ideasMock

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
          <button
            type="button"
            className="rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
          >
            Favoritas
          </button>
          <IdeaDialog onSubmit={async () => {}} />
        </div>
      </header>

      <IdeasGrid ideas={ideas} onEdit={handleEdit} onDelete={handleDelete} />
      {action === 'edit' && selectedIdea && (
        <IdeaDialog
          open
          initialData={selectedIdea}
          onSubmit={async () => {}}
          onOpenChange={open => !open && clearSelection()}
        />
      )}
      <DeleteIdeaDialog
        idea={selectedIdea}
        open={action === 'delete'}
        onClose={clearSelection}
        onConfirm={() => {}}
      />
    </div>
  )
}
