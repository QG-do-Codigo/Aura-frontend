export interface ShoppingItem {
  id: string
  name: string
  quantity: number
  purchased: boolean
}

export interface ShoppingItemInput {
  name: string
  quantity: number
}

export interface ShoppingCategory {
  id: string
  title: string
  icon: string
  color: string
  buttonColor: string
  items: ShoppingItem[]
}
