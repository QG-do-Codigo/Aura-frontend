import { NotesGrid } from './notesGrid'
import { useNotes } from '../hooks/use.Notes'
import { NoteDialog } from './noteFormDialog'
import { DeleteNoteDialog } from './deleteNoteDialog'

export function NotesPage() {
  const {
    notes,
    selectedNote,
    action,

    addNote,
    editNote,
    deleteNote,

    startEdit,
    startDelete,
    clearSelection,
  } = useNotes()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Notas Rápidas</h2>
          <p className="text-slate-500">Onde suas ideias ganham vida.</p>
        </div>

        <NoteDialog onSubmit={addNote} />
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
