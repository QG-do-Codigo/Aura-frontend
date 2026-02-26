import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import type { Note } from '../pages/notes/types'
import type { NoteResponse } from '../services/notes/notesService'
import { notesService } from '../services/notes/notesService'
import { ToastAlert } from '../utils/toastAlert'

function mapNote(response: Partial<NoteResponse>, fallback?: Note): Note {
  const noteId = response.id ?? response._id ?? fallback?.id ?? ''
  const createdAt = response.createdAt ?? fallback?.createdAt

  return {
    id: noteId,
    title: response.title ?? fallback?.title ?? '',
    content: response.content ?? fallback?.content ?? '',
    color: response.color ?? fallback?.color ?? '#FFFFFF',
    createdAt,
    date: createdAt
      ? new Date(createdAt).toLocaleDateString('pt-BR')
      : '',
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [action, setAction] = useState<'edit' | 'delete' | null>(null)
  const [isFiltering, setIsFiltering] = useState(false)

  const filterNotesByTitle = useCallback(async (title: string) => {
    setIsFiltering(true)
    try {
      const response = await notesService.filterNotes(title.trim())
      setNotes(response.data.map(note => mapNote(note)))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { message?: string })?.message
        ToastAlert(message ?? 'Erro ao filtrar notas', 'error')
      } else {
        ToastAlert('Erro ao filtrar notas', 'error')
      }
      setNotes([])
    } finally {
      setIsFiltering(false)
    }
  }, [])

  useEffect(() => {
    void filterNotesByTitle('')
  }, [filterNotesByTitle])

  async function addNote(note: Note) {
    try {
      const response = await notesService.createNote({
        title: note.title,
        content: note.content,
        color: note.color,
      })

      const createdNote = mapNote(response.data, note)
      setNotes(prev => [createdNote, ...prev])
      ToastAlert('Nota cadastrada com sucesso!', 'success')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { message?: string })?.message
        ToastAlert(message ?? 'Erro ao criar nota', 'error')
      } else {
        ToastAlert('Erro ao criar nota', 'error')
      }
      throw error
    }
  }

  async function editNote(updated: Note) {
    if (!updated.id) return

    try {
      const response = await notesService.updateNote(updated.id, {
        title: updated.title,
        content: updated.content,
        color: updated.color,
      })

      const mapped = mapNote(response.data, updated)
      setNotes(prev =>
        prev.map(note => (note.id === updated.id ? mapped : note))
      )
      ToastAlert('Nota editada com sucesso!', 'success')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { message?: string })?.message
        ToastAlert(message ?? 'Erro ao editar nota', 'error')
      } else {
        ToastAlert('Erro ao editar nota', 'error')
      }
      throw error
    }
  }

  async function deleteNote(id: string) {
    try {
      await notesService.deleteNote(id)
      setNotes(prev => prev.filter(note => note.id !== id))
      ToastAlert('Nota deletada com sucesso!', 'success')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { message?: string })?.message
        ToastAlert(message ?? 'Erro ao deletar nota', 'error')
      } else {
        ToastAlert('Erro ao deletar nota', 'error')
      }
      throw error
    }
  }

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
    isFiltering,

    addNote,
    editNote,
    deleteNote,
    filterNotesByTitle,

    startEdit,
    startDelete,
    clearSelection,
  }
}
