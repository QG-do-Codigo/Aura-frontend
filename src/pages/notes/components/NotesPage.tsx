import { useEffect, useState } from 'react'
import { Loader2, Search, X } from 'lucide-react'
import { NotesGrid } from './NotesGrid'

import { NoteDialog } from './NoteFormDialog'
import { DeleteNoteDialog } from './DeleteNoteDialog'
import { useNotes } from '../../../hooks/useNotes'
import { Input } from '../../../components/UI/input'

export function NotesPage() {
  const {
    notes,
    selectedNote,
    action,
    isFiltering,

    addNote,
    editNote,
    deleteNote,
    filterNotesByTitle,

    startEdit,
    startDelete,
    clearSelection,
  } = useNotes()
  const [titleFilter, setTitleFilter] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      void filterNotesByTitle(titleFilter)
    }, 350)

    return () => clearTimeout(timeout)
  }, [titleFilter, filterNotesByTitle])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Notas Rápidas</h2>
          <p className="text-slate-500">Onde suas ideias ganham vida.</p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={titleFilter}
              onChange={event => setTitleFilter(event.target.value)}
              placeholder="Filtrar título"
              className="h-10 rounded-xl border-slate-200 bg-white pl-9 pr-16"
            />

            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {isFiltering && (
                <Loader2 size={14} className="animate-spin text-slate-400" />
              )}
              {titleFilter && (
                <button
                  type="button"
                  onClick={() => setTitleFilter('')}
                  className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Limpar filtro"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <NoteDialog onSubmit={addNote} />
        </div>
      </header>

      <NotesGrid notes={notes} onEdit={startEdit} onDelete={startDelete} />
      {action === 'edit' && selectedNote && (
        <NoteDialog
          open
          initialData={selectedNote}
          onSubmit={editNote}
          onOpenChange={open => !open && clearSelection()}
        />
      )}
      <DeleteNoteDialog
        note={selectedNote}
        open={action === 'delete'}
        onClose={clearSelection}
        onConfirm={deleteNote}
      />
    </div>
  )
}
