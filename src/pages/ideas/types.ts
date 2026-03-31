import type { LucideIcon } from 'lucide-react'

export interface Idea {
  id: string
  title: string
  content: string
  date: string
  color: string
  category: string
  tags: string[]
  icon: LucideIcon
  isFavorite?: boolean
}
