import { useEffect, useMemo, useState } from 'react'
import type {
  CreateSleepPayload,
  SleepGoal,
  UpdateSleepPayload,
} from '../pages/sleep/types'
import { sleepService } from '../services/sleep/sleepService'

type SleepGoalResponse = SleepGoal & { _id?: string }

function normalizeGoal(goal: SleepGoalResponse): SleepGoal | null {
  const id = goal.id ?? goal._id ?? ''
  if (!id) return null
  return {
    ...goal,
    id,
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
        setGoals(
          response.data
            .map(item => normalizeGoal(item))
            .filter((item): item is SleepGoal => Boolean(item))
        )
        const latest = pickLatest(
          response.data
            .map(item => normalizeGoal(item))
            .filter((item): item is SleepGoal => Boolean(item))
        )
        setPrimaryGoalId(latest?.id ?? null)
      } catch {
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
      const mapped = normalizeGoal(response.data)
      if (!mapped) return activeGoal ?? null
      setGoals(prev =>
        prev.map(item => (item.id === targetId ? mapped : item))
      )
      return mapped
    }

    const response = await sleepService.create(payload)
    const mapped = normalizeGoal(response.data)
    if (!mapped) return null
    setGoals(prev => [mapped, ...prev])
    setPrimaryGoalId(mapped.id)
    return mapped
  }

  async function updateGoal(id: string, payload: UpdateSleepPayload) {
    if (!id) return null
    const response = await sleepService.update(id, payload)
    const mapped = normalizeGoal(response.data)
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
