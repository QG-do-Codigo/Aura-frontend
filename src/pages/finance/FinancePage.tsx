import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Edit2,
  Filter,
  MoreVertical,
  PieChart as PieChartIcon,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import axios from 'axios'
import { toast } from 'sonner'

import type {
  FinanceCategory,
  FinancePeriod,
  FinanceSummary,
  Transaction,
  TransactionType,
} from './types'
import { financeService } from '../../services/finance/financeService'
import { extractBackendMessage } from '../../utils/extractBackendMessage'

type FormData = {
  name: string
  value: string
  type: TransactionType
  category: string
  icon: string
}

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function formatYYYYMMDD(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function formatCurrencyBRL(value: number) {
  if (!Number.isFinite(value)) return 'R$ 0'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function parseMoneyInput(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  // Bank-style input: value is interpreted as cents based on digits only.
  const digits = trimmed.replace(/[^\d]/g, '')
  if (!digits) return null
  const cents = Number(digits)
  if (!Number.isFinite(cents)) return null
  return Math.abs(cents) / 100
}

function monthLabelPTBR(date: Date) {
  const label = date.toLocaleDateString('pt-BR', { month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function shortDatePTBR(yyyyMMdd: string) {
  const date = new Date(yyyyMMdd)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function isValidForm(formData: FormData) {
  return (
    formData.name.trim().length > 0 &&
    formData.value.trim().length > 0 &&
    formData.category.trim().length > 0 &&
    formData.icon.trim().length > 0
  )
}

function formatMoneyFromDigitsBRL(rawDigits: string) {
  const digits = rawDigits.replace(/[^\d]/g, '')
  if (!digits) return ''

  const safe = digits.replace(/^0+(?=\d)/, '')
  const padded = safe.padStart(3, '0')
  const integerPart = padded.slice(0, -2)
  const fractionPart = padded.slice(-2)

  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${groupedInteger},${fractionPart}`
}

function normalizeMoneyTyping(raw: string) {
  return formatMoneyFromDigitsBRL(raw)
}

function formatMoneyOnBlur(raw: string) {
  const parsed = parseMoneyInput(raw)
  if (parsed === null) return ''
  return parsed.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function defaultFormData(): FormData {
  return {
    name: '',
    value: '',
    type: 'expense',
    category: '',
    icon: '',
  }
}

function normalizeTransactionForForm(transaction: Transaction): FormData {
  return {
    name: transaction.name,
    value: transaction.amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    type: transaction.type,
    category: transaction.category,
    icon: transaction.category_icon,
  }
}

function sumByType(transactions: Transaction[], type: TransactionType) {
  return transactions.filter(item => item.type === type).reduce((acc, item) => acc + item.amount, 0)
}

function startOfPeriod(period: FinancePeriod) {
  const now = new Date()
  if (period === 'anual') return new Date(now.getFullYear(), 0, 1)
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function withinPeriod(transaction: Transaction, period: FinancePeriod) {
  const start = startOfPeriod(period)
  const date = new Date(transaction.transaction_date)
  if (Number.isNaN(date.getTime())) return false
  return date >= start
}

function getCategoryOptions(categories: FinanceCategory[], type: TransactionType) {
  return categories
    .filter(category => category.type === type)
    .map(category => ({ icon: category.icon, name: category.name }))
}

const PIE_COLORS = [
  '#0ea5e9',
  '#8b5cf6',
  '#22c55e',
  '#f97316',
  '#ef4444',
  '#14b8a6',
  '#eab308',
  '#a855f7',
]

export function FinancePage() {
  const [period, setPeriod] = useState<FinancePeriod>('mensal')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<FinanceCategory[]>([])
  const [summary, setSummary] = useState<FinanceSummary>({
    total_income: 0,
    total_expense: 0,
    balance: 0,
  })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState<FormData>(() => defaultFormData())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [visibleCount, setVisibleCount] = useState(8)

  const now = useMemo(() => new Date(), [])
  const periodLabel = useMemo(() => {
    if (period === 'anual') return `${now.getFullYear()}`
    return `${monthLabelPTBR(now)} / ${now.getFullYear()}`
  }, [now, period])

  const filteredTransactions = useMemo(
    () => transactions.filter(item => withinPeriod(item, period)),
    [period, transactions]
  )

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const aTime = Date.parse(a.transaction_date)
      const bTime = Date.parse(b.transaction_date)
      if (Number.isFinite(aTime) && Number.isFinite(bTime)) return bTime - aTime
      return b.transaction_date.localeCompare(a.transaction_date)
    })
  }, [filteredTransactions])

  const recentTransactions = useMemo(
    () => sortedTransactions.slice(0, visibleCount),
    [sortedTransactions, visibleCount]
  )

  const incomeTotal = useMemo(() => summary.total_income ?? sumByType(filteredTransactions, 'income'), [
    filteredTransactions,
    summary.total_income,
  ])

  const expenseTotal = useMemo(
    () => summary.total_expense ?? sumByType(filteredTransactions, 'expense'),
    [filteredTransactions, summary.total_expense]
  )

  const balance = useMemo(() => summary.balance ?? incomeTotal - expenseTotal, [
    expenseTotal,
    incomeTotal,
    summary.balance,
  ])

  const barData = useMemo(() => {
    const end = new Date(now.getFullYear(), now.getMonth(), 1)
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(end)
      date.setMonth(end.getMonth() - (5 - index))
      return date
    })

    return months.map(monthDate => {
      const key = `${monthDate.getFullYear()}-${pad2(monthDate.getMonth() + 1)}`
      const monthLabel = monthDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
      const income = filteredTransactions
        .filter(item => item.type === 'income' && item.transaction_date.startsWith(key))
        .reduce((acc, item) => acc + item.amount, 0)
      const expense = filteredTransactions
        .filter(item => item.type === 'expense' && item.transaction_date.startsWith(key))
        .reduce((acc, item) => acc + item.amount, 0)
      return {
        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        income: Math.round(income * 100) / 100,
        expense: Math.round(expense * 100) / 100,
      }
    })
  }, [filteredTransactions, now])

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, { name: string; icon: string; value: number }>()
    for (const transaction of filteredTransactions) {
      if (transaction.type !== 'expense') continue
      const key = `${transaction.category_icon} ${transaction.category}`
      const current = map.get(key)
      map.set(key, {
        name: transaction.category,
        icon: transaction.category_icon,
        value: (current?.value ?? 0) + transaction.amount,
      })
    }
    return [...map.values()].sort((a, b) => b.value - a.value)
  }, [filteredTransactions])

  const topExpenseCategories = useMemo(() => expenseByCategory.slice(0, 3), [expenseByCategory])
  const hasMoreThanTop3Categories = expenseByCategory.length > 3

  const pieData = useMemo(() => {
    return expenseByCategory.map(item => ({
      name: `${item.icon} ${item.name}`,
      value: Math.round(item.value * 100) / 100,
    }))
  }, [expenseByCategory])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setVisibleCount(8)
    async function load() {
      try {
        const [list, nextSummary, fetchedCategories] = await Promise.all([
          financeService.listTransactions(period),
          financeService.getSummary(period),
          financeService.listCategories(),
        ])
        if (cancelled) return
        setTransactions(list)
        setSummary(nextSummary)
        setCategories(fetchedCategories)
      } catch (error) {
        if (cancelled) return
        if (axios.isAxiosError(error)) {
          const message = extractBackendMessage(error.response?.data)
          toast.error(message ?? 'Erro ao carregar finanças')
        } else {
          toast.error('Erro ao carregar finanças')
        }
        setTransactions([])
        setSummary({ total_income: 0, total_expense: 0, balance: 0 })
        setCategories([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [period])

  useEffect(() => {
    if (!isAddModalOpen) return
    if (formData.category.trim() || formData.icon.trim()) return
    const first = categories.find(category => category.type === formData.type)
    if (!first) return
    setFormData(prev => ({ ...prev, category: first.name, icon: first.icon }))
  }, [categories, formData.category, formData.icon, formData.type, isAddModalOpen])

  function openCreateModal() {
    setEditingTransaction(null)
    const firstExpense = categories.find(category => category.type === 'expense') ?? null
    setFormData({
      ...defaultFormData(),
      type: 'expense',
      category: firstExpense?.name ?? '',
      icon: firstExpense?.icon ?? '',
    })
    setIsAddModalOpen(true)
  }

  function openEditModal(transaction: Transaction) {
    setEditingTransaction(transaction)
    setFormData(normalizeTransactionForForm(transaction))
    setIsAddModalOpen(true)
  }

  function closeModal() {
    if (saving) return
    setIsAddModalOpen(false)
    setEditingTransaction(null)
  }

  function closeCategoriesModal() {
    setIsCategoriesModalOpen(false)
  }

  async function handleSubmit() {
    if (saving) return
    if (!isValidForm(formData)) {
      toast.error('Preencha todos os campos.')
      return
    }

    const parsedValue = parseMoneyInput(formData.value)
    if (!parsedValue || parsedValue <= 0) {
      toast.error('Informe um valor válido.')
      return
    }

    setSaving(true)
    try {
      const chosenCategory = categories.find(
        category => category.type === formData.type && category.name === formData.category.trim()
      )
      if (!chosenCategory) {
        toast.error('Categoria inválida para o tipo selecionado.')
        return
      }

      const payload = {
        name: formData.name.trim(),
        amount: parsedValue,
        type: formData.type,
        category_id: chosenCategory.id,
        transaction_date: editingTransaction?.transaction_date ?? formatYYYYMMDD(new Date()),
      }

      if (editingTransaction) {
        const updated = await financeService.updateTransaction(editingTransaction.id, payload)
        setTransactions(prev => prev.map(item => (item.id === updated.id ? updated : item)))
        toast.success('Transação atualizada.')
      } else {
        const created = await financeService.createTransaction(payload)
        setTransactions(prev => [created, ...prev])
        toast.success('Transação adicionada.')
      }

      const nextSummary = await financeService.getSummary(period)
      setSummary(nextSummary)
      setIsAddModalOpen(false)
      setEditingTransaction(null)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = extractBackendMessage(error.response?.data)
        toast.error(message ?? 'Erro ao salvar transação')
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Erro ao salvar transação')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(transaction: Transaction) {
    try {
      await financeService.deleteTransaction(transaction.id)
      setTransactions(prev => prev.filter(item => item.id !== transaction.id))
      const nextSummary = await financeService.getSummary(period)
      setSummary(nextSummary)
      toast.success('Transação removida.')
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
      else toast.error('Erro ao remover transação')
    }
  }

  const trendIsPositive = balance >= 0

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
      {/* HEADER */}
      <header className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">
              Gestão Financeira
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Controle seus gastos com serenidade.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1 ring-1 ring-slate-200">
            {(['mensal', 'anual'] as const).map(option => {
              const active = period === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPeriod(option)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl">
        {/* BALANCE CARD */}
        <section className="relative mt-6 overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl ring-1 ring-white/10">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -left-14 -top-14 h-40 w-40 rounded-full bg-emerald-400/25 blur-2xl"
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-14 -right-14 h-44 w-44 rounded-full bg-rose-400/20 blur-2xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Saldo {periodLabel}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl ${
                    trendIsPositive ? 'bg-emerald-400/15' : 'bg-rose-400/15'
                  } ring-1 ${trendIsPositive ? 'ring-emerald-400/30' : 'ring-rose-400/30'}`}
                >
                  {trendIsPositive ? (
                    <TrendingUp className="h-5 w-5 text-emerald-300" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-rose-300" />
                  )}
                </span>

                <p className="truncate text-3xl font-semibold tracking-tight">
                  {formatCurrencyBRL(balance)}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <ArrowUpRight className="h-4 w-4 text-emerald-300" />
                    <span>Receitas</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-emerald-200">
                    + {formatCurrencyBRL(incomeTotal)}
                  </p>
                </div>
                <div className="rounded-3xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <ArrowDownRight className="h-4 w-4 text-rose-300" />
                    <span>Despesas</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-rose-200">
                    - {formatCurrencyBRL(expenseTotal)}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/15 transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
              aria-label="Nova transação"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {loading && (
            <div className="mt-6 rounded-3xl bg-white/5 px-4 py-3 text-sm text-white/70 ring-1 ring-white/10">
              Carregando transações...
            </div>
          )}
        </section>

        {/* CHARTS */}
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-100 lg:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Últimos 6 meses
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  Receita x Despesa
                </h2>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-100">
                <MoreVertical className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barCategoryGap={18}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    width={42}
                    tickFormatter={value => `${Math.round(Number(value) / 1000)}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(148,163,184,0.10)' }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      const income = Number(payload.find(item => item.dataKey === 'income')?.value ?? 0)
                      const expense = Number(payload.find(item => item.dataKey === 'expense')?.value ?? 0)
                      return (
                        <div className="rounded-2xl bg-white px-3 py-2 shadow-lg ring-1 ring-slate-100">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                            {label}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-emerald-700">
                            + {formatCurrencyBRL(income)}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-rose-700">
                            - {formatCurrencyBRL(expense)}
                          </p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="income" fill="#7FDCA8" radius={[12, 12, 0, 0]} />
                  <Bar dataKey="expense" fill="#DC8B7F" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#7FDCA8]" />
                Receitas
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#DC8B7F]" />
                Despesas
              </span>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Despesas
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  Por categoria
                </h3>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100">
                <PieChartIcon className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-4 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.length ? pieData : [{ name: 'Sem dados', value: 1 }]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    stroke="transparent"
                  >
                    {(pieData.length ? pieData : [{ name: 'Sem dados', value: 1 }]).map(
                      (_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={pieData.length ? PIE_COLORS[index % PIE_COLORS.length] : '#e2e8f0'}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const item = payload[0]
                      const value = Number(item.value ?? 0)
                      return (
                        <div className="rounded-2xl bg-white px-3 py-2 shadow-lg ring-1 ring-slate-100">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                            {item.name}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {formatCurrencyBRL(value)}
                          </p>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 space-y-2">
              {topExpenseCategories.map((item, index) => (
                <div key={`${item.icon}-${item.name}`} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="truncate">
                      {item.icon} {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {formatCurrencyBRL(item.value)}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsCategoriesModalOpen(true)}
              disabled={!hasMoreThanTop3Categories}
              className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ver todas
            </button>
          </div>
        </section>

        {/* TRANSACTIONS LIST */}
        <section className="mt-6 rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Transações Recentes</h2>
              <p className="text-sm text-slate-500">Mais recentes primeiro.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toast.message('Filtro em breve.')}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 ring-1 ring-slate-100 transition hover:bg-slate-100"
              >
                <Filter className="h-4 w-4" />
                Filtro
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-semibold text-white shadow-sm shadow-emerald-500/20 transition hover:brightness-95"
              >
                <Plus className="h-4 w-4" />
                + Nova
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {recentTransactions.length === 0 && !loading && (
              <div className="rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-600 ring-1 ring-slate-100">
                Nenhuma transação no período selecionado.
              </div>
            )}

            {recentTransactions.map(transaction => {
              const isExpense = transaction.type === 'expense'
              const valueColor = isExpense ? 'text-slate-900' : 'text-emerald-700'
              const iconBg = isExpense ? 'bg-rose-50 ring-rose-100' : 'bg-emerald-50 ring-emerald-100'
              return (
                <motion.div
                  key={transaction.id}
                  whileHover={{ x: 4 }}
                  className="group flex items-center gap-3 rounded-[28px] bg-slate-50 px-4 py-4 ring-1 ring-slate-100"
                >
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-[20px] text-lg ring-1 ${iconBg}`}
                    aria-hidden="true"
                  >
                    {transaction.category_icon}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-900">
                      {transaction.name}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <span className="font-semibold text-slate-500">{transaction.category}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {shortDatePTBR(transaction.transaction_date)}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-black ${valueColor}`}>
                      {isExpense ? '-' : '+'} {formatCurrencyBRL(transaction.amount)}
                    </p>

                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEditModal(transaction)}
                        className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                        aria-label="Editar transação"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(transaction)}
                        className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-rose-600 ring-1 ring-slate-200 hover:bg-rose-50"
                        aria-label="Excluir transação"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {sortedTransactions.length > recentTransactions.length && (
            <button
              type="button"
              onClick={() => setVisibleCount(prev => prev + 8)}
              className="mt-6 w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 transition hover:bg-slate-100"
            >
              Carregar mais transações
            </button>
          )}
        </section>
      </main>

      {/* MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 px-4 py-6 backdrop-blur-xl sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-lg rounded-[40px] bg-white p-6 shadow-2xl ring-1 ring-slate-100"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              onClick={event => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {editingTransaction ? 'Editar transação' : 'Nova transação'}
                  </p>
                  <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                    {formData.type === 'expense' ? 'Despesa' : 'Receita'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-100 hover:bg-slate-100"
                  aria-label="Fechar modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-full bg-slate-100 p-1 ring-1 ring-slate-200">
                {(['expense', 'income'] as const).map(option => {
                  const active = formData.type === option
                  const activeClasses =
                    option === 'expense' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        const options = getCategoryOptions(categories, option)
                        const first = options[0] ?? { name: '', icon: '' }
                        setFormData(prev => ({
                          ...prev,
                          type: option,
                          category: first.name,
                          icon: first.icon,
                        }))
                      }}
                      className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${
                        active ? activeClasses : 'text-slate-600 hover:bg-white/60'
                      }`}
                    >
                      {option === 'expense' ? 'Despesa' : 'Receita'}
                    </button>
                  )
                })}
              </div>

              <div className="mt-5 space-y-4">
                <label className="space-y-2">
                  <span className="text-xs font-medium text-slate-500">Descrição</span>
                  <input
                    value={formData.name}
                    onChange={event => setFormData(prev => ({ ...prev, name: event.target.value }))}
                    placeholder="Ex: mercado, gasolina, salário..."
                    className="h-14 w-full rounded-[20px] bg-slate-50 px-4 text-slate-700 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-medium text-slate-500">Valor (R$)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.value}
                    onChange={event =>
                      setFormData(prev => ({
                        ...prev,
                        value: normalizeMoneyTyping(event.target.value),
                      }))
                    }
                    onBlur={() =>
                      setFormData(prev => ({
                        ...prev,
                        value: formatMoneyOnBlur(prev.value),
                      }))
                    }
                    placeholder="0,00"
                    className="h-14 w-full rounded-[20px] bg-slate-50 px-4 text-2xl font-semibold text-slate-900 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-medium text-slate-500">Categoria</span>
                  <select
                    value={formData.category ? `${formData.icon} ${formData.category}` : ''}
                    onChange={event => {
                      const raw = event.target.value
                      if (!raw) return
                      const icon = raw.split(' ')[0] ?? ''
                      const category = raw.split(' ').slice(1).join(' ').trim()
                      setFormData(prev => ({ ...prev, icon, category }))
                    }}
                    className="h-14 w-full rounded-[20px] bg-slate-50 px-4 text-slate-700 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="" disabled>
                      Selecione uma categoria
                    </option>
                    {getCategoryOptions(categories, formData.type).map(option => (
                      <option key={`${option.icon}-${option.name}`} value={`${option.icon} ${option.name}`}>
                        {option.icon} {option.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200 disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60 ${
                    formData.type === 'expense'
                      ? 'bg-rose-500 hover:bg-rose-600'
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  {saving ? 'Salvando...' : editingTransaction ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCategoriesModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 px-4 py-6 backdrop-blur-xl sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCategoriesModal}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-lg rounded-[40px] bg-white p-6 shadow-2xl ring-1 ring-slate-100"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              onClick={event => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Despesas
                  </p>
                  <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                    Todas as categorias
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeCategoriesModal}
                  className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-100 hover:bg-slate-100"
                  aria-label="Fechar categorias"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 max-h-[55vh] space-y-2 overflow-auto pr-1">
                {expenseByCategory.length === 0 ? (
                  <div className="rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-600 ring-1 ring-slate-100">
                    Nenhuma despesa no período selecionado.
                  </div>
                ) : (
                  expenseByCategory.map((item, index) => (
                    <div
                      key={`${item.icon}-${item.name}`}
                      className="flex items-center justify-between gap-3 rounded-3xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <span
                            className="h-2.5 w-2.5 rounded-sm"
                            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                          />
                          <span className="truncate">
                            {item.icon} {item.name}
                          </span>
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-black text-slate-900">
                        {formatCurrencyBRL(item.value)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
