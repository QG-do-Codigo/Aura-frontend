export interface ShoppingItem {
  id: string
  name: string
  quantity: string
  purchased: boolean
  categoryId?: string
}

export interface ShoppingItemInput {
  name: string
  quantity?: string
}

export interface ShoppingCreateInput {
  name: string
  quantity: string
  purchased: boolean
  categoryId: string
}

export interface ShoppingCategory {
  id: string
  title: string
  icon: string
  color: string
  buttonColor: string
  items: ShoppingItem[]
}
