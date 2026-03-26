import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import type { Note } from '../pages/notes/types'
import type { NoteResponse } from '../services/notes/notesService'
import { notesService } from '../services/notes/notesService'
import { ToastAlert } from '../utils/toastAlert'

type NoteResponseList =
  | NoteResponse[]
  | { notes?: NoteResponse[] }
  | { data?: NoteResponse[] }

type NoteResponseEnvelope =
  | NoteResponse
  | { note?: NoteResponse }
  | { data?: NoteResponse }

function unwrapNoteResponse(data: NoteResponseEnvelope): Partial<NoteResponse> {
  if (data && typeof data === 'object') {
    if ('note' in data && data.note) return data.note
    if ('data' in data && data.data) return data.data
  }
  return data as NoteResponse
}

function unwrapNoteList(data: NoteResponseList): NoteResponse[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    if ('notes' in data && Array.isArray(data.notes)) return data.notes
    if ('data' in data && Array.isArray(data.data)) return data.data
  }
  return []
}

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
  const [lastFilter, setLastFilter] = useState('')

  const filterNotesByTitle = useCallback(async (title: string) => {
    const normalizedTitle = title.trim()
    setLastFilter(normalizedTitle)
    setIsFiltering(true)
    try {
      const response = await notesService.filterNotes(normalizedTitle)
      const list = unwrapNoteList(response.data)
      setNotes(list.map(note => mapNote(note)))
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

      const createdNote = mapNote(unwrapNoteResponse(response.data), note)
      if (!createdNote.id) {
        await filterNotesByTitle(lastFilter)
      } else {
        setNotes(prev => [createdNote, ...prev])
      }
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

      const mapped = mapNote(unwrapNoteResponse(response.data), updated)
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
