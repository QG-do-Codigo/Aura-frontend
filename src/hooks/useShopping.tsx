import { useState } from 'react'
import type {
  ShoppingCategory,
  ShoppingItemInput,
} from '../pages/shopping/types'
import { shoppingMock } from '../pages/shopping/mocks/shoppingMock'
import { shoppingService } from '../services/shopping/shoppingService'

const categoryTemplates = [
  {
    id: 'hortifruti',
    title: 'Hortifruti',
    icon: '🥦',
    color: 'bg-green-100',
    buttonColor: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'laticinios',
    title: 'Laticínios',
    icon: '🥛',
    color: 'bg-blue-100',
    buttonColor: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    id: 'mercearia',
    title: 'Mercearia',
    icon: '🛒',
    color: 'bg-amber-100',
    buttonColor: 'bg-amber-500 hover:bg-amber-600',
  },
  {
    id: 'limpeza',
    title: 'Limpeza',
    icon: '🧼',
    color: 'bg-cyan-100',
    buttonColor: 'bg-cyan-500 hover:bg-cyan-600',
  },
]

export function useShopping() {
  const [categories, setCategories] = useState<ShoppingCategory[]>(shoppingMock)

  async function toggleItem(categoryId: string, itemId: string) {
    const category = categories.find(item => item.id === categoryId)
    const targetItem = category?.items.find(item => item.id === itemId)
    if (!targetItem) return
    const previousPurchased = targetItem.purchased
    const nextPurchased = !targetItem.purchased

    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map(item =>
                item.id === itemId
                  ? { ...item, purchased: nextPurchased }
                  : item
              ),
            }
          : category
      )
    )

    try {
      await shoppingService.updatePurchased(itemId, nextPurchased)
    } catch {
      setCategories(prev =>
        prev.map(category =>
          category.id === categoryId
            ? {
                ...category,
                items: category.items.map(item =>
                  item.id === itemId
                    ? { ...item, purchased: previousPurchased }
                    : item
                ),
              }
            : category
        )
      )
    }
  }

  async function deleteItem(categoryId: string, itemId: string) {
    await shoppingService.deleteItem(itemId)

    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.filter(item => item.id !== itemId),
            }
          : category
      )
    )
  }

  function addItem(categoryId: string, item: ShoppingItemInput) {
    const name = item.name.trim()
    const quantity = Number.isFinite(item.quantity)
      ? Math.max(1, Math.floor(item.quantity))
      : 1

    if (!name) return

    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: [
                ...category.items,
                {
                  id: crypto.randomUUID(),
                  name,
                  quantity,
                  purchased: false,
                },
              ],
            }
          : category
      )
    )
  }

  function createCategoryCard(
    categoryTemplateId: string,
    items: ShoppingItemInput[]
  ) {
    const template = categoryTemplates.find(
      item => item.id === categoryTemplateId
    )

    if (!template) return

    const cleanedItems = items
      .map(item => ({
        name: item.name.trim(),
        quantity: Number.isFinite(item.quantity)
          ? Math.max(1, Math.floor(item.quantity))
          : 1,
      }))
      .filter(item => item.name)

    if (!cleanedItems.length) return

    setCategories(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: template.title,
        icon: template.icon,
        color: template.color,
        buttonColor: template.buttonColor,
        items: cleanedItems.map(item => ({
          id: crypto.randomUUID(),
          name: item.name,
          quantity: item.quantity,
          purchased: false,
        })),
      },
    ])
  }

  return {
    categories,
    categoryTemplates,
    toggleItem,
    deleteItem,
    addItem,
    createCategoryCard,
  }
}
