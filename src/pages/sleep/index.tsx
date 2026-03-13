import { useEffect, useMemo, useState } from 'react'
import { Moon, AlarmClock, Sparkles, Trash2 } from 'lucide-react'
import { Switch } from '../../components/UI/switch'
import { useSleep } from '../../hooks/useSleep'
import { ToastAlert } from '../../utils/toastAlert'

export function SleepPage() {
  const { goals, activeGoal, loading, upsertGoal, updateGoal, deleteGoal } = useSleep()
  const [relaxMode, setRelaxMode] = useState(true)
  const [goalHours, setGoalHours] = useState(7.5)
  const [alarmHour, setAlarmHour] = useState('')
  const [alarmMinute, setAlarmMinute] = useState('')
  const [bedtimeRoutine, setBedtimeRoutine] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      const aTime = new Date(a.updatedAt ?? a.createdAt).getTime()
      const bTime = new Date(b.updatedAt ?? b.createdAt).getTime()
      return bTime - aTime
    })
  }, [goals])

  function formatHours(value: number) {
    const safe = clampHours(value)
    const hours = Math.floor(safe)
    const minutes = Math.round((safe - hours) * 60)
    if (minutes === 60) {
      return `${hours + 1}h00`
    }
    return `${hours}h${String(minutes).padStart(2, '0')}`
  }

  function clampHours(value: number) {
    if (!Number.isFinite(value)) return 0
    return Math.max(0, Math.min(24, value))
  }

  function normalizeHourInput(raw: string) {
    const trimmed = raw.trim().replace(',', '.')
    if (!trimmed) return ''
    if (trimmed.includes(':')) {
      const [h, m] = trimmed.split(':')
      const hours = clampHours(Number(h))
      const minutes = Math.max(0, Math.min(59, Number(m)))
      const decimal = hours + minutes / 60
      return decimal.toFixed(1)
    }
    const numeric = clampHours(Number(trimmed))
    if (!Number.isFinite(numeric)) return ''
    return numeric.toFixed(1)
  }

  useEffect(() => {
    if (!activeGoal || editingGoalId) return
    setGoalHours(activeGoal.goalHours ?? 7.5)
    setBedtimeRoutine(activeGoal.bedtimeRoutine ?? '')
    if (activeGoal.alarmTime) {
      const date = new Date(activeGoal.alarmTime)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      setAlarmHour(hours)
      setAlarmMinute(minutes)
    } else {
      setAlarmHour('')
      setAlarmMinute('')
    }
  }, [activeGoal, editingGoalId])

  function setFormFromGoal(goal: typeof activeGoal) {
    if (!goal) return
    setGoalHours(goal.goalHours ?? 7.5)
    setBedtimeRoutine(goal.bedtimeRoutine ?? '')
    if (goal.alarmTime) {
      const date = new Date(goal.alarmTime)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      setAlarmHour(hours)
      setAlarmMinute(minutes)
    } else {
      setAlarmHour('')
      setAlarmMinute('')
    }
  }

  const alarmLabel = useMemo(() => {
    if (!activeGoal?.alarmTime) return { time: '—', day: 'Sem alarme' }
    const date = new Date(activeGoal.alarmTime)
    const time = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const day = date.toLocaleDateString('pt-BR', { weekday: 'long' })
    return { time, day }
  }, [activeGoal?.alarmTime])

  function clampInt(value: number, min: number, max: number) {
    if (!Number.isFinite(value)) return min
    return Math.max(min, Math.min(max, Math.floor(value)))
  }

  function buildAlarmIso(hoursRaw: string, minutesRaw: string) {
    if (!hoursRaw && !minutesRaw) return undefined
    const hours = clampInt(Number(hoursRaw), 0, 23)
    const minutes = clampInt(Number(minutesRaw), 0, 59)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date.toISOString()
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        goalHours: clampHours(goalHours),
        averageHours: undefined,
        bedtimeRoutine: bedtimeRoutine.trim() || undefined,
        alarmTime: buildAlarmIso(alarmHour, alarmMinute),
      }
      const saved = editingGoalId
        ? await updateGoal(editingGoalId, payload)
        : await upsertGoal(payload)
      if (!saved) {
        ToastAlert('Não foi possível salvar a rotina do sono', 'error')
        return
      }
      setEditingGoalId(saved.id ?? null)
      setGoalHours(saved.goalHours ?? goalHours)
      setBedtimeRoutine(saved.bedtimeRoutine ?? '')
      if (saved.alarmTime) {
        const date = new Date(saved.alarmTime)
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        setAlarmHour(hours)
        setAlarmMinute(minutes)
      }
      ToastAlert('Rotina salva com sucesso!', 'success')
    } catch (error) {
      ToastAlert('Erro ao salvar rotina do sono', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteGoal(id)
    if (editingGoalId === id) {
      setEditingGoalId(null)
      if (activeGoal) setFormFromGoal(activeGoal)
    }
  }

  function formatDate(value?: string | null) {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('pt-BR')
  }

  function formatTime(value?: string | null) {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const isEditing = Boolean(editingGoalId)

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8 lg:px-10">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-slate-900">
          <Moon size={18} className="text-sky-500" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Bons Sonhos
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Acompanhe suas noites e ajuste sua rotina de descanso.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
        <section className="rounded-[28px] bg-slate-900 p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Resumo da meta</h2>
              <p className="text-sm text-slate-300">
                Acompanhe sua meta ativa e ajustes recentes.
              </p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
              {activeGoal ? 'Meta ativa' : 'Sem meta'}
            </span>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs text-slate-300">Meta</p>
                <p className="text-lg font-semibold">{formatHours(goalHours)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs text-slate-300">Próximo alarme</p>
                <p className="text-lg font-semibold">{alarmLabel.time}</p>
                <p className="text-xs text-slate-400">{alarmLabel.day}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs text-slate-300">Rotina</p>
                <p className="text-sm text-slate-100">
                  {activeGoal?.bedtimeRoutine || 'Sem rotina definida.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  {isEditing ? 'Editando meta' : 'Nova meta'}
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {isEditing ? 'Atualizar rotina' : 'Criar rotina'}
                </p>
                <p className="text-xs text-slate-400">
                  {isEditing ? 'Alterar dados da meta' : 'Defina sua meta ideal'}
                </p>
              </div>
              <AlarmClock className="text-slate-300" />
            </div>
            <div className="mt-4 grid gap-3">
              <label className="text-xs text-slate-400">Alarme</label>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={23}
                  step={1}
                  value={alarmHour}
                  onChange={event => setAlarmHour(event.target.value)}
                  onBlur={event => {
                    const value = clampInt(Number(event.target.value), 0, 23)
                    setAlarmHour(String(value).padStart(2, '0'))
                  }}
                  placeholder="HH"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                />
                <span className="text-sm text-slate-400">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  step={1}
                  value={alarmMinute}
                  onChange={event => setAlarmMinute(event.target.value)}
                  onBlur={event => {
                    const value = clampInt(Number(event.target.value), 0, 59)
                    setAlarmMinute(String(value).padStart(2, '0'))
                  }}
                  placeholder="MM"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                />
              </div>
              <label className="text-xs text-slate-400">Meta de sono (h)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={goalHours}
                onChange={event =>
                  setGoalHours(Number(event.target.value.replace(',', '.')))
                }
                onBlur={event => {
                  const normalized = normalizeHourInput(event.target.value)
                  if (!normalized) return
                  setGoalHours(Number(normalized))
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              />
              <label className="text-xs text-slate-400">Rotina noturna</label>
              <textarea
                value={bedtimeRoutine}
                onChange={event => setBedtimeRoutine(event.target.value)}
                className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                placeholder="Ex: desligar telas, tomar chá, leitura leve..."
              />
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? 'Salvando...'
                  : isEditing
                    ? 'Atualizar rotina'
                    : 'Criar rotina'}
              </button>
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Modo Relaxar
                </p>
                <p className="text-xs text-slate-400">
                  Silencia alertas 30 min antes da meta.
                </p>
              </div>
              <Switch
                checked={relaxMode}
                onCheckedChange={setRelaxMode}
              />
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <Sparkles size={16} className="text-slate-400" />
              <p className="text-sm font-semibold">Resumo rápido</p>
            </div>
            <div className="space-y-2 text-xs text-slate-500">
              <p>Meta ativa: {formatHours(goalHours)}</p>
              <p>Alarme: {alarmLabel.time}</p>
              <p>
                Última atualização:{' '}
                {activeGoal?.updatedAt ? formatDate(activeGoal.updatedAt) : '—'}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-8 rounded-[28px] bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-slate-900">
            Histórico de metas
          </h3>
          <p className="text-sm text-slate-500">
            Visualize o que já foi cadastrado e edite quando necessário.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <span>Criado</span>
            <span>Atualizado</span>
            <span>Meta</span>
            <span>Alarme</span>
            <span className="text-right">Ações</span>
          </div>
          <div className="divide-y divide-slate-100">
            {sortedGoals.length === 0 && (
              <div className="px-4 py-6 text-sm text-slate-500">
                Nenhuma meta cadastrada ainda.
              </div>
            )}
            {sortedGoals.map(goal => (
              <div
                key={goal.id}
                className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 text-sm text-slate-700"
              >
                <span>{formatDate(goal.createdAt)}</span>
                <span>{formatDate(goal.updatedAt)}</span>
                <span>{formatHours(goal.goalHours)}</span>
                <span>{formatTime(goal.alarmTime)}</span>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => void handleDelete(goal.id)}
                    className="flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600 hover:border-rose-300"
                  >
                    <Trash2 size={12} />
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
