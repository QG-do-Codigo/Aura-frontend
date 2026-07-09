import { useMemo, useState } from 'react'
import { CalendarCheck, Dumbbell, Pill } from 'lucide-react'

import type { HealthItem, HealthWeekStatus } from './types'
import { useHealth } from '../../hooks/useHealth'
import { useHealthWeek } from '../../hooks/useHealthWeek'
import { HealthFormDialog } from './components/HealthFormDialog'
import { HealthDetailsDialog } from './components/HealthDetailsDialog'
import { HealthDeleteDialog } from './components/HealthDeleteDialog'
import { HealthWeekChart } from './components/HealthWeekChart'
import { HealthScheduleCard } from './components/HealthScheduleCard'

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

function parseDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatHour(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: HEALTH_TIME_ZONE,
  })
}

function getWeekDays() {
  const now = new Date()
  const localFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: HEALTH_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const localParts = localFormatter.format(now).split('-')
  const localDate = new Date(
    Number(localParts[0]),
    Number(localParts[1]) - 1,
    Number(localParts[2])
  )
  const dayOfWeek = localDate.getDay() // 0=Dom, 1=Seg...
  const startOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const startOfWeek = new Date(localDate)
  startOfWeek.setDate(localDate.getDate() + startOffset)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + index)
    const label = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      timeZone: HEALTH_TIME_ZONE,
    })
      .format(date)
      .replace('.', '')
    return {
      date,
      key: toDateKey(date),
      label: label.charAt(0).toUpperCase() + label.slice(1),
    }
  })
}

function isConfirmedStatus(status: HealthWeekStatus | null | undefined) {
  return status === 'done' || status === 'late'
}

const STATUS_LABELS: Record<HealthWeekStatus, string> = {
  pending: 'Pendente',
  done: 'Confirmado',
  late: 'Atrasado',
  missed: 'Perdido',
}

