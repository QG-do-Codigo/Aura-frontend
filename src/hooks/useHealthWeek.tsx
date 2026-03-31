import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import type { HealthWeekReminder } from '../pages/health/types'

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

function statusAfterConfirm(date: string) {
  const todayKey = toDateKey(new Date())
  const dateKey = toDateKeyFromISO(date)
  return dateKey === todayKey ? 'done' : 'late'
}

export function useHealthWeek() {
  const [weekItems, setWeekItems] = useState<HealthWeekReminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const token = localStorage.getItem('token')

  const fetchWeek = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await api.get<HealthWeekReminder[]>('/health/week', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setWeekItems(response.data ?? [])
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar semana de saúde:', err)
      setError('Não foi possível carregar sua semana de saúde.')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const confirmDay = useCallback(
    async (reminderId: string, date: string) => {
      const now = new Date().toISOString()
      const previous = weekItems

      setWeekItems(current =>
        current.map(item => {
          if (item.reminderId !== reminderId) return item
          return {
            ...item,
            days: item.days.map(day => {
              if (day.date !== date) return day
              return {
                ...day,
                status: statusAfterConfirm(day.date),
                completedAt: now,
              }
            }),
          }
        })
      )

      try {
        await api.post(
          '/health/confirm',
          { reminderId, date },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      } catch (err) {
        console.error('Erro ao confirmar dia:', err)
        setWeekItems(previous)
        throw err
      }
    },
    [token, weekItems]
  )

  useEffect(() => {
    void fetchWeek()
  }, [fetchWeek])

  const sortedWeekItems = useMemo(() => {
    return weekItems.map(item => ({
      ...item,
      days: [...item.days].sort((a, b) => a.date.localeCompare(b.date)),
    }))
  }, [weekItems])

  return {
    weekItems: sortedWeekItems,
    isLoading,
    error,
    fetchWeek,
    confirmDay,
  }
}
