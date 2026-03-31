export type SleepGoal = {
  id: string
  userId: string
  goalHours: number
  averageHours?: number | null
  bedtimeRoutine?: string | null
  alarmTime?: string | null
  createdAt: string
  updatedAt: string
}

export type CreateSleepPayload = {
  goalHours: number
  averageHours?: number
  bedtimeRoutine?: string
  alarmTime?: string
}

export type UpdateSleepPayload = {
  goalHours?: number
  averageHours?: number
  bedtimeRoutine?: string
  alarmTime?: string
}
