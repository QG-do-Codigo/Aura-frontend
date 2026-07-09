import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  Lightbulb,
  Moon,
  ShoppingCart,
  StickyNote,
  CheckSquare2,
  LineChart,
} from 'lucide-react'
import { useHealth } from '../../hooks/useHealth'
import { useHealthWeek } from '../../hooks/useHealthWeek'
import { financeService } from '../../services/finance/financeService'
import { useTasks } from '../../services/tasks/tasksService'
import { ideasService, type IdeaResponse } from '../../services/ideas/ideasService'
import { notesService, type NoteResponse } from '../../services/notes/notesService'
import {
  shoppingService,
  type ShoppingCategoryResponse,
  type ShoppingResponse,
} from '../../services/shopping/shoppingService'
import { sleepLogsService, type SleepStats, type SleepLog } from '../../services/sleep/sleepLogsService'
import { sleepService } from '../../services/sleep/sleepService'
import type { FinanceSummary, Transaction } from '../finance/types'
import type { HealthWeekReminder } from '../health/types'
import type { SleepGoal } from '../sleep/types'

type NoteResponseList =
  | NoteResponse[]
  | { notes?: NoteResponse[] }
  | { data?: NoteResponse[] }

function unwrapNoteList(data: NoteResponseList): NoteResponse[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    if ('notes' in data && Array.isArray(data.notes)) return data.notes
    if ('data' in data && Array.isArray(data.data)) return data.data
  }
  return []
}

function normalizeId(value?: string) {
  return (value ?? '').trim()
}

function normalizeShoppingCategoryTitle(value?: string) {
  const title = (value ?? '').trim()
  const normalized = title.toLowerCase()

  if (
    !title ||
    normalized === 'uncategorized' ||
    normalized === 'sem-categoria' ||
    normalized === 'sem categoria' ||
    normalized === 'outros' ||
    normalized === 'others'
  ) {
    return 'Outros'
  }

  return title
}

function normalizeShoppingCategory(category: ShoppingCategoryResponse) {
  const id = normalizeId(category.id ?? category._id ?? category.categoryId)
  const title = normalizeShoppingCategoryTitle(
    category.title ?? category.name ?? category.category
  )

  return {
    id,
    title,
  }
}

function getShoppingItemCategoryId(item: ShoppingResponse) {
  return normalizeId(item.categoryId ?? item.category ?? '')
}

const HEALTH_TIME_ZONE = 'America/Sao_Paulo'

function toDateKey(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: HEALTH_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(date)
}

function toDateKeyFromISO(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return toDateKey(date)
}

function isConfirmedStatus(status: HealthWeekReminder['days'][number]['status']) {
  return status === 'done' || status === 'late'
}

