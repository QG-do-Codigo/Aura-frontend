import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Edit2, Star, Trash2 } from 'lucide-react'

interface IdeaCardProps {
  title: string
  content: string
  date: string
  color: string
  category: string
  tags: string[]
  icon: LucideIcon
  isFavorite?: boolean
  onEdit: () => void
  onDelete: () => void
}

export function IdeaCard({
  title,
  content,
  date,
  color,
  category,
  tags,
  icon: Icon,
  isFavorite = false,
  onEdit,
  onDelete,
}: IdeaCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300 }}
      style={{ backgroundColor: color }}
      className="relative min-w-0 rounded-2xl p-6 shadow-sm overflow-hidden group"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/80 text-slate-700 shadow-sm">
          <Icon size={18} />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {category}
        </p>
        <button
          type="button"
          className={`ml-auto grid h-8 w-8 place-items-center rounded-full bg-white/70 transition ${
            isFavorite ? 'text-amber-500' : 'text-slate-300'
          }`}
          aria-label="Favoritar ideia"
        >
          <Star size={14} className={isFavorite ? 'fill-amber-400' : ''} />
        </button>
      </div>

      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-white/70 text-slate-700 backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:bg-white hover:shadow-md"
          aria-label="Editar ideia"
        >
          <Edit2 size={14} />
        </button>

        <button
          onClick={onDelete}
          className="grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-white/70 text-red-500 backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:bg-white hover:shadow-md"
          aria-label="Excluir ideia"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <h4 className="mb-3 text-lg font-black text-slate-800 break-words [overflow-wrap:anywhere]">
        {title}
      </h4>

      <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
        {content}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>{date}</span>
      </div>
    </motion.div>
  )
}
