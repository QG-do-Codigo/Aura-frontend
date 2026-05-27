import api from '../api'
import type {
  FinanceCategory,
  FinancePeriod,
  FinanceSummary,
  Transaction,
  TransactionType,
} from '../../pages/finance/types'
import { getFinanceCategoryById, getFinanceCategoryByName } from './financeCategories'

export type CreateTransactionPayload = {
  name: string
  amount: number
  type: TransactionType
  category_id: number
  transaction_date: string // YYYY-MM-DD
}

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>

const FINANCE_ENDPOINT = '/finance'

function parseNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim()
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function isTransactionType(value: unknown): value is TransactionType {
  return value === 'income' || value === 'expense'
}

function parseCategoryId(value: unknown) {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN
  const normalized = Math.trunc(parsed)
  return Number.isFinite(normalized) && normalized > 0 ? normalized : null
}

function coerceTransaction(input: unknown): Transaction | null {
  if (!input || typeof input !== 'object') return null
  const record = input as Record<string, unknown>
  const id = typeof record.id === 'string' ? record.id : ''
  const name = typeof record.name === 'string' ? record.name : ''
  const type = isTransactionType(record.type) ? record.type : null
  const categoryId =
    parseCategoryId(record.category_id) ??
    parseCategoryId(record.categoryId) ??
    parseCategoryId(record.categoryID)

  const rawCategory =
    typeof record.category === 'string'
      ? record.category
      : record.category && typeof record.category === 'object'
        ? (record.category as Record<string, unknown>)
        : null

  const categoryIdFromObject =
    rawCategory && typeof rawCategory !== 'string' ? parseCategoryId(rawCategory.id) : null

  const categoryFromObject =
    rawCategory && typeof rawCategory !== 'string'
      ? typeof rawCategory.name === 'string'
        ? rawCategory.name
        : typeof rawCategory.title === 'string'
          ? rawCategory.title
          : ''
      : ''

  const categoryIconFromObject =
    rawCategory && typeof rawCategory !== 'string'
      ? typeof rawCategory.icon === 'string'
        ? rawCategory.icon
        : typeof rawCategory.emoji === 'string'
          ? rawCategory.emoji
          : typeof rawCategory.category_icon === 'string'
            ? rawCategory.category_icon
            : ''
      : ''

  const categoryNameRaw = typeof record.category === 'string' ? record.category : categoryFromObject
  const categoryIconRaw =
    typeof record.category_icon === 'string'
      ? record.category_icon
      : typeof record.categoryIcon === 'string'
        ? record.categoryIcon
        : typeof record.icon === 'string'
          ? record.icon
          : categoryIconFromObject

  const transactionDate =
    typeof record.transaction_date === 'string'
      ? record.transaction_date
      : typeof record.transactionDate === 'string'
        ? record.transactionDate
      : typeof record.date === 'string'
        ? record.date
        : ''

  const amount = Math.abs(parseNumber(record.amount))
  const finalCategoryId = categoryId ?? categoryIdFromObject
  if (!id || !name || !type || !finalCategoryId || !transactionDate) return null

  const categoryLookup =
    getFinanceCategoryById(finalCategoryId) ??
    (categoryNameRaw ? getFinanceCategoryByName(type, categoryNameRaw) : null)

  const category = categoryNameRaw || categoryLookup?.name || 'Categoria'
  const categoryIcon = categoryIconRaw || categoryLookup?.icon || '📦'

  return {
    id,
    name,
    amount,
    type,
    category_id: finalCategoryId,
    category,
    category_icon: categoryIcon,
    transaction_date: transactionDate,
  }
}

function coerceFinanceCategory(input: unknown): FinanceCategory | null {
  if (!input || typeof input !== 'object') return null
  const record = input as Record<string, unknown>
  const id = parseCategoryId(record.id)
  const name = typeof record.name === 'string' ? record.name : ''
  const icon = typeof record.icon === 'string' ? record.icon : ''
  const type = isTransactionType(record.type) ? record.type : null
  if (!id || !name || !icon || !type) return null
  return { id, name, icon, type }
}

export const financeService = {
  async listCategories() {
    const response = await api.get<unknown[]>(`${FINANCE_ENDPOINT}/categories`)
    if (!Array.isArray(response.data)) return []
    return response.data.map(coerceFinanceCategory).filter(Boolean) as FinanceCategory[]
  },

  async listTransactions(period: FinancePeriod) {
    const response = await api.get<unknown>(`${FINANCE_ENDPOINT}/transactions`, {
      params: { period },
    })

    const body = response.data
    const items =
      Array.isArray(body)
        ? body
        : body && typeof body === 'object' && Array.isArray((body as any).data)
          ? ((body as any).data as unknown[])
          : []

    return items.map(coerceTransaction).filter(Boolean) as Transaction[]
  },

  async getSummary(period: FinancePeriod) {
    const response = await api.get<FinanceSummary>(`${FINANCE_ENDPOINT}/summary`, {
      params: { period },
    })
    return response.data
  },

  async createTransaction(payload: CreateTransactionPayload) {
    const response = await api.post<unknown>(`${FINANCE_ENDPOINT}/transactions`, payload)
    const mapped = coerceTransaction(response.data)
    if (!mapped) throw new Error('Resposta inválida ao criar transação.')
    return mapped
  },

  async updateTransaction(id: string, payload: UpdateTransactionPayload) {
    const response = await api.put<unknown>(`${FINANCE_ENDPOINT}/transactions/${id}`, payload)
    const mapped = coerceTransaction(response.data)
    if (!mapped) throw new Error('Resposta inválida ao atualizar transação.')
    return mapped
  },

  async deleteTransaction(id: string) {
    await api.delete(`${FINANCE_ENDPOINT}/transactions/${id}`)
  },
}
