import { useState } from 'react'
import { NOTES_MOCK } from '../mocks/notes.mock'
import type { Note } from '../types'

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(NOTES_MOCK)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [action, setAction] = useState<'edit' | 'delete' | null>(null)

  function addNote(note: Note) {
    setNotes(prev => [note, ...prev])
  }

  function editNote(updated: Note) {
    setNotes(prev =>
      prev.map(note => (note.id === updated.id ? updated : note))
    )
  }

  function deleteNote(id: string) {
    setNotes(prev => prev.filter(note => note.id !== id))
  }

  // 👉 controla qual modal abrir
  function startEdit(note: Note) {
    setSelectedNote(note)
    setAction('edit')
  }

  function startDelete(note: Note) {
    setSelectedNote(note)
    setAction('delete')
  }

  function clearSelection() {
    setSelectedNote(null)
    setAction(null)
  }

  return {
    notes,
    selectedNote,
    action,

    addNote,
    editNote,
    deleteNote,

    startEdit,
    startDelete,
    clearSelection,
  }
}