function statusBadgeClasses(status: HealthWeekStatus) {
  switch (status) {
    case 'done':
      return 'bg-emerald-100 text-emerald-700'
    case 'late':
      return 'bg-amber-100 text-amber-700'
    case 'missed':
      return 'bg-slate-100 text-slate-600'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

export function HealthPage() {
  const {
    items,
    isLoading,
    error,
    createHealth,
    updateHealth,
    deleteHealth,
    getHealthById,
  } = useHealth()
  const {
    weekItems,
    isLoading: isWeekLoading,
    error: weekError,
    fetchWeek,
    confirmDay,
  } = useHealthWeek()

  const [formOpen, setFormOpen] = useState(false)
  const [formItem, setFormItem] = useState<HealthItem | null>(null)
  const [formDefaultType, setFormDefaultType] = useState<
    HealthItem['type'] | undefined
  >(undefined)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsItem, setDetailsItem] = useState<HealthItem | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedDays, setSelectedDays] = useState<Record<string, string>>({})

  const medicines = useMemo(
    () =>
      items
        .filter(item => item.type === 'MEDICINE')
        .sort((a, b) => a.time.localeCompare(b.time)),
    [items]
  )

  const workouts = useMemo(
    () =>
      items
        .filter(item => item.type === 'WORKOUT')
        .sort((a, b) => a.time.localeCompare(b.time)),
    [items]
  )

  const weekDays = useMemo(() => getWeekDays(), [])
  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const todayDate = useMemo(() => parseDateKey(todayKey), [todayKey])
  const itemsById = useMemo(
    () => new Map(items.map(item => [item.id, item])),
    [items]
  )
  const weekById = useMemo(() => {
    return new Map(
      weekItems
        .map(item => [item.reminderId ?? item.id, item] as const)
        .filter(([key]) => !!key)
    )
  }, [weekItems])

  function getStatusForDate(reminderId: string, dateKey: string) {
    const week = weekById.get(reminderId)
    if (!week) return null
    const day = week.days.find(item => toDateKeyFromISO(item.date) === dateKey)
    return day?.status ?? null
  }

  function getDateISO(reminderId: string, dateKey: string) {
    const week = weekById.get(reminderId)
    if (!week) return null
    const day = week.days.find(item => toDateKeyFromISO(item.date) === dateKey)
    return day?.date ?? null
  }

  function isConfirmableDate(dateKey: string) {
    if (!dateKey) return false
    const date = parseDateKey(dateKey)
    const diff = Math.floor(
      (todayDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )
    return diff >= 0 && diff <= 3
  }

  function handleSelectDay(reminderId: string, dateKey: string) {
    setSelectedDays(prev => ({ ...prev, [reminderId]: dateKey }))
  }

  async function handleConfirmDay(reminderId: string, dateKey: string) {
    const date = getDateISO(reminderId, dateKey)
    if (!date) return
    try {
      await confirmDay(reminderId, date)
      await fetchWeek()
    } catch (err) {
      console.error('Erro ao confirmar dia:', err)
    }
  }

  const medicinesToday = useMemo(
    () =>
      medicines.filter(item => {
        const status = getStatusForDate(item.id, todayKey)
        return status !== null
      }),
    [medicines, weekById, todayKey]
  )

  const workoutsToday = useMemo(
    () =>
      workouts.filter(item => {
        const status = getStatusForDate(item.id, todayKey)
        return status !== null
      }),
    [workouts, weekById, todayKey]
  )

  const { medicineDoneMap, workoutDoneMap } = useMemo(() => {
    const medicineMap: Record<string, number> = {}
    const workoutMap: Record<string, number> = {}

    weekItems.forEach(item => {
      const weekId = item.reminderId ?? item.id
      if (!weekId) return
      const type = item.type ?? itemsById.get(weekId)?.type
      if (!type) return
      item.days.forEach(day => {
        if (!isConfirmedStatus(day.status)) return
        const key = toDateKeyFromISO(day.date)
        if (!key) return
        const target = type === 'MEDICINE' ? medicineMap : workoutMap
        target[key] = (target[key] ?? 0) + 1
      })
    })

    return { medicineDoneMap: medicineMap, workoutDoneMap: workoutMap }
  }, [weekItems, itemsById])

  const weekChartData = useMemo(
    () =>
      weekDays.map(day => ({
        label: day.label,
        medicine: medicineDoneMap[day.key] ?? 0,
        workout: workoutDoneMap[day.key] ?? 0,
      })),
    [weekDays, medicineDoneMap, workoutDoneMap]
  )

  const combinedError = error ?? weekError

  async function handleSubmit(
    data: {
      title: string
      description: string
      type: HealthItem['type']
      time: string
      repeatDaily: boolean
    },
    id?: string
  ) {
    if (id) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type, ...restOfData } = data
      await updateHealth(id, restOfData)
      await fetchWeek()
      return
    }
    await createHealth(data)
    await fetchWeek()
  }

  function handleOpenCreate(defaultType?: HealthItem['type']) {
    setFormItem(null)
    setFormDefaultType(defaultType)
    setFormOpen(true)
  }

  function handleOpenEdit(item: HealthItem) {
    setFormItem(item)
    setFormDefaultType(undefined)
    setFormOpen(true)
  }

  async function handleOpenDetails(item: HealthItem) {
    setDetailsItem(item)
    setDetailsOpen(true)
    setDetailsLoading(true)
    try {
      const fresh = await getHealthById(item.id)
      setDetailsItem(fresh)
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err)
    } finally {
      setDetailsLoading(false)
    }
  }

  function handleOpenDelete(item: HealthItem) {
    setDetailsOpen(false)
    setDeleteOpen(true)
    setDetailsItem(item)
  }

  async function handleDeleteConfirm() {
    if (!detailsItem) return
    await deleteHealth(detailsItem.id)
    await fetchWeek()
    setDeleteOpen(false)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Saúde</h1>
            <p className="text-slate-500">
              Controle sua rotina de medicamentos e treinos da semana.
            </p>
          </div>
        </header>

        {combinedError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {combinedError}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <HealthScheduleCard
            title="Medicamentos"
            subtitle="Rotina diária"
            icon={<Pill size={20} />}
            tone="rose"
            createLabel="Novo medicamento"
            emptyLabel="Nenhum medicamento para hoje."
            confirmLabel="Confirmar"
            showStatusDot
            items={medicinesToday}
            isLoading={isLoading}
            isWeekLoading={isWeekLoading}
            weekDays={weekDays}
            todayKey={todayKey}
            selectedDays={selectedDays}
            onCreate={() => handleOpenCreate('MEDICINE')}
            onOpenDetails={handleOpenDetails}
            onOpenEdit={handleOpenEdit}
            onOpenDelete={handleOpenDelete}
            onSelectDay={handleSelectDay}
            onConfirmDay={handleConfirmDay}
            getStatusForDate={getStatusForDate}
            isConfirmableDate={isConfirmableDate}
            formatHour={formatHour}
            isConfirmedStatus={isConfirmedStatus}
            statusBadgeClasses={statusBadgeClasses}
            statusLabels={STATUS_LABELS}
          />

          <HealthScheduleCard
            title="Treinos"
            subtitle="Acompanhamento Diário"
            icon={<Dumbbell size={20} />}
            tone="sky"
            createLabel="Novo treino"
            emptyLabel="Nenhum treino para hoje."
            confirmLabel="Marcar feito"
            items={workoutsToday}
            isLoading={isLoading}
            isWeekLoading={isWeekLoading}
            weekDays={weekDays}
            todayKey={todayKey}
            selectedDays={selectedDays}
            onCreate={() => handleOpenCreate('WORKOUT')}
            onOpenDetails={handleOpenDetails}
            onOpenEdit={handleOpenEdit}
            onOpenDelete={handleOpenDelete}
            onSelectDay={handleSelectDay}
            onConfirmDay={handleConfirmDay}
            getStatusForDate={getStatusForDate}
            isConfirmableDate={isConfirmableDate}
            formatHour={formatHour}
            isConfirmedStatus={isConfirmedStatus}
            statusBadgeClasses={statusBadgeClasses}
            statusLabels={STATUS_LABELS}
          />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <CalendarCheck size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Resumo da Semana
              </h2>
              <p className="text-xs uppercase text-slate-500">
                Medicamentos x Treinos confirmados
              </p>
            </div>
          </header>

          <HealthWeekChart data={weekChartData} />

          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Medicamentos confirmados
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              Treinos confirmados
            </div>
          </div>
        </section>

        <HealthFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleSubmit}
          initialData={formItem}
          defaultType={formDefaultType}
          allowTypeChange={!formItem && !formDefaultType}
        />
        <HealthDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          item={detailsItem}
          isLoading={detailsLoading}
          onEdit={() => detailsItem && handleOpenEdit(detailsItem)}
          onDelete={() => detailsItem && handleOpenDelete(detailsItem)}
        />
        <HealthDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          item={detailsItem}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  )
}
