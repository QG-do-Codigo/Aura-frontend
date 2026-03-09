import { useEffect, useState } from 'react'
import type {
  ShoppingCategory,
  ShoppingCreateInput,
  ShoppingItem,
  ShoppingItemInput,
} from '../pages/shopping/types'
import {
  shoppingService,
  type ShoppingCategoryResponse,
  type ShoppingResponse,
} from '../services/shopping/shoppingService'

interface CategoryTemplate {
  id: string
  title: string
  icon: string
  color: string
  buttonColor: string
}

const defaultCategoryTemplates: CategoryTemplate[] = [
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

const fallbackStyles = [
  {
    color: 'bg-slate-100',
    buttonColor: 'bg-slate-500 hover:bg-slate-600',
    icon: '🛍️',
  },
  {
    color: 'bg-rose-100',
    buttonColor: 'bg-rose-500 hover:bg-rose-600',
    icon: '🧺',
  },
  {
    color: 'bg-violet-100',
    buttonColor: 'bg-violet-500 hover:bg-violet-600',
    icon: '📦',
  },
]

function normalizeQuantity(quantity?: string) {
  const trimmed = quantity?.trim()
  return trimmed && trimmed.length ? trimmed : '1'
}

function normalizeCategoryKey(value?: string) {
  const normalized = value?.trim().toLowerCase()

  if (
    !normalized ||
    normalized === 'uncategorized' ||
    normalized === 'sem-categoria' ||
    normalized === 'sem categoria' ||
    normalized === 'outros' ||
    normalized === 'others'
  ) {
    return 'sem-categoria'
  }

  return value?.trim() || 'sem-categoria'
}

function resolveCategoryId(item: ShoppingResponse) {
  const resolved = item.categoryId ?? item.category
  return normalizeCategoryKey(resolved)
}

function mapItem(item: ShoppingResponse): ShoppingItem {
  const categoryId = resolveCategoryId(item)

  return {
    id: item.id ?? item._id ?? crypto.randomUUID(),
    name: item.name?.trim() || 'Item sem nome',
    quantity: normalizeQuantity(item.quantity),
    purchased: Boolean(item.purchased),
    categoryId,
  }
}

function toTitle(value: string) {
  if (normalizeCategoryKey(value) === 'sem-categoria') return 'Outros'
  return value
}

function normalizeCategoryTitle(value?: string, fallback?: string) {
  const normalizedValue = value?.trim()
  if (!normalizedValue) return toTitle(fallback ?? 'sem-categoria')
  return toTitle(normalizedValue)
}

function normalizeText(value?: string) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function getCategoryIcon(category: ShoppingCategoryResponse, fallback: string) {
  if (category.icon?.trim()) return category.icon

  const raw = `${category.title ?? ''} ${category.name ?? ''} ${category.id ?? ''} ${category._id ?? ''} ${category.categoryId ?? ''} ${category.category ?? ''}`
  const normalized = normalizeText(raw)

  if (normalized.includes('hortifruti')) return '🥦'
  if (normalized.includes('laticinio') || normalized.includes('laticinios')) {
    return '🥛'
  }
  if (normalized.includes('mercearia')) return '🛒'
  if (normalized.includes('limpeza')) return '🧼'
  if (normalized.includes('padaria')) return '🍞'
  if (normalized.includes('acougue')) return '🥩'
  if (normalized.includes('bebida')) return '🥤'
  if (normalized.includes('outro') || normalized.includes('uncategorized')) {
    return '📦'
  }

  return fallback
}

function mapCategoryTemplate(
  category: ShoppingCategoryResponse,
  index: number
): CategoryTemplate | null {
  const id =
    category.id ??
    category._id ??
    category.categoryId ??
    category.category ??
    undefined

  if (!id) return null

  const normalizedId = normalizeCategoryKey(id)
  const style = fallbackStyles[index % fallbackStyles.length]
  const title = normalizeCategoryTitle(
    category.title ?? category.name,
    normalizedId
  )

  return {
    id: normalizedId,
    title,
    icon: getCategoryIcon(category, style.icon),
    color: style.color,
    buttonColor: style.buttonColor,
  }
}

function groupByCategory(
  items: ShoppingResponse[],
  templates: CategoryTemplate[]
): ShoppingCategory[] {
  const map = new Map<string, ShoppingCategory>()

  items.forEach(rawItem => {
    const item = mapItem(rawItem)
    const categoryId = item.categoryId ?? 'sem-categoria'
    const template = templates.find(category => category.id === categoryId)
    const fallbackIndex = map.size % fallbackStyles.length
    const fallbackStyle = fallbackStyles[fallbackIndex]

    if (!map.has(categoryId)) {
      map.set(categoryId, {
        id: categoryId,
        title: template?.title ?? toTitle(categoryId),
        icon: template?.icon ?? fallbackStyle.icon,
        color: template?.color ?? fallbackStyle.color,
        buttonColor: template?.buttonColor ?? fallbackStyle.buttonColor,
        items: [],
      })
    }

    const category = map.get(categoryId)
    if (!category) return
    category.items.push(item)
  })

  return Array.from(map.values())
}

export function useShopping() {
  const [categories, setCategories] = useState<ShoppingCategory[]>([])
  const [categoryTemplates, setCategoryTemplates] = useState<CategoryTemplate[]>(
    defaultCategoryTemplates
  )

  useEffect(() => {
    async function loadShoppingData() {
      let templates = defaultCategoryTemplates

      try {
        const categoriesResponse = await shoppingService.listCategories()
        const mappedCategories = categoriesResponse.data
          .map((category, index) => mapCategoryTemplate(category, index))
          .filter((category): category is CategoryTemplate => Boolean(category))

        if (mappedCategories.length) {
          templates = mappedCategories
        }
      } catch {
        templates = defaultCategoryTemplates
      }

      setCategoryTemplates(templates)

      try {
        const itemsResponse = await shoppingService.listItems()
        setCategories(groupByCategory(itemsResponse.data, templates))
      } catch {
        setCategories([])
      }
    }

    void loadShoppingData()
  }, [])

  async function toggleItem(categoryId: string, itemId: string) {
    const category = categories.find(item => item.id === categoryId)
    const targetItem = category?.items.find(item => item.id === itemId)
    if (!targetItem) return

    const previousPurchased = targetItem.purchased
    const nextPurchased = !targetItem.purchased

    setCategories(prev =>
      prev.map(item =>
        item.id === categoryId
          ? {
              ...item,
              items: item.items.map(value =>
                value.id === itemId ? { ...value, purchased: nextPurchased } : value
              ),
            }
          : item
      )
    )

    try {
      await shoppingService.updateItem(itemId, { purchased: nextPurchased })
    } catch {
      setCategories(prev =>
        prev.map(item =>
          item.id === categoryId
            ? {
                ...item,
                items: item.items.map(value =>
                  value.id === itemId
                    ? { ...value, purchased: previousPurchased }
                    : value
                ),
              }
            : item
        )
      )
    }
  }

  async function deleteItem(categoryId: string, itemId: string) {
    const previous = categories

    setCategories(prev =>
      prev
        .map(item =>
          item.id === categoryId
            ? {
                ...item,
                items: item.items.filter(value => value.id !== itemId),
              }
            : item
        )
        .filter(item => item.items.length)
    )

    try {
      await shoppingService.deleteItem(itemId)
    } catch {
      setCategories(previous)
    }
  }

  async function createItem(data: ShoppingCreateInput) {
    const payload = {
      name: data.name.trim(),
      quantity: normalizeQuantity(data.quantity),
      purchased: Boolean(data.purchased),
      categoryId: data.categoryId,
    }

    if (!payload.name || !payload.categoryId) return

    const response = await shoppingService.createItem(payload)
    const createdItem = mapItem({
      ...response.data,
      name: response.data.name ?? payload.name,
      quantity: response.data.quantity ?? payload.quantity,
      purchased: response.data.purchased ?? payload.purchased,
      categoryId: response.data.categoryId ?? payload.categoryId,
    })

    setCategories(prev => {
      const template = categoryTemplates.find(item => item.id === payload.categoryId)
      const fallbackStyle =
        fallbackStyles[prev.length % fallbackStyles.length] ?? fallbackStyles[0]
      const categoryIndex = prev.findIndex(item => item.id === payload.categoryId)

      if (categoryIndex >= 0) {
        return prev.map(item =>
          item.id === payload.categoryId
            ? { ...item, items: [...item.items, createdItem] }
            : item
        )
      }

      return [
        ...prev,
        {
          id: payload.categoryId,
          title: template?.title ?? toTitle(payload.categoryId),
          icon: template?.icon ?? fallbackStyle.icon,
          color: template?.color ?? fallbackStyle.color,
          buttonColor: template?.buttonColor ?? fallbackStyle.buttonColor,
          items: [createdItem],
        },
      ]
    })
  }

  async function addItems(categoryId: string, items: ShoppingItemInput[]) {
    const cleanedItems = items
      .map(item => ({
        name: item.name.trim(),
        quantity: item.quantity?.trim(),
      }))
      .filter(item => item.name)

    if (!cleanedItems.length) return

    const category = categories.find(item => item.id === categoryId)
    const targetId = category?.items[0]?.id

    if (!targetId) {
      await Promise.all(
        cleanedItems.map(item =>
          createItem({
            name: item.name,
            quantity: item.quantity || '1',
            purchased: false,
            categoryId,
          })
        )
      )
      return
    }

    const response = await shoppingService.updateItem(targetId, {
      items: cleanedItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
      })),
    })

    const createdItems = response.addedItems.map(item =>
      mapItem({
        ...item,
        categoryId: item.categoryId ?? item.category ?? categoryId,
      })
    )

    if (!createdItems.length) return

    setCategories(prev =>
      prev.map(item =>
        item.id === categoryId
          ? { ...item, items: [...item.items, ...createdItems] }
          : item
      )
    )
  }

  return {
    categories,
    categoryTemplates,
    toggleItem,
    deleteItem,
    addItems,
    createItem,
  }
}
