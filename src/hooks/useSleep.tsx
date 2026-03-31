import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import type {
  CreateSleepPayload,
  SleepGoal,
  UpdateSleepPayload,
} from '../pages/sleep/types'
import { sleepService } from '../services/sleep/sleepService'
import { ToastAlert } from '../utils/toastAlert'

type SleepGoalResponse = SleepGoal & { _id?: string }

type SleepGoalResponseList =
  | SleepGoalResponse[]
  | { data?: SleepGoalResponse[] }
  | { goals?: SleepGoalResponse[] }
  | { sleepGoals?: SleepGoalResponse[] }

type SleepGoalResponseEnvelope =
  | SleepGoalResponse
  | { data?: SleepGoalResponse }
  | { goal?: SleepGoalResponse }

function unwrapSleepList(data: SleepGoalResponseList): SleepGoalResponse[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    if ('data' in data && Array.isArray(data.data)) return data.data
    if ('goals' in data && Array.isArray(data.goals)) return data.goals
    if ('sleepGoals' in data && Array.isArray(data.sleepGoals)) return data.sleepGoals
  }
  return []
}

function unwrapSleepEnvelope(
  data: SleepGoalResponseEnvelope
): Partial<SleepGoalResponse> {
  if (data && typeof data === 'object') {
    if ('data' in data && data.data) return data.data
    if ('goal' in data && data.goal) return data.goal
  }
  return data as SleepGoalResponse
}

function normalizeGoal(goal: Partial<SleepGoalResponse> & Record<string, any>): SleepGoal | null {
  const id = goal.id ?? goal._id ?? ''
  if (!id) return null
  return {
    id,
    userId: goal.userId ?? goal.user_id ?? '',
    goalHours: goal.goalHours ?? goal.goal_hours ?? 0,
    averageHours:
      goal.averageHours ??
      goal.average_hours ??
      null,
    bedtimeRoutine:
      goal.bedtimeRoutine ??
      goal.bedtime_routine ??
      null,
    alarmTime: goal.alarmTime ?? goal.alarm_time ?? null,
    createdAt: goal.createdAt ?? goal.created_at ?? '',
    updatedAt: goal.updatedAt ?? goal.updated_at ?? '',
  }
}

function pickLatest(goals: SleepGoal[]) {
  if (!goals.length) return null
  return [...goals].sort((a, b) => {
    const aTime = new Date(a.updatedAt ?? a.createdAt).getTime()
    const bTime = new Date(b.updatedAt ?? b.createdAt).getTime()
    return bTime - aTime
  })[0]
}

export function useSleep() {
  const [goals, setGoals] = useState<SleepGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [primaryGoalId, setPrimaryGoalId] = useState<string | null>(null)

  const activeGoal = useMemo(() => pickLatest(goals), [goals])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const response = await sleepService.list()
        const list = unwrapSleepList(response.data)
        const mapped = list
          .map(item => normalizeGoal(item))
          .filter((item): item is SleepGoal => Boolean(item))
        setGoals(mapped)
        const latest = pickLatest(mapped)
        setPrimaryGoalId(latest?.id ?? null)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = (error.response?.data as { message?: string })?.message
          ToastAlert(message ?? 'Erro ao carregar metas de sono', 'error')
        } else {
          ToastAlert('Erro ao carregar metas de sono', 'error')
        }
        setGoals([])
        setPrimaryGoalId(null)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  async function upsertGoal(payload: CreateSleepPayload) {
    const targetId = primaryGoalId ?? activeGoal?.id ?? null
    if (targetId) {
      const response = await sleepService.update(targetId, payload)
      const mapped = normalizeGoal(unwrapSleepEnvelope(response.data))
      if (!mapped) return activeGoal ?? null
      setGoals(prev =>
        prev.map(item => (item.id === targetId ? mapped : item))
      )
      return mapped
    }

    const response = await sleepService.create(payload)
    const mapped = normalizeGoal(unwrapSleepEnvelope(response.data))
    if (!mapped) return null
    setGoals(prev => [mapped, ...prev])
    setPrimaryGoalId(mapped.id)
    return mapped
  }

  async function updateGoal(id: string, payload: UpdateSleepPayload) {
    if (!id) return null
    const response = await sleepService.update(id, payload)
    const mapped = normalizeGoal(unwrapSleepEnvelope(response.data))
    if (!mapped) return null
    setGoals(prev => prev.map(item => (item.id === id ? mapped : item)))
    setPrimaryGoalId(mapped.id)
    return mapped
  }

  async function deleteGoal(id: string) {
    await sleepService.delete(id)
    setGoals(prev => prev.filter(item => item.id !== id))
    setPrimaryGoalId(prev => (prev === id ? null : prev))
  }

  return {
    goals,
    activeGoal,
    loading,
    upsertGoal,
    updateGoal,
    deleteGoal,
  }
}
