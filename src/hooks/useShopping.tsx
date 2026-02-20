import { useState } from 'react'
import type { ShoppingCategory } from '../pages/shopping/types'
import { shoppingMock } from '../pages/shopping/mocks/shoppingMock'

const categoryTemplates = [
  {
    id: 'hortifruti',
    title: 'Hortifruti',
    color: 'bg-green-100',
    buttonColor: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'laticinios',
    title: 'Laticínios',
    color: 'bg-blue-100',
    buttonColor: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    id: 'mercearia',
    title: 'Mercearia',
    color: 'bg-amber-100',
    buttonColor: 'bg-amber-500 hover:bg-amber-600',
  },
  {
    id: 'limpeza',
    title: 'Limpeza',
    color: 'bg-cyan-100',
    buttonColor: 'bg-cyan-500 hover:bg-cyan-600',
  },
]

export function useShopping() {
  const [categories, setCategories] = useState<ShoppingCategory[]>(shoppingMock)

  function toggleItem(categoryId: string, itemId: string) {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : category
      )
    )
  }

  function addItem(categoryId: string, name: string) {
    if (!name.trim()) return

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
                  checked: false,
                },
              ],
            }
          : category
      )
    )
  }

  function createCategoryCard(categoryTemplateId: string, itemNames: string[]) {
    const template = categoryTemplates.find(
      item => item.id === categoryTemplateId
    )

    if (!template) return

    const cleanedItems = itemNames.map(item => item.trim()).filter(Boolean)

    if (!cleanedItems.length) return

    setCategories(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: template.title,
        color: template.color,
        buttonColor: template.buttonColor,
        items: cleanedItems.map(name => ({
          id: crypto.randomUUID(),
          name,
          checked: false,
        })),
      },
    ])
  }

  return {
    categories,
    categoryTemplates,
    toggleItem,
    addItem,
    createCategoryCard,
  }
}
