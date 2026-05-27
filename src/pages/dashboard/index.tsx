import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Bell,
  Lightbulb,
  Moon,
  ShoppingCart,
  StickyNote,
  CheckSquare2,
  LineChart,
} from 'lucide-react'
import { useTasks } from '../../services/tasks/tasksService'
import { ideasService, type IdeaResponse } from '../../services/ideas/ideasService'
import { notesService, type NoteResponse } from '../../services/notes/notesService'
import {
  shoppingService,
  type ShoppingCategoryResponse,
  type ShoppingResponse,
} from '../../services/shopping/shoppingService'
import { sleepService } from '../../services/sleep/sleepService'
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

function normalizeShoppingCategory(category: ShoppingCategoryResponse) {
  const id = normalizeId(category.id ?? category._id ?? category.categoryId)
  const title = (category.title ?? category.name ?? category.category ?? '').trim()

  return {
    id,
    title: title || 'Categoria',
  }
}

function getShoppingItemCategoryId(item: ShoppingResponse) {
  return normalizeId(item.categoryId ?? item.category ?? '')
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
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length

  const [ideas, setIdeas] = useState<IdeaResponse[]>([])
  const [notes, setNotes] = useState<Array<{ id: string; title: string }>>([])
  const [notesCount, setNotesCount] = useState(0)
  const [shoppingCategories, setShoppingCategories] = useState<
    Array<{ id: string; title: string; itemsCount: number }>
  >([])
  const [shoppingCategoriesCount, setShoppingCategoriesCount] = useState(0)
  const [shoppingItemsCount, setShoppingItemsCount] = useState(0)
  const [sleepGoal, setSleepGoal] = useState<SleepGoal | null>(null)

  useEffect(() => {
    let cancelled = false

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
        const response = await sleepService.list()
        const list = response.data ?? []
        const latest =
          [...list].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0] ?? null

        if (!cancelled) setSleepGoal(latest)
      } catch {
        if (!cancelled) setSleepGoal(null)
      }
    }

    void loadIdeas()
    void loadNotes()
    void loadShopping()
    void loadSleep()
    return () => {
      cancelled = true
    }
  }, [])

  const topIdeas = ideas.slice(0, 3)

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
              <p className="mt-5 text-xs text-slate-400">Saldo de Março</p>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-3xl font-semibold">R$ 1.700</span>
                <span className="text-sm text-emerald-300">↗</span>
              </div>
            </div>

            <span className="text-slate-500">›</span>
          </div>

          <div className="mt-8 grid grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`bar-${index}`}
                className="flex h-16 items-end justify-center rounded-2xl bg-white/5"
              >
                <span className="h-10 w-6 rounded-lg bg-rose-300/80" />
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Receitas
              </p>
              <p className="text-emerald-300">+R$ 5.200</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Despesas
              </p>
              <p className="text-rose-300">-R$ 3.500</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Maior gasto
              </p>
              <p className="text-slate-200">Moradia</p>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
        </Link>

        <Link
          to="/dashboard/sleep"
          className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-indigo-700 via-indigo-700 to-indigo-900 p-6 text-white shadow-lg lg:col-span-3"
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
              {sleepGoal ? `${sleepGoal.goalHours}h` : '—'}
            </p>
            <p className="mt-1 text-[11px] text-indigo-200">
              {sleepGoal?.averageHours !== undefined &&
              sleepGoal?.averageHours !== null
                ? `Média: ${sleepGoal.averageHours}h`
                : 'Sem média ainda'}
            </p>
          </div>
        </Link>

        <Link
          to="/dashboard/health"
          className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-rose-50 via-white to-rose-100 p-6 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-rose-400">
              Saúde
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-lg font-semibold text-slate-900">
              Rotina em dia
            </p>
            <p className="text-xs text-slate-500">
              Acompanhe hábitos e lembretes sem métricas de hidratação.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-rose-500">
            <span className="rounded-full bg-white px-3 py-2 shadow-sm">
              Medicamentos
            </span>
            <span className="rounded-full bg-white px-3 py-2 shadow-sm">
              Treinos
            </span>
            <span className="rounded-full bg-white px-3 py-2 shadow-sm">
              Consultas
            </span>
          </div>
        </Link>
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
