import api from '../api'
import type { AxiosResponse } from 'axios'

interface CreateShoppingPayload {
  name: string
  quantity: string
  purchased: boolean
  categoryId: string
}

interface UpdateShoppingPayload {
  name?: string
  quantity?: string
  purchased?: boolean
  categoryId?: string
  items?: Array<{
    name: string
    quantity?: string
  }>
}

export interface ShoppingResponse {
  id?: string
  _id?: string
  name?: string
  quantity?: string
  purchased?: boolean
  categoryId?: string
  category?: string
}

export interface ShoppingCategoryResponse {
  id?: string
  _id?: string
  name?: string
  title?: string
  icon?: string
  categoryId?: string
  category?: string
}

interface UpdateShoppingWithItemsResponse {
  updatedItem: ShoppingResponse
  addedItems: ShoppingResponse[]
}

type UpdateShoppingResponse = ShoppingResponse | UpdateShoppingWithItemsResponse

const SHOPPING_ENDPOINT = '/shopping'

type ListEnvelope<T> =
  | T[]
  | { data?: T[] }
  | { items?: T[] }
  | { categories?: T[] }
  | { results?: T[] }

function unwrapList<T>(value: ListEnvelope<T> | null | undefined): T[] {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') {
    const candidate =
      'data' in value
        ? value.data
        : 'items' in value
          ? value.items
          : 'categories' in value
            ? value.categories
            : 'results' in value
              ? value.results
              : undefined
    if (Array.isArray(candidate)) return candidate
  }
  return []
}

function hasAddedItems(
  data: UpdateShoppingResponse
): data is UpdateShoppingWithItemsResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'updatedItem' in data &&
    Array.isArray(data.addedItems)
  )
}

export const shoppingService = {
  async listCategories() {
    const response = await api.get<ListEnvelope<ShoppingCategoryResponse>>(
      `${SHOPPING_ENDPOINT}/categories`
    )
    const data = unwrapList(response.data)
    return { ...response, data } as AxiosResponse<ShoppingCategoryResponse[]>
  },

  async listItems(categoryId?: string) {
    const response = await api.get<ListEnvelope<ShoppingResponse>>(
      `${SHOPPING_ENDPOINT}/list`,
      {
      params: categoryId ? { categoryId } : undefined,
      }
    )
    const data = unwrapList(response.data)
    return { ...response, data } as AxiosResponse<ShoppingResponse[]>
  },

  createItem(data: CreateShoppingPayload) {
    return api.post<ShoppingResponse>(`${SHOPPING_ENDPOINT}/create`, data)
  },

  async updateItem(id: string, data: UpdateShoppingPayload) {
    const response = await api.patch<UpdateShoppingResponse>(
      `${SHOPPING_ENDPOINT}/update/${id}`,
      data
    )

    if (hasAddedItems(response.data)) {
      return {
        updatedItem: response.data.updatedItem,
        addedItems: response.data.addedItems,
      }
    }

    return {
      updatedItem: response.data,
      addedItems: [],
    }
  },

  async deleteItem(itemId: string) {
    await api.delete(`${SHOPPING_ENDPOINT}/delete/${itemId}`)
  },
}
