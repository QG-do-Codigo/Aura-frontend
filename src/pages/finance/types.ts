export type FinancePeriod = 'mensal' | 'anual'

export type TransactionType = 'income' | 'expense'

export type FinanceCategory = {
  id: number
  name: string
  icon: string
  type: TransactionType
}

export type Transaction = {
  id: string // UUID
  name: string
  amount: number // sempre positivo
  type: TransactionType
  category_id: number
  category: string
  category_icon: string // emoji
  transaction_date: string // YYYY-MM-DD
}

export type FinanceSummary = {
  total_income: number
  total_expense: number
  balance: number
}
