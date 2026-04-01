export type HealthType = 'MEDICINE' | 'WORKOUT'

export interface HealthItem {
  id: string
  title: string
  description: string
  type: HealthType
  time: string
  repeatDaily: boolean
  done?: boolean
  logs?: HealthLog[]
}

export interface HealthLog {
  id: string
  reminderId: string
  userId: string
  date: string
  completed: boolean
  completedAt: string | null
  createdAt?: string | null
}

export interface CreateHealthInput {
  title: string
  description: string
  type: HealthType
  time: string
  repeatDaily: boolean
}

export type HealthWeekStatus = 'pending' | 'done' | 'late' | 'missed'

export interface HealthWeekDay {
  date: string
  status: HealthWeekStatus
  completedAt?: string | null
}

export interface HealthWeekReminder {
  id?: string
  reminderId: string
  title: string
  days: HealthWeekDay[]
  type?: HealthType
  time?: string
  repeatDaily?: boolean
}
