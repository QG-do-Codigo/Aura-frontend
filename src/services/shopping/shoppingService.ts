import api from '../api'

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
  listCategories() {
    return api.get<ShoppingCategoryResponse[]>(`${SHOPPING_ENDPOINT}/categories`)
  },

  listItems(categoryId?: string) {
    return api.get<ShoppingResponse[]>(`${SHOPPING_ENDPOINT}/list`, {
      params: categoryId ? { categoryId } : undefined,
    })
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
