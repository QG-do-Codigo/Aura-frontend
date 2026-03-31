import type { ReactNode } from 'react'

import type { HealthItem, HealthWeekStatus } from '../types'

type WeekDay = {
  key: string
  label: string
}

type ToneKey = 'rose' | 'sky'

const toneStyles: Record<
  ToneKey,
  {
    section: string
    icon: string
    title: string
    subtitle: string
    createButton: string
    daySelected: string
    dayDefault: string
    dayHover: string
    detailsButton: string
    deleteButton: string
    confirmActive: string
  }
> = {
  rose: {
    section: 'rounded-3xl border border-rose-100 bg-rose-50/70 p-6 shadow-sm',
    icon: 'bg-white text-rose-500',
    title: 'text-rose-900',
    subtitle: 'text-rose-500',
    createButton:
      'rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-100',
    daySelected: 'border-rose-200 bg-rose-100 text-rose-700',
    dayDefault: 'border-slate-200 bg-white text-slate-500',
    dayHover: 'hover:bg-rose-50',
    detailsButton:
      'rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50',
    deleteButton:
      'rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50',
    confirmActive: 'bg-rose-100 text-rose-600 hover:bg-rose-200',
  },
  sky: {
    section: 'rounded-3xl border border-sky-100 bg-sky-50/70 p-6 shadow-sm',
    icon: 'bg-white text-sky-500',
    title: 'text-sky-900',
    subtitle: 'text-sky-500',
    createButton:
      'rounded-full bg-white px-4 py-2 text-sm font-semibold text-sky-600 shadow-sm transition hover:bg-sky-100',
    daySelected: 'border-sky-200 bg-sky-100 text-sky-700',
    dayDefault: 'border-slate-200 bg-white text-slate-500',
    dayHover: 'hover:bg-sky-50',
    detailsButton:
      'rounded-full border border-sky-200 px-3 py-1.5 text-xs font-semibold text-sky-600 transition hover:bg-sky-50',
    deleteButton:
      'rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50',
    confirmActive: 'bg-sky-100 text-sky-600 hover:bg-sky-200',
  },
}

type HealthScheduleCardProps = {
  title: string
  subtitle: string
  icon: ReactNode
  tone: ToneKey
  createLabel: string
  emptyLabel: string
  confirmLabel: string
  showStatusDot?: boolean
  items: HealthItem[]
  isLoading: boolean
  isWeekLoading: boolean
  weekDays: WeekDay[]
  todayKey: string
  selectedDays: Record<string, string>
  onCreate: () => void
  onOpenDetails: (item: HealthItem) => void
  onOpenEdit: (item: HealthItem) => void
  onOpenDelete: (item: HealthItem) => void
  onSelectDay: (itemId: string, dateKey: string) => void
  onConfirmDay: (itemId: string, dateKey: string) => void
  getStatusForDate: (
    reminderId: string,
    dateKey: string
  ) => HealthWeekStatus | null
  isConfirmableDate: (dateKey: string) => boolean
  formatHour: (value: string) => string
  isConfirmedStatus: (status: HealthWeekStatus | null | undefined) => boolean
  statusBadgeClasses: (status: HealthWeekStatus) => string
  statusLabels: Record<HealthWeekStatus, string>
}

export function HealthScheduleCard({
  title,
  subtitle,
  icon,
  tone,
  createLabel,
  emptyLabel,
  confirmLabel,
  showStatusDot = false,
  items,
  isLoading,
  isWeekLoading,
  weekDays,
  todayKey,
  selectedDays,
  onCreate,
  onOpenDetails,
  onOpenEdit,
  onOpenDelete,
  onSelectDay,
  onConfirmDay,
  getStatusForDate,
  isConfirmableDate,
  formatHour,
  isConfirmedStatus,
  statusBadgeClasses,
  statusLabels,
}: HealthScheduleCardProps) {
  const styles = toneStyles[tone]

  return (
    <section className={styles.section}>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm ${styles.icon}`}
          >
            {icon}
          </span>
          <div>
            <h2 className={`text-lg font-semibold ${styles.title}`}>{title}</h2>
            <p className={`text-xs uppercase ${styles.subtitle}`}>{subtitle}</p>
          </div>
        </div>

        <button type="button" onClick={onCreate} className={styles.createButton}>
          {createLabel}
        </button>
      </header>

      <div
        className="mt-6 max-h-[460px] space-y-3 overflow-y-auto pr-2"
        onClick={event => {
          const target = event.target as HTMLElement
          if (target.closest('button')) return
          onCreate()
        }}
      >
        {isLoading && (
          <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-400">
            Carregando...
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-500">
            {emptyLabel}
          </div>
        )}

        {items.map(item => {
          const selectedKey = selectedDays[item.id] ?? todayKey
          const todayStatus = getStatusForDate(item.id, todayKey)
          const selectedStatus = getStatusForDate(item.id, selectedKey)
          const canConfirm =
            !!selectedStatus &&
            isConfirmableDate(selectedKey) &&
            (selectedStatus === 'pending' || selectedStatus === 'missed') &&
            !isWeekLoading

          return (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div
                className={
                  showStatusDot ? 'flex items-center gap-3' : undefined
                }
              >
                {showStatusDot && (
                  <span
                    className={`h-3 w-3 rounded-full ${
                      item.done ? 'bg-emerald-500' : 'bg-rose-400'
                    }`}
                  />
                )}
                <div>
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatHour(item.time)} •{' '}
                    {item.repeatDaily ? 'Diário' : 'Agendado'}
                  </p>
                  {todayStatus && (
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${statusBadgeClasses(
                          todayStatus
                        )}`}
                      >
                        {statusLabels[todayStatus]}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Hoje
                      </span>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    {weekDays.map(day => {
                      const dayStatus = getStatusForDate(item.id, day.key)
                      const isSelected = selectedKey === day.key
                      const statusTone =
                        dayStatus === 'done'
                          ? 'text-emerald-600'
                          : dayStatus === 'late'
                            ? 'text-amber-600'
                            : dayStatus === 'missed'
                              ? 'text-slate-400'
                              : 'text-slate-400'
                      const isEnabled =
                        !!dayStatus &&
                        isConfirmableDate(day.key) &&
                        !isWeekLoading

                      return (
                        <button
                          key={day.key}
                          type="button"
                          disabled={!isEnabled}
                          onClick={() =>
                            isEnabled && onSelectDay(item.id, day.key)
                          }
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition ${
                            isSelected ? styles.daySelected : styles.dayDefault
                          } ${
                            isEnabled
                              ? styles.dayHover
                              : 'cursor-not-allowed opacity-40'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <span className={`text-[10px] ${statusTone}`}>
                              ●
                            </span>
                            {day.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenDetails(item)}
                  className={styles.detailsButton}
                >
                  Detalhes
                </button>
                <button
                  type="button"
                  onClick={() => onOpenEdit(item)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onOpenDelete(item)}
                  className={styles.deleteButton}
                >
                  Excluir
                </button>
                {selectedStatus && isConfirmedStatus(selectedStatus) ? (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${statusBadgeClasses(
                      selectedStatus
                    )}`}
                  >
                    {statusLabels[selectedStatus]}
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!canConfirm}
                    onClick={() => onConfirmDay(item.id, selectedKey)}
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide transition ${
                      canConfirm
                        ? styles.confirmActive
                        : 'cursor-not-allowed bg-slate-100 text-slate-400'
                    }`}
                  >
                    {confirmLabel}
                  </button>
                )}
                {selectedStatus === 'missed' && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    Você esqueceu de confirmar. Deseja marcar agora?
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
