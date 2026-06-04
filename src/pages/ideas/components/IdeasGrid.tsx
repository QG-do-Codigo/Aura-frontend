import { IdeaCard } from './IdeaCard'
import type { Idea } from '../types'

interface IdeasGridProps {
  ideas: Idea[]
  categoriesById?: Record<string, string>
  onEdit: (ideaId: string) => void
  onDelete: (ideaId: string) => void
}

export function IdeasGrid({
  ideas,
  categoriesById,
  onEdit,
  onDelete,
}: IdeasGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {ideas.map(idea => (
        <IdeaCard
          key={idea.id}
          title={idea.title}
          content={idea.content}
          categoryName={categoriesById?.[idea.categoryId]}
          onEdit={() => onEdit(idea.id)}
          onDelete={() => onDelete(idea.id)}
        />
      ))}
    </div>
  )
}
