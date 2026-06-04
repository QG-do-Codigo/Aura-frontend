import type { FinanceCategory, TransactionType } from '../../pages/finance/types'

export const FINANCE_CATEGORIES: FinanceCategory[] = [
  { id: 1, type: 'income', name: 'Renda', icon: '💰' },
  { id: 2, type: 'income', name: 'Extra', icon: '💼' },
  { id: 10, type: 'expense', name: 'Moradia', icon: '🏠' },
  { id: 11, type: 'expense', name: 'Alimentação', icon: '🛒' },
  { id: 12, type: 'expense', name: 'Saúde', icon: '💪' },
  { id: 13, type: 'expense', name: 'Mobilidade', icon: '🚗' },
  { id: 14, type: 'expense', name: 'Lazer', icon: '🎮' },
  { id: 15, type: 'expense', name: 'Educação', icon: '📚' },
  { id: 16, type: 'expense', name: 'Vestuário', icon: '👕' },
  { id: 17, type: 'expense', name: 'Outros', icon: '📦' },
]

const CATEGORY_BY_ID = new Map(FINANCE_CATEGORIES.map(category => [category.id, category]))
const CATEGORY_BY_NAME = new Map(
  FINANCE_CATEGORIES.map(category => [`${category.type}:${category.name}`, category] as const)
)

export function getFinanceCategoryById(id: number) {
  return CATEGORY_BY_ID.get(id) ?? null
}

export function getFinanceCategoryByName(type: TransactionType, name: string) {
  const key = `${type}:${name}`
  return CATEGORY_BY_NAME.get(key) ?? null
}
