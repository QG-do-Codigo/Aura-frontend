import api from '../api'

export interface NotePayload {
  title: string
  content: string
  color: string
}

export interface NoteResponse {
  id: string
  _id?: string
  title: string
  content: string
  color: string
  createdAt?: string
  updatedAt?: string
}

export const notesService = {
  createNote(data: NotePayload) {
    return api.post<NoteResponse>('/note', data)
  },

  filterNotes(title: string) {
    return api.get<NoteResponse[]>('/note/filter', { params: { title } })
  },

  getNoteById(id: string) {
    return api.get<NoteResponse>(`/note/${id}`)
  },

  updateNote(id: string, data: NotePayload) {
    return api.patch<NoteResponse>(`/note/${id}`, data)
  },

  deleteNote(id: string) {
    return api.delete(`/note/${id}`)
  },
}
