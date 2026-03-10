import api from '../api'

interface UpdatePurchasedPayload {
  purchased: boolean
}

const SHOPPING_ITEMS_ENDPOINT = '/shopping-items'

export const shoppingService = {
  async updatePurchased(itemId: string, purchased: boolean) {
    await api.patch(`${SHOPPING_ITEMS_ENDPOINT}/${itemId}`, {
      purchased,
    } satisfies UpdatePurchasedPayload)
  },

  async deleteItem(itemId: string) {
    await api.delete(`${SHOPPING_ITEMS_ENDPOINT}/${itemId}`)
  },
}
