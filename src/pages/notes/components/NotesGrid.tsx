import { NoteCard } from './NoteCard'
import type { Note } from '../types'

interface NotesGridProps {
  notes: Note[]
  onEdit: (note: Note) => void
  onDelete: (note: Note) => void
}

export function NotesGrid({ notes, onEdit, onDelete }: NotesGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map(note => (
        <NoteCard
          key={note.id}
          title={note.title}
          content={note.content}
          date={note.date}
          color={note.color}
          onEdit={() => onEdit(note)}
          onDelete={() => onDelete(note)}
        />
      ))}
    </div>
  )
}
