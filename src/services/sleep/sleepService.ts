import api from '../api'
import type {
  CreateSleepPayload,
  SleepGoal,
  UpdateSleepPayload,
} from '../../pages/sleep/types'

const SLEEP_GOALS_ENDPOINT = '/sleep/goals'

export const sleepGoalsService = {
  create(payload: CreateSleepPayload) {
    return api.post<SleepGoal>(`${SLEEP_GOALS_ENDPOINT}/create`, payload)
  },

  list() {
    return api.get<SleepGoal[]>(`${SLEEP_GOALS_ENDPOINT}/list`)
  },

  update(id: string, payload: UpdateSleepPayload) {
    return api.patch<SleepGoal>(`${SLEEP_GOALS_ENDPOINT}/update/${id}`, payload)
  },

  delete(id: string) {
    return api.delete(`${SLEEP_GOALS_ENDPOINT}/delete/${id}`)
  },
}

// Backwards-compat: código legado ainda importa `sleepService`.
export const sleepService = sleepGoalsService
