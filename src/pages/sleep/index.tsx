import { useEffect, useMemo, useState } from 'react'
import { Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import {
  sleepLogsService,
  type SleepFactor,
  type SleepLog,
  type SleepRange,
  type SleepStats,
} from '../../services/sleep/sleepLogsService'
import { extractBackendMessage } from '../../utils/extractBackendMessage'

export function SleepPage() {
  const SLEEP_GOAL = 8
  const RANGE: SleepRange = '7d'

  const factorOptions = useMemo(
    () => [
      { id: 'caffeine', label: '☕ Cafeína' },
      { id: 'exercise', label: '🏃 Exercício' },
      { id: 'stress', label: '😰 Estresse' },
      { id: 'screen', label: '📱 Tela tarde' },
      { id: 'alcohol', label: '🍷 Álcool' },
      { id: 'meditation', label: '🧘 Meditação' },
      { id: 'reading', label: '📖 Leitura' },
      { id: 'late_meal', label: '🍽️ Refeição tarde' },
    ],
    []
  )

  const qualityLabels = useMemo(
    () => ['Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'],
    []
  )

  const [logs, setLogs] = useState<SleepLog[]>([])
  const [stats, setStats] = useState<SleepStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [selectedLogDate, setSelectedLogDate] = useState<string | null>(null)
  const [hydratedForDate, setHydratedForDate] = useState<string | null>(null)
  const [bedtime, setBedtime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [quality, setQuality] = useState(4)
  const [hoverQuality, setHoverQuality] = useState<number | null>(null)
  const [factors, setFactors] = useState<SleepFactor[]>([])
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [formDirty, setFormDirty] = useState(false)

  function formatHours(value: number) {
    if (!Number.isFinite(value)) return '0.0'
    return (Math.round(value * 10) / 10).toFixed(1)
  }

  function normalizeTimeHHMM(value: string) {
    const trimmed = value.trim()
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed)
    if (!match) return null
    const hours = Number(match[1])
    const minutes = Number(match[2])
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
    if (hours < 0 || hours > 23) return null
    if (minutes < 0 || minutes > 59) return null
    return `${pad2(hours)}:${pad2(minutes)}`
  }

  function pad2(value: number) {
    return String(value).padStart(2, '0')
  }

  function formatYYYYMMDD(date: Date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
  }

  function addDays(date: Date, delta: number) {
    const next = new Date(date)
    next.setDate(next.getDate() + delta)
    return next
  }

  function formatDDMM(date: Date) {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  function weekdayShortFromDate(date: Date) {
    const raw = date.toLocaleDateString('pt-BR', { weekday: 'short' })
    const normalized = raw
      .replace('.', '')
      .replace(/-feira/i, '')
      .trim()
      .toLowerCase()
    const map: Record<string, string> = {
      seg: 'Seg',
      ter: 'Ter',
      qua: 'Qua',
      qui: 'Qui',
      sex: 'Sex',
      sab: 'Sáb',
      sáb: 'Sáb',
      dom: 'Dom',
    }
    return map[normalized] ?? normalized
  }

  function timeToMinutes(value: string) {
    const [h, m] = value.split(':')
    const hours = Number(h)
    const minutes = Number(m)
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0
    return Math.max(0, Math.min(23, hours)) * 60 + Math.max(0, Math.min(59, minutes))
  }

  function durationFromTimes(bed: string, wake: string) {
    const bedMin = timeToMinutes(bed)
    const wakeMin = timeToMinutes(wake)
    let diff = wakeMin - bedMin
    if (diff <= 0) diff += 24 * 60
    const hours = diff / 60
    return {
      hours,
      minutes: diff,
    }
  }

  function clampQuality(value: number) {
    if (!Number.isFinite(value)) return 1
    return Math.max(1, Math.min(5, Math.round(value)))
  }

  const tonight = useMemo(() => durationFromTimes(bedtime, wakeTime), [bedtime, wakeTime])
  const tonightHours = useMemo(
    () => Math.round(tonight.hours * 10) / 10,
    [tonight.hours]
  )

  async function load() {
    setLoading(true)
    try {
      const [listResponse, statsResponse] = await Promise.all([
        sleepLogsService.list(RANGE),
        sleepLogsService.stats(RANGE),
      ])
      let nextLogs = listResponse.data

      if (selectedLogDate) {
        try {
          const detail = await sleepLogsService.getByDate(selectedLogDate)
          nextLogs = nextLogs.map(item =>
            item.log_date === selectedLogDate ? detail.data : item
          )
        } catch {
          // ignore: day may not exist yet or backend might not support details
        }
      }

      setLogs(nextLogs)
      setStats(statsResponse.data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = extractBackendMessage(error.response?.data)
        toast.error(message ?? 'Erro ao carregar registros de sono')
      } else {
        toast.error('Erro ao carregar registros de sono')
      }
      setLogs([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLogDate])

  const windowDates = useMemo(() => {
    const today = new Date()
    const start = addDays(today, -6)
    return Array.from({ length: 7 }, (_, index) => addDays(start, index))
  }, [])

  const windowDateOptions = useMemo(() => {
    const todayValue = windowDates.length ? formatYYYYMMDD(windowDates[windowDates.length - 1]) : null
    return windowDates.map(date => {
      const value = formatYYYYMMDD(date)
      const labelBase = `${weekdayShortFromDate(date)} • ${formatDDMM(date)}`
      return {
        value,
        label: todayValue && value === todayValue ? `${labelBase} (Hoje)` : labelBase,
      }
    })
  }, [windowDates])

  useEffect(() => {
    if (selectedLogDate) return
    const todayValue = windowDates.length ? formatYYYYMMDD(windowDates[windowDates.length - 1]) : null
    if (todayValue) setSelectedLogDate(todayValue)
  }, [selectedLogDate, windowDates])

  const logsByDate = useMemo(() => {
    const map = new Map<string, SleepLog>()
    for (const log of logs) {
      map.set(log.log_date, log)
    }
    return map
  }, [logs])

  const selectedExistingLog = useMemo(() => {
    if (!selectedLogDate) return null
    return logsByDate.get(selectedLogDate) ?? null
  }, [logsByDate, selectedLogDate])

  const weekData = useMemo(() => {
    return windowDates.map(date => {
      const logDate = formatYYYYMMDD(date)
      const log = logsByDate.get(logDate)
      return {
        log_date: logDate,
        day: weekdayShortFromDate(date),
        has_log: !!log,
        hours: log?.duration_h ?? 0,
        quality: log?.quality ?? 0,
        bedtime: log?.bedtime ?? '—',
        wake: log?.wake_time ?? '—',
        factors: log?.factors ?? [],
        notes: log?.notes ?? '',
      }
    })
  }, [logsByDate, windowDates])

  const computedWeeklyAverage = useMemo(() => {
    const withValues = weekData.filter(item => item.hours > 0)
    const base = withValues.length ? withValues : weekData
    const total = base.reduce((acc, item) => acc + item.hours, 0)
    const value = base.length ? total / base.length : 0
    return Math.round(value * 10) / 10
  }, [weekData])

  const weeklyAverage =
    stats?.avg_hours !== undefined && stats?.avg_hours !== null && stats.avg_hours > 0
      ? stats.avg_hours
      : computedWeeklyAverage

  const computedBestNight = useMemo(() => {
    const candidates = weekData.filter(item => item.hours >= SLEEP_GOAL)
    if (candidates.length === 0) return null
    const best = [...candidates].sort((a, b) => b.hours - a.hours)[0]
    return best?.hours ?? null
  }, [SLEEP_GOAL, weekData])

  const bestNight = computedBestNight

  const goalAchievedCount = useMemo(
    () => weekData.filter(item => item.hours >= SLEEP_GOAL).length,
    [SLEEP_GOAL, weekData]
  )

  const streakDays = useMemo(() => {
    // Melhor sequência dentro da janela (7 dias)
    let current = 0
    let best = 0
    for (const item of weekData) {
      if (item.has_log && item.hours >= SLEEP_GOAL) {
        current += 1
        best = Math.max(best, current)
      } else {
        current = 0
      }
    }
    return best
  }, [SLEEP_GOAL, weekData])

  const barMax = useMemo(() => {
    const maxHours = Math.max(SLEEP_GOAL + 2, ...weekData.map(item => item.hours))
    return Math.max(1, maxHours)
  }, [weekData])

  const chartData = useMemo(
    () =>
      weekData.map(item => ({
        day: item.day,
        hours: item.hours,
      })),
    [weekData]
  )

  useEffect(() => {
    setSaved(false)
  }, [bedtime, wakeTime, quality, factors, notes])

  useEffect(() => {
    if (!selectedLogDate) return
    if (hydratedForDate === selectedLogDate && formDirty) return
    const log = logsByDate.get(selectedLogDate)
    const desiredBedtime = log?.bedtime ?? '23:00'
    const desiredWakeTime = log?.wake_time ?? '07:00'
    const desiredQuality = log ? clampQuality(log.quality) : 4
    const desiredFactors = (log?.factors ?? []) as SleepFactor[]
    const desiredNotes = log?.notes ?? ''

    const sameFactors =
      factors.length === desiredFactors.length &&
      factors.every((value, index) => value === desiredFactors[index])

    if (bedtime !== desiredBedtime) setBedtime(desiredBedtime)
    if (wakeTime !== desiredWakeTime) setWakeTime(desiredWakeTime)
    if (quality !== desiredQuality) setQuality(desiredQuality)
    if (!sameFactors) setFactors(desiredFactors)
    if (notes !== desiredNotes) setNotes(desiredNotes)
    setHydratedForDate(selectedLogDate)
    setFormDirty(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydratedForDate, logsByDate, selectedLogDate])

  function toggleFactor(id: SleepFactor) {
    setFormDirty(true)
    setFactors(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  async function handleSaveTonight() {
    if (saving) return

    if (!selectedLogDate) {
      toast.error('Selecione um dia para registrar.')
      return
    }

    const wasEditing = !!selectedExistingLog
    const normalizedBedtime = normalizeTimeHHMM(bedtime)
    const normalizedWakeTime = normalizeTimeHHMM(wakeTime)
    if (!normalizedBedtime || !normalizedWakeTime) {
      toast.error('Horários inválidos. Use o formato HH:MM (00:00–23:59).')
      return
    }

    setSaving(true)
    try {
      const payload = {
        log_date: selectedLogDate,
        bedtime: normalizedBedtime,
        wake_time: normalizedWakeTime,
        quality: clampQuality(quality) as 1 | 2 | 3 | 4 | 5,
        factors: factors.length ? factors : undefined,
        notes: notes.trim() ? notes.trim() : undefined,
      }

      // Ajuda a debugar validação do backend sem abrir o console.
      // eslint-disable-next-line no-console
      console.log('[sleep] upsert payload', payload)

      await sleepLogsService.upsert(payload)
      await load()
      setFormDirty(false)
      setSaved(true)
      toast.success(wasEditing ? 'Registro atualizado!' : 'Noite registrada!')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = extractBackendMessage(error.response?.data)
        toast.error(message ?? 'Erro ao registrar noite')
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Erro ao registrar noite')
      }
    } finally {
      setSaving(false)
    }
  }

  function SleepTooltip({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ value?: number }>
    label?: string
  }) {
    if (!active || !payload?.length) return null
    const value = payload[0]?.value
    if (value === undefined || value === null) return null
    return (
      <div className="rounded-2xl bg-white px-3 py-2 shadow-lg">
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}h</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
      {loading && (
        <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm ring-1 ring-slate-100">
          Carregando registros de sono...
        </div>
      )}
      {/* HERO */}
      <section className="rounded-[40px] bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
                <Moon size={18} className="text-violet-200" />
              </span>
              <h1 className="text-xl font-semibold tracking-tight">Controle de Sono</h1>
            </div>

            <p className="mt-4 text-3xl font-semibold tracking-tight">
              {formatHours(weeklyAverage)}h{' '}
              <span className="text-base font-medium text-white/70">média semanal</span>
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10">
                {goalAchievedCount}/7 meta atingida
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10">
                🔥 {streakDays} melhor sequência
              </span>
            </div>
          </div>

          <div className="hidden sm:block rounded-2xl bg-white/5 px-3 py-2 text-xs text-white/70 ring-1 ring-white/10">
            Meta: {SLEEP_GOAL}h
          </div>
        </div>

            <div className="mt-6 rounded-[28px] bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-end justify-between gap-2">
            {weekData.map(item => {
              const percent = Math.min(100, Math.max(6, (item.hours / barMax) * 100))
              const reached = item.hours >= SLEEP_GOAL
              return (
                <div key={item.log_date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative h-20 w-full overflow-hidden rounded-2xl bg-white/10">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${percent}%` }}
                      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
                      className={`absolute bottom-0 left-0 right-0 rounded-2xl ${
                        reached ? 'bg-violet-400' : 'bg-white/30'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-white/60">
                    {item.day}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-[24px] bg-violet-50 p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.22em] text-violet-500">Média</p>
          <p className="mt-2 text-2xl font-semibold text-violet-700">
            {formatHours(weeklyAverage)}h
          </p>
        </div>
        <div className="rounded-[24px] bg-emerald-50 p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-600">
            Melhor noite (≥ {SLEEP_GOAL}h)
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {bestNight === null ? '—' : `${formatHours(bestNight)}h`}
          </p>
        </div>
        <div className="rounded-[24px] bg-indigo-50 p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.22em] text-indigo-600">Meta por noite</p>
          <p className="mt-2 text-2xl font-semibold text-indigo-900">{SLEEP_GOAL}h</p>
        </div>
      </section>

      {/* REGISTER */}
      <section className="mt-6 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Registrar sono</h2>
            <p className="text-sm text-slate-500">
              Somente nos últimos 7 dias (incluindo hoje). Um dia = 1 registro (salvar edita).
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
              tonightHours >= SLEEP_GOAL
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                : 'bg-amber-50 text-amber-800 ring-amber-200'
            }`}
          >
            {tonightHours}h dormidas
          </span>
        </div>

        <div className="mt-5">
          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">📅 Dia</span>
            <select
              value={selectedLogDate ?? ''}
              onChange={event => {
                setSaved(false)
                setFormDirty(false)
                setSelectedLogDate(event.target.value)
              }}
              className="h-11 w-full rounded-2xl bg-slate-50 px-4 text-slate-700 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-200"
            >
              {windowDateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">🌙 Dormi às</span>
            <input
              type="time"
              step={60}
              value={bedtime}
              onChange={event => {
                setFormDirty(true)
                setBedtime(event.target.value)
              }}
              onBlur={event => {
                const normalized = normalizeTimeHHMM(event.target.value)
                if (normalized) setBedtime(normalized)
              }}
              className="h-11 w-full rounded-2xl bg-indigo-50 px-4 text-indigo-900 ring-1 ring-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">☀️ Acordei às</span>
            <input
              type="time"
              step={60}
              value={wakeTime}
              onChange={event => {
                setFormDirty(true)
                setWakeTime(event.target.value)
              }}
              onBlur={event => {
                const normalized = normalizeTimeHHMM(event.target.value)
                if (normalized) setWakeTime(normalized)
              }}
              className="h-11 w-full rounded-2xl bg-amber-50 px-4 text-amber-900 ring-1 ring-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1
              const active = (hoverQuality ?? quality) >= value
              return (
                <button
                  key={value}
                  type="button"
                  onMouseEnter={() => setHoverQuality(value)}
                  onMouseLeave={() => setHoverQuality(null)}
                  onClick={() => {
                    setFormDirty(true)
                    setQuality(value)
                  }}
                  className={`h-10 w-10 rounded-2xl bg-slate-50 ring-1 ring-slate-100 transition ${
                    active ? 'opacity-100' : 'opacity-30 grayscale'
                  }`}
                  aria-label={`Qualidade ${value}`}
                >
                  <span className="text-lg">🌙</span>
                </button>
              )
            })}
          </div>
          <span className="text-sm font-medium text-slate-700">
            {qualityLabels[(hoverQuality ?? quality) - 1] ?? '—'}
          </span>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-slate-500">Fatores</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {factorOptions.map(option => {
              const selected = factors.includes(option.id as SleepFactor)
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleFactor(option.id as SleepFactor)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ring-1 ${
                    selected
                      ? 'bg-violet-100 text-violet-700 ring-violet-200'
                      : 'bg-slate-50 text-slate-500 ring-slate-100 hover:bg-slate-100'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-5">
          <label className="space-y-2">
            <span className="text-xs font-medium text-slate-500">Observações (opcional)</span>
            <textarea
              value={notes}
              onChange={event => {
                setFormDirty(true)
                setNotes(event.target.value)
              }}
              placeholder="Ex: acordei durante a noite / pesadelo / quarto frio..."
              className="min-h-24 w-full rounded-[16px] bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleSaveTonight}
          disabled={saving}
          className={`mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
            saved ? 'bg-emerald-500 hover:bg-emerald-500' : 'bg-indigo-900 hover:bg-indigo-800'
          } disabled:cursor-not-allowed disabled:opacity-70`}
        >
          {saving
            ? 'Salvando...'
            : saved
              ? '✓ Salvo!'
              : selectedExistingLog
                ? 'Atualizar'
                : 'Salvar'}
        </button>
      </section>

      {/* WEEKLY CHART */}
      <section className="mt-6 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Gráfico semanal</h2>
            <p className="text-sm text-slate-500">Meta: {SLEEP_GOAL}h</p>
          </div>
        </div>

        <div className="mt-4 h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2ff" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                width={30}
                domain={[0, Math.max(10, Math.ceil(barMax))]}
              />
              <Tooltip content={<SleepTooltip />} />
              <ReferenceLine
                y={SLEEP_GOAL}
                stroke="#6366f1"
                strokeDasharray="6 6"
                ifOverflow="extendDomain"
                label={{
                  value: `Meta: ${SLEEP_GOAL}h`,
                  position: 'insideTopRight',
                  fill: '#4338ca',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#sleepGradient)"
                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#7c3aed', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* HISTORY */}
      <section className="mt-6 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Histórico recente</h2>
          <p className="text-sm text-slate-500">Mais recente primeiro.</p>
        </div>

        <div className="mt-4 space-y-2">
          {[...weekData].reverse().map((item, index) => {
            const achieved = item.hours >= SLEEP_GOAL
            return (
              <div
                key={`${item.day}-${index}`}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
              >
                <span className="text-lg">{achieved ? '🌙' : '😴'}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.day}{' '}
                    <span className="text-xs font-medium text-slate-500">
                      • {item.log_date.split('-').reverse().join('/')}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.bedtime} → {item.wake}
                  </p>
                  {!!item.factors?.length && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.factors.map(factorId => {
                        const label = factorOptions.find(option => option.id === factorId)?.label
                        return (
                          <span
                            key={factorId}
                            className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200"
                          >
                            {label ?? factorId}
                          </span>
                        )
                      })}
                    </div>
                  )}
                  {!!item.notes?.trim() && (
                    <p className="mt-1 truncate text-xs text-slate-500">{item.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatHours(item.hours)}h
                  </p>
                  <div className="mt-1 flex justify-end gap-1">
                    {Array.from({ length: 5 }).map((_, moonIndex) => {
                      const moonValue = moonIndex + 1
                      const on = item.quality >= moonValue
                      return (
                        <span
                          key={moonValue}
                          className={`text-[11px] ${on ? 'opacity-100' : 'opacity-30 grayscale'}`}
                        >
                          🌙
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
