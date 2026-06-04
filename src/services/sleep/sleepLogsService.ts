import api from '../api'
import type { AxiosResponse } from 'axios'

const MAX_LOG_AGE_DAYS = 6 // last 7 days including today (0..6)

export const SLEEP_FACTORS = [
  'caffeine',
  'exercise',
  'stress',
  'screen',
  'alcohol',
  'meditation',
  'reading',
  'late_meal',
] as const

export type SleepFactor = (typeof SLEEP_FACTORS)[number]

const SLEEP_FACTOR_SET = new Set<string>(SLEEP_FACTORS)

export type UpsertSleepLogPayload = {
  log_date: string // YYYY-MM-DD
  bedtime: string // HH:MM
  wake_time: string // HH:MM
  quality: 1 | 2 | 3 | 4 | 5
  factors?: SleepFactor[]
  notes?: string
}

function parseYYYYMMDD(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null

  // Validate date actually exists (ex: 2026-02-31).
  const probe = new Date(year, month - 1, day)
  if (
    probe.getFullYear() !== year ||
    probe.getMonth() !== month - 1 ||
    probe.getDate() !== day
  ) {
    return null
  }
  return { year, month, day }
}

function assertLogDateWithinLast7Days(log_date: string) {
  const parsed = parseYYYYMMDD(log_date)
  if (!parsed) {
    throw new Error('Data inválida. Use o formato AAAA-MM-DD.')
  }

  const today = new Date()
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const targetUTC = Date.UTC(parsed.year, parsed.month - 1, parsed.day)
  const diffDays = Math.floor((todayUTC - targetUTC) / 86_400_000)

  if (diffDays < 0) {
    throw new Error('Não é possível registrar sono em datas futuras.')
  }
  if (diffDays > MAX_LOG_AGE_DAYS) {
    throw new Error('Você só pode registrar sono nos últimos 7 dias (incluindo hoje).')
  }
}

function sanitizeHHMM(value: string) {
  const trimmed = value.trim()
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed)
  if (!match) return trimmed
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return trimmed
  const safeHours = Math.max(0, Math.min(23, hours))
  const safeMinutes = Math.max(0, Math.min(59, minutes))
  return `${String(safeHours).padStart(2, '0')}:${String(safeMinutes).padStart(2, '0')}`
}

type SleepLogWire = {
  id?: string
  user_id?: string
  log_date: string
  bedtime: string
  wake_time: string
  duration_h: string // backend: ex "8.25"
  quality: number
  factors?: SleepFactor[]
  notes?: string | null
  created_at?: string
}

export type SleepLog = Omit<SleepLogWire, 'duration_h' | 'factors'> & {
  duration_h: number
  factors: SleepFactor[]
}

export type SleepStats = {
  avg_hours: number
  best_night: { date: string; hours: number } | null
  goal_met_count: number
  streak: number
  total_logs: number
}

const SLEEP_LOGS_ENDPOINT = '/sleep'

function parseTimeToMinutes(value: string) {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  if (hours < 0 || hours > 23) return null
  if (minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

function durationHoursFromTimes(bedtime: string, wake_time: string) {
  const bedMin = parseTimeToMinutes(bedtime)
  const wakeMin = parseTimeToMinutes(wake_time)
  if (bedMin === null || wakeMin === null) return null
  let diff = wakeMin - bedMin
  if (diff <= 0) diff += 24 * 60
  const hours = diff / 60
  return Math.round(hours * 100) / 100
}

function normalizeNotes(value: unknown) {
  if (typeof value === 'string') return value
  return ''
}

function normalizeFactors(value: unknown): SleepFactor[] {
  const candidates: string[] = []

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') candidates.push(item)
    }
  } else if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed) {
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (typeof item === 'string') candidates.push(item)
            }
          }
        } catch {
          // fallthrough
        }
      }
      if (candidates.length === 0) {
        candidates.push(...trimmed.split(/[,;]\s*|\s+/).filter(Boolean))
      }
    }
  }

  return candidates
    .map(item => item.trim())
    .filter(item => SLEEP_FACTOR_SET.has(item)) as SleepFactor[]
}

function mapLog(log: SleepLogWire): SleepLog {
  const loose = log as unknown as Record<string, unknown>
  const normalizedBedtime = sanitizeHHMM(log.bedtime)
  const normalizedWakeTime = sanitizeHHMM(log.wake_time)

  const rawDuration = Number(log.duration_h)
  const computedDuration =
    !Number.isFinite(rawDuration) || rawDuration <= 0
      ? durationHoursFromTimes(normalizedBedtime, normalizedWakeTime)
      : null

  return {
    ...log,
    bedtime: normalizedBedtime,
    wake_time: normalizedWakeTime,
    duration_h:
      computedDuration !== null ? computedDuration : Number.isFinite(rawDuration) ? rawDuration : 0,
    factors: normalizeFactors(loose.factors),
    notes: normalizeNotes(loose.notes ?? loose.observation),
  }
}

export type SleepRange = '7d' | '30d' | '90d'

function pickNewestByCreatedAt(current: SleepLog, candidate: SleepLog) {
  const currentTs = current.created_at ? Date.parse(current.created_at) : Number.NaN
  const candidateTs = candidate.created_at ? Date.parse(candidate.created_at) : Number.NaN
  if (Number.isFinite(currentTs) && Number.isFinite(candidateTs)) {
    return candidateTs >= currentTs ? candidate : current
  }
  if (Number.isFinite(candidateTs) && !Number.isFinite(currentTs)) return candidate
  return candidate
}

export const sleepLogsService = {
  async upsert(payload: UpsertSleepLogPayload) {
    assertLogDateWithinLast7Days(payload.log_date)
    const response = await api.post<SleepLogWire>(SLEEP_LOGS_ENDPOINT, {
      ...payload,
      bedtime: sanitizeHHMM(payload.bedtime),
      wake_time: sanitizeHHMM(payload.wake_time),
    })
    return {
      ...response,
      data: mapLog(response.data),
    } as AxiosResponse<SleepLog>
  },

  async list(range: SleepRange = '7d') {
    const response = await api.get<SleepLogWire[]>(SLEEP_LOGS_ENDPOINT, {
      params: { range },
    })
    const mapped = response.data.map(mapLog)
    const byDate = new Map<string, SleepLog>()
    for (const log of mapped) {
      const existing = byDate.get(log.log_date)
      byDate.set(log.log_date, existing ? pickNewestByCreatedAt(existing, log) : log)
    }
    return {
      ...response,
      data: [...byDate.values()],
    } as AxiosResponse<SleepLog[]>
  },

  stats(range: SleepRange = '7d') {
    return api.get<SleepStats>(`${SLEEP_LOGS_ENDPOINT}/stats`, { params: { range } })
  },

  async getByDate(log_date: string) {
    const response = await api.get<SleepLogWire>(`${SLEEP_LOGS_ENDPOINT}/${log_date}`)
    return {
      ...response,
      data: mapLog(response.data),
    } as AxiosResponse<SleepLog>
  },

  deleteByDate(log_date: string) {
    return api.delete<{ message: string }>(`${SLEEP_LOGS_ENDPOINT}/${log_date}`)
  },
}
