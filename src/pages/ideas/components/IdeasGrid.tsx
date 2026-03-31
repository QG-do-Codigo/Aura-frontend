import { IdeaCard } from './IdeaCard'
import type { Idea } from '../types'

interface IdeasGridProps {
  ideas: Idea[]
  onEdit: (ideaId: string) => void
  onDelete: (ideaId: string) => void
}

export function IdeasGrid({ ideas, onEdit, onDelete }: IdeasGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {ideas.map(idea => (
        <IdeaCard
          key={idea.id}
          title={idea.title}
          content={idea.content}
          date={idea.date}
          color={idea.color}
          category={idea.category}
          tags={idea.tags}
          icon={idea.icon}
          isFavorite={idea.isFavorite}
          onEdit={() => onEdit(idea.id)}
          onDelete={() => onDelete(idea.id)}
        />
      ))}
    </div>
  )
}
