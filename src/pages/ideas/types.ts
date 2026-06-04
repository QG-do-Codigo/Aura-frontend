export interface Idea {
  id: string
  title: string
  content: string
  categoryId: string
}

export interface IdeaCategory {
  id: string
  name: string
}

export interface IdeaFormData {
  title: string
  content: string
  categoryId: string
}
