import api from '../api'
import type {
  CreateSleepPayload,
  SleepGoal,
  UpdateSleepPayload,
} from '../../pages/sleep/types'

const SLEEP_ENDPOINT = '/sleep'

export const sleepService = {
  create(payload: CreateSleepPayload) {
    return api.post<SleepGoal>(`${SLEEP_ENDPOINT}/create`, payload)
  },

  list() {
    return api.get<SleepGoal[]>(`${SLEEP_ENDPOINT}/list`)
  },

  update(id: string, payload: UpdateSleepPayload) {
    return api.patch<SleepGoal>(`${SLEEP_ENDPOINT}/update/${id}`, payload)
  },

  delete(id: string) {
    return api.delete(`${SLEEP_ENDPOINT}/delete/${id}`)
  },
}