function formatCurrencyBRL(value: number) {
  if (!Number.isFinite(value)) return 'R$ 0,00'
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatHealthTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: HEALTH_TIME_ZONE,
  })
}

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function monthLabel(date: Date) {
  const label = date.toLocaleDateString('pt-BR', { month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const formatDate = (date: Date) => {
  const formatted = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export const Dashboard = () => {
  const { tasks } = useTasks()
  const { items: healthItems } = useHealth()
  const { weekItems } = useHealthWeek()
  const [sleepGoal, setSleepGoal] = useState<SleepGoal | null>(null)
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([])
  const [sleepStats, setSleepStats] = useState<SleepStats | null>(null)
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length

  const [financeSummary, setFinanceSummary] = useState<FinanceSummary>({
    total_income: 0,
    total_expense: 0,
    balance: 0,
  })
  const [financeTransactions, setFinanceTransactions] = useState<Transaction[]>([])

  const [ideas, setIdeas] = useState<IdeaResponse[]>([])
  const [notes, setNotes] = useState<Array<{ id: string; title: string }>>([])
  const [notesCount, setNotesCount] = useState(0)
  const [shoppingCategories, setShoppingCategories] = useState<
    Array<{ id: string; title: string; itemsCount: number }>
  >([])
  const [shoppingCategoriesCount, setShoppingCategoriesCount] = useState(0)
  const [shoppingItemsCount, setShoppingItemsCount] = useState(0)

  const currentMonthLabel = useMemo(() => monthLabel(new Date()), [])

  const financeMonthBars = useMemo(() => {
    const now = new Date()

    return Array.from({ length: 4 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1)
      const monthKey = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
      const monthTransactions = financeTransactions.filter(transaction =>
        transaction.transaction_date.startsWith(monthKey)
      )
      const income = monthTransactions
        .filter(transaction => transaction.type === 'income')
        .reduce((acc, transaction) => acc + transaction.amount, 0)
      const expense = monthTransactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((acc, transaction) => acc + transaction.amount, 0)
      return {
        key: monthKey,
        label: monthLabel(date).slice(0, 3),
        income,
        expense,
        balance: income - expense,
      }
    })
  }, [financeTransactions])

  const financeTopExpenseCategory = useMemo(() => {
    const byCategory = new Map<string, { category: string; icon: string; value: number }>()

    for (const transaction of financeTransactions) {
      if (transaction.type !== 'expense') continue
      const key = `${transaction.category_icon} ${transaction.category}`
      const current = byCategory.get(key)
      byCategory.set(key, {
        category: transaction.category,
        icon: transaction.category_icon,
        value: (current?.value ?? 0) + transaction.amount,
      })
    }

    return [...byCategory.values()].sort((a, b) => b.value - a.value)[0] ?? null
  }, [financeTransactions])

  const financeMaxBarValue = useMemo(() => {
    const highest = financeMonthBars.reduce((acc, item) => {
      return Math.max(acc, item.income, item.expense, Math.abs(item.balance))
    }, 0)
    return highest > 0 ? highest : 1
  }, [financeMonthBars])

  const financeHasActivity = useMemo(
    () =>
      financeMonthBars.some(
        item => item.income > 0 || item.expense > 0 || item.balance !== 0
      ),
    [financeMonthBars]
  )

  const computedWeeklySleepAverage = useMemo(() => {
    const withValues = sleepLogs.filter(item => item.duration_h > 0)
    const base = withValues.length ? withValues : sleepLogs
    const total = base.reduce((acc, item) => acc + item.duration_h, 0)
    const value = base.length ? total / base.length : 0
    return Math.round(value * 10) / 10
  }, [sleepLogs])

  const sleepMetaHours = sleepGoal?.goalHours ?? 8
  const sleepAverageHours =
    sleepGoal?.averageHours !== undefined && sleepGoal?.averageHours !== null && sleepGoal.averageHours > 0
      ? sleepGoal.averageHours
      : sleepStats?.avg_hours !== undefined && sleepStats?.avg_hours !== null && sleepStats.avg_hours > 0
        ? sleepStats.avg_hours
        : computedWeeklySleepAverage > 0
          ? computedWeeklySleepAverage
          : null

  const healthToday = useMemo(() => {
    const weekById = new Map(
      weekItems
        .map(item => [item.reminderId ?? item.id, item] as const)
        .filter(([id]) => Boolean(id))
    )

    const todayKey = toDateKey(new Date())
    const todayItems = healthItems
      .filter(item => {
        const week = weekById.get(item.id)
        if (!week) return false
        const day = week.days.find(entry => toDateKeyFromISO(entry.date) === todayKey)
        return Boolean(day?.status)
      })
      .sort((a, b) => a.time.localeCompare(b.time))

    return {
      items: todayItems,
      medicines: todayItems.filter(item => item.type === 'MEDICINE'),
      workouts: todayItems.filter(item => item.type === 'WORKOUT'),
    }
  }, [healthItems, weekItems])

  const healthWeekSummary = useMemo(() => {
    let totalDays = 0
    let confirmedDays = 0

    for (const reminder of weekItems) {
      for (const day of reminder.days) {
        totalDays += 1
        if (isConfirmedStatus(day.status)) confirmedDays += 1
      }
    }

    return { totalDays, confirmedDays }
  }, [weekItems])

  useEffect(() => {
    let cancelled = false

    async function loadFinance() {
      try {
        const [summary, transactions] = await Promise.all([
          financeService.getSummary('mensal'),
          financeService.listTransactions('anual'),
        ])

        if (cancelled) return

        setFinanceSummary(summary)
        setFinanceTransactions(transactions)
      } catch {
        if (cancelled) return
        setFinanceSummary({
          total_income: 0,
          total_expense: 0,
          balance: 0,
        })
        setFinanceTransactions([])
      }
    }

    async function loadIdeas() {
      try {
        const data = await ideasService.listIdeas()
        if (!cancelled) setIdeas(data)
      } catch {
        if (!cancelled) setIdeas([])
      }
    }

    async function loadNotes() {
      try {
        const response = await notesService.filterNotes('')
        const list = unwrapNoteList(response.data)
        if (cancelled) return

        setNotesCount(list.length)
        setNotes(
          list
            .map(note => ({
              id: normalizeId(note.id ?? note._id),
              title: (note.title ?? '').trim(),
            }))
            .filter(note => note.id && note.title)
            .slice(0, 3)
        )
      } catch {
        if (!cancelled) {
          setNotesCount(0)
          setNotes([])
        }
      }
    }

    async function loadShopping() {
      try {
        const [categoriesResponse, itemsResponse] = await Promise.all([
          shoppingService.listCategories(),
          shoppingService.listItems(),
        ])

        const categories = (categoriesResponse.data ?? [])
          .map(normalizeShoppingCategory)
          .filter(category => category.id)

        const items = itemsResponse.data ?? []

        const itemsByCategoryId = new Map<string, number>()
        for (const item of items) {
          const categoryId = getShoppingItemCategoryId(item)
          if (!categoryId) continue
          itemsByCategoryId.set(
            categoryId,
            (itemsByCategoryId.get(categoryId) ?? 0) + 1
          )
        }

        const categoriesWithCounts = categories
          .map(category => ({
            ...category,
            itemsCount: itemsByCategoryId.get(category.id) ?? 0,
          }))
          .sort((a, b) => b.itemsCount - a.itemsCount)

        if (cancelled) return
        setShoppingCategoriesCount(categories.length)
        setShoppingItemsCount(items.length)
        setShoppingCategories(categoriesWithCounts.slice(0, 3))
      } catch {
        if (!cancelled) {
          setShoppingCategoriesCount(0)
          setShoppingItemsCount(0)
          setShoppingCategories([])
        }
      }
    }

    async function loadSleep() {
      try {
        const [goalsResponse, logsResponse, statsResponse] = await Promise.all([
          sleepService.list(),
          sleepLogsService.list('7d'),
          sleepLogsService.stats('7d'),
        ])

        if (cancelled) return

        const latestGoal =
          [...(goalsResponse.data ?? [])].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0] ?? null

        setSleepGoal(latestGoal)
        setSleepLogs(logsResponse.data ?? [])
        setSleepStats(statsResponse.data ?? null)
      } catch {
        if (cancelled) return
        setSleepGoal(null)
        setSleepLogs([])
        setSleepStats(null)
      }
    }

    void loadFinance()
    void loadIdeas()
    void loadNotes()
    void loadShopping()
    void loadSleep()
    return () => {
      cancelled = true
    }
  }, [])

  const topIdeas = ideas.slice(0, 3)
  const financeBalance = financeSummary.balance
  const financeTrendIsPositive = financeBalance >= 0
  const healthCards = [
    {
      label: 'Hoje',
      value: healthToday.items.length,
      description: 'compromissos agendados',
    },
    {
      label: 'Confirmados',
      value: healthWeekSummary.confirmedDays,
      description: `de ${healthWeekSummary.totalDays} dias rastreados`,
    },
  ]

  return (
    <div className="space-y-8 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            {formatDate(new Date())}
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Olá! Que bom ter você por aqui.
          </h1>
          <p className="text-sm text-slate-500">
            Seu painel de vida — tudo organizado, em um só lugar.
          </p>
        </div>

        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-700"
          aria-label="Notificações"
        >
          <Bell size={18} />
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-12">
        <Link
          to="/dashboard/finance"
          className="group relative overflow-hidden rounded-4xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-7 text-white shadow-xl lg:col-span-7"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-slate-400">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <LineChart size={14} />
                </span>
                Gestão financeira
              </div>
              <p className="mt-5 text-xs text-slate-400">
                Saldo de {currentMonthLabel}
              </p>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-3xl font-semibold">
                  {formatCurrencyBRL(financeBalance)}
                </span>
                <span
                  className={`text-sm ${
                    financeTrendIsPositive ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {financeTrendIsPositive ? '↗' : '↘'}
                </span>
              </div>
            </div>

            <span className="text-slate-500">›</span>
          </div>

          {financeHasActivity ? (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
              {financeMonthBars.map(month => (
                <div
                  key={month.key}
                  className="flex h-20 flex-col items-center gap-2 rounded-2xl bg-white/5 px-2 py-2"
                >
                  <div className="flex h-14 w-full items-end justify-center rounded-2xl bg-white/5">
                    <span
                      className={`w-6 rounded-lg ${
                        month.balance >= 0 ? 'bg-emerald-300/80' : 'bg-rose-300/80'
                      }`}
                      style={{
                        height: `${Math.max(
                          6,
                          (Math.max(month.income, month.expense, Math.abs(month.balance)) /
                            financeMaxBarValue) *
                            56
                        )}px`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {month.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
              Sem movimentação financeira nos últimos 4 meses.
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Receitas
              </p>
              <p className="text-emerald-300">
                + {formatCurrencyBRL(financeSummary.total_income)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Despesas
              </p>
              <p className="text-rose-300">
                - {formatCurrencyBRL(financeSummary.total_expense)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Maior gasto
              </p>
              <p className="text-slate-200">
                {financeTopExpenseCategory
                  ? `${financeTopExpenseCategory.icon} ${financeTopExpenseCategory.category}`
                  : 'Sem dados'}
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
        </Link>

        <div className="grid gap-6 lg:col-span-5">
          <Link
            to="/dashboard/sleep"
            className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-indigo-700 via-indigo-700 to-indigo-900 p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-indigo-200">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10">
                  <Moon size={12} />
                </span>
                Sono
              </div>
              <span className="text-indigo-200">›</span>
            </div>

            <div className="mt-6">
              <p className="text-xs text-indigo-200">Meta</p>
              <p className="mt-1 text-3xl font-semibold">
                {sleepMetaHours}h
              </p>
              <p className="mt-1 text-[11px] text-indigo-200">
                {sleepAverageHours !== null
                  ? `Média: ${sleepAverageHours}h`
                  : 'Sem média ainda'}
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard/health"
            className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-rose-50 via-white to-rose-100 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.3em] text-rose-400">
                Saúde
              </div>
              <span className="text-rose-400">›</span>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-lg font-semibold text-slate-900">Rotina real</p>
              <p className="text-xs text-slate-500">
                {healthToday.items.length
                  ? 'Seus lembretes de hoje vêm direto da API.'
                  : 'Nenhum lembrete confirmado para hoje.'}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2 lg:grid-cols-1">
              {healthCards.map(card => (
                <div
                  key={card.label}
                  className="rounded-2xl bg-white px-3 py-3 shadow-sm"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    {card.label}
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-900">{card.value}</p>
                  <p className="text-[11px] leading-tight text-slate-500">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 text-[11px] text-slate-600">
              {healthToday.items.slice(0, 2).map(item => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white px-3 py-2 shadow-sm"
                >
                  <span className="font-semibold text-slate-900">
                    {formatHealthTime(item.time)}
                  </span>
                  <span className="mx-2 text-slate-300">•</span>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Link
          to="/dashboard/tasks"
          className="rounded-[28px] bg-blue-50 p-5 shadow-sm transition hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-blue-500">
              <CheckSquare2 size={14} />
              Tarefas
            </div>
            <span className="text-xs text-blue-400">
              {totalTasks ? `${completedTasks}/${totalTasks}` : '—'}
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {totalTasks || 0}
          </p>
          <p className="text-xs text-slate-500">tarefas registradas</p>
          <div className="mt-4 space-y-3 text-xs text-slate-500">
            <div className="h-2 w-full rounded-full bg-blue-100">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{
                  width: totalTasks
                    ? `${(completedTasks / totalTasks) * 100}%`
                    : '0%',
                }}
              />
            </div>
            <p>
              {totalTasks
                ? `${completedTasks} concluídas`
                : 'Sem tarefas no momento'}
            </p>
          </div>
        </Link>

        <Link
          to="/dashboard/notes"
          className="rounded-[28px] bg-amber-50 p-5 shadow-sm transition hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-amber-500">
              <StickyNote size={14} />
              Notas
            </div>
            <span className="text-xs text-amber-400">
              {notesCount}
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {notesCount}
          </p>
          <p className="text-xs text-slate-500">anotações ativas</p>
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            {notes.map(note => (
              <div
                key={note.id}
                className="rounded-xl bg-white px-3 py-2 shadow-sm"
              >
                {note.title}
              </div>
            ))}
          </div>
        </Link>

        <Link
          to="/dashboard/ideas"
          className="rounded-[28px] bg-rose-50 p-5 shadow-sm transition hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-rose-500">
              <Lightbulb size={14} />
              Ideias
            </div>
            <span className="text-xs text-rose-400">
              {ideas.length}
            </span>
          </div>
          <div className="mt-4 flex items-end gap-2">
            <p className="text-3xl font-semibold text-slate-900">
              {ideas.length}
            </p>
            <p className="text-sm text-rose-500">ideias</p>
          </div>
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            {topIdeas.map(idea => (
              <div
                key={idea.id}
                className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm"
              >
                <span>{idea.title}</span>
              </div>
            ))}
          </div>
        </Link>

        <Link
          to="/dashboard/shopping"
          className="rounded-[28px] bg-emerald-50 p-5 shadow-sm transition hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-emerald-600">
              <ShoppingCart size={14} />
              Compras
            </div>
            <span className="text-xs text-emerald-500">
              {shoppingCategoriesCount || '—'}
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {shoppingItemsCount || 0}
          </p>
          <p className="text-xs text-slate-500">itens na lista</p>
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            {shoppingCategories.map(category => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm"
              >
                <span>{category.title}</span>
                <span className="text-emerald-500">
                  {category.itemsCount} itens
                </span>
              </div>
            ))}
          </div>
        </Link>
      </section>
    </div>
  )
}
