import { useEffect, useMemo, useState } from 'react'
import { Moon, AlarmClock, Sparkles } from 'lucide-react'
import { Switch } from '../../components/UI/switch'
import { useSleep } from '../../hooks/useSleep'
import { ToastAlert } from '../../utils/toastAlert'

type SleepEntry = {
  day: string
  label: string
  value: string
}

const WEEK_TEMPLATE: SleepEntry[] = [
  { day: 'mon', label: 'Seg', value: '7.2' },
  { day: 'tue', label: 'Ter', value: '6.8' },
  { day: 'wed', label: 'Qua', value: '7.5' },
  { day: 'thu', label: 'Qui', value: '6.9' },
  { day: 'fri', label: 'Sex', value: '7.8' },
  { day: 'sat', label: 'Sáb', value: '8.1' },
  { day: 'sun', label: 'Dom', value: '7.4' },
]

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function buildPath(values: number[]) {
  const min = 4
  const max = 9
  const width = 100
  const height = 40
  const step = width / (values.length - 1)

  const points = values.map((value, index) => {
    const normalized = (clamp(value, min, max) - min) / (max - min)
    const x = index * step
    const y = height - normalized * 28 - 6
    return { x, y }
  })

  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
    .join(' ')

  const area = `${line} L ${width},${height} L 0,${height} Z`

  return { line, area }
}

export function SleepPage() {
  const { activeGoal, loading, upsertGoal } = useSleep()
  const [entries, setEntries] = useState<SleepEntry[]>(WEEK_TEMPLATE)
  const [relaxMode, setRelaxMode] = useState(true)
  const [goalHours, setGoalHours] = useState(7.5)
  const [alarmHour, setAlarmHour] = useState('')
  const [alarmMinute, setAlarmMinute] = useState('')
  const [bedtimeRoutine, setBedtimeRoutine] = useState('')
  const [saving, setSaving] = useState(false)

  const values = useMemo(
    () =>
      entries.map(entry => {
        const parsed = Number(entry.value)
        return Number.isFinite(parsed) ? parsed : 0
      }),
    [entries]
  )

  const average =
    values.reduce((total, value) => total + value, 0) / values.length
  const bestValue = Math.max(...values)
  const bestIndex = values.findIndex(value => value === bestValue)
  const bestDay = entries[bestIndex]?.label ?? '-'

  const { line, area } = useMemo(() => buildPath(values), [values])

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
    if (!activeGoal) return
    setGoalHours(activeGoal.goalHours ?? 7.5)
    setBedtimeRoutine(activeGoal.bedtimeRoutine ?? '')
    if (activeGoal.alarmTime) {
      const date = new Date(activeGoal.alarmTime)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      setAlarmHour(hours)
      setAlarmMinute(minutes)
    }
  }, [activeGoal])

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

  function handleValueChange(day: string, value: string) {
    setEntries(prev =>
      prev.map(entry =>
        entry.day === day ? { ...entry, value } : entry
      )
    )
  }

  function handleValueBlur(day: string, value: string) {
    const normalized = normalizeHourInput(value)
    if (!normalized) return
    setEntries(prev =>
      prev.map(entry =>
        entry.day === day ? { ...entry, value: normalized } : entry
      )
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      const saved = await upsertGoal({
        goalHours: clampHours(goalHours),
        averageHours: Number(average.toFixed(1)),
        bedtimeRoutine: bedtimeRoutine.trim() || undefined,
        alarmTime: buildAlarmIso(alarmHour, alarmMinute),
      })
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
              <h2 className="text-lg font-semibold">Seu sono na semana</h2>
              <p className="text-sm text-slate-300">
                Média de {average.toFixed(1)}h e pico em {bestDay}.
              </p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
              Últimos 7 dias
            </span>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 p-4">
            <svg viewBox="0 0 100 40" className="h-32 w-full">
              <defs>
                <linearGradient id="sleepFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8FB3FF" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#sleepFill)" />
              <path
                d={line}
                fill="none"
                stroke="#C7D2FE"
                strokeWidth="1.5"
              />
            </svg>
            <div className="mt-2 grid grid-cols-7 gap-2 text-center text-[10px] text-slate-400">
              {entries.map(entry => (
                <span key={entry.day}>{entry.label}</span>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs text-slate-300">Média semanal</p>
              <p className="text-lg font-semibold">{formatHours(average)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs text-slate-300">Melhor noite</p>
              <p className="text-lg font-semibold">
                {bestDay} · {formatHours(bestValue)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs text-slate-300">Meta semanal</p>
              <p className="text-lg font-semibold">{formatHours(goalHours)}</p>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Próximo alarme
                </p>
                <p className="text-3xl font-semibold text-slate-900">
                  {alarmLabel.time}
                </p>
                <p className="text-xs text-slate-400">{alarmLabel.day}</p>
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
                {saving ? 'Salvando...' : 'Salvar rotina'}
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
              <p>Evite telas 40 minutos antes de dormir.</p>
              <p>Hora ideal para deitar: 23:00.</p>
              <p>2 noites abaixo da meta nesta semana.</p>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-8 rounded-[28px] bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-slate-900">
            Registre sua semana
          </h3>
          <p className="text-sm text-slate-500">
            Digite as horas de sono por dia. O gráfico atualiza automaticamente.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {entries.map(entry => (
            <div
              key={entry.day}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {entry.label}
                </p>
                <p className="text-xs text-slate-400">Horas dormidas</p>
              </div>
              <input
                type="number"
                min={0}
                step={0.1}
                value={entry.value}
                onChange={event => handleValueChange(entry.day, event.target.value)}
                onBlur={event => handleValueBlur(entry.day, event.target.value)}
                className="w-20 rounded-xl border border-slate-200 bg-white px-2 py-1 text-right text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Média atual: <span className="font-semibold">{formatHours(average)}</span>
          </p>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving ? 'Salvando...' : 'Salvar semana'}
          </button>
        </div>
      </section>
    </div>
  )
}
