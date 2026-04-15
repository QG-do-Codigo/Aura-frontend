import { motion } from 'framer-motion'
import { Edit2, Trash2 } from 'lucide-react'
import { getIdeaCategoryMeta } from '../categoryMeta'

interface IdeaCardProps {
  title: string
  content: string
  categoryName?: string
  onEdit: () => void
  onDelete: () => void
}

export function IdeaCard({
  title,
  content,
  categoryName,
  onEdit,
  onDelete,
}: IdeaCardProps) {
  const { Icon, iconClassName, badgeClassName } = getIdeaCategoryMeta(categoryName)

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="relative min-w-0 rounded-2xl bg-amber-50/60 p-6 shadow-sm overflow-hidden group border border-amber-100"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm">
          <Icon size={18} className={iconClassName} />
        </div>
        {categoryName ? (
          <p
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] shadow-sm ${badgeClassName}`}
          >
            {categoryName}
          </p>
        ) : (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Sem categoria
          </p>
        )}
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
    </motion.div>
  )
}
