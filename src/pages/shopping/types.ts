export interface ShoppingItem {
  id: string
  name: string
  checked: boolean
}

export interface ShoppingCategory {
  id: string
  title: string
  color: string
  buttonColor: string
  items: ShoppingItem[]
}
