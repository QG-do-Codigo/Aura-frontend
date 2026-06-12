import api from '../api'

export interface IdeaPayload {
  title: string
  content: string
  categoryId: string
}

export interface IdeaResponse {
  id: string
  _id?: string
  title: string
  content: string
  categoryId: string
  category_id?: string
  category?: { id?: string; _id?: string; name?: string; title?: string } | string
}

export interface IdeaCategoryResponse {
  id: string
  _id?: string
  name: string
  title?: string
  categoryId?: string
  category_id?: string
}

type RawIdeaCategory = IdeaCategoryResponse | string

function normalizeIdeaId(idea: IdeaResponse) {
  const normalizedId = idea.id || idea._id || ''

  const fromCategoryField =
    typeof idea.category === 'string'
      ? idea.category
      : idea.category?.id || idea.category?._id

  const normalizedCategoryId =
    idea.categoryId || idea.category_id || fromCategoryField || ''

  return {
    ...idea,
    id: normalizedId,
    categoryId: normalizedCategoryId,
  }
}

function normalizeCategory(raw: RawIdeaCategory): IdeaCategoryResponse {
  if (typeof raw === 'string') return { id: raw, name: raw }

  const id = raw.id || raw._id || raw.categoryId || raw.category_id || ''
  const name = raw.name || raw.title || ''
  return { ...raw, id, name }
}

const IDEAS_ENDPOINT = '/ideas'

export const ideasService = {
  async listIdeas() {
    const response = await api.get<IdeaResponse[]>(IDEAS_ENDPOINT)
    return response.data.map(normalizeIdeaId)
  },

  async getIdeaById(id: string) {
    const response = await api.get<IdeaResponse>(`${IDEAS_ENDPOINT}/${id}`)
    return normalizeIdeaId(response.data)
  },

  async createIdea(data: IdeaPayload) {
    const response = await api.post<IdeaResponse>(IDEAS_ENDPOINT, data)
    return normalizeIdeaId(response.data)
  },

  async updateIdea(id: string, data: IdeaPayload) {
    const response = await api.patch<IdeaResponse>(`${IDEAS_ENDPOINT}/${id}`, data)

    try {
      const fresh = await ideasService.getIdeaById(id)
      if (!fresh.categoryId && data.categoryId) {
        return { ...fresh, categoryId: data.categoryId }
      }
      return fresh
    } catch {
      const normalized = normalizeIdeaId(response.data)
      return { ...normalized, categoryId: data.categoryId }
    }
  },

  async deleteIdea(id: string) {
    await api.delete(`${IDEAS_ENDPOINT}/${id}`)
  },

  async listCategories() {
    const response = await api.get<RawIdeaCategory[]>(`${IDEAS_ENDPOINT}/categories`)
    return response.data.map(normalizeCategory)
  },
}
