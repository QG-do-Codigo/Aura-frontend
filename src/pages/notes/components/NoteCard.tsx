import { motion } from 'framer-motion'
import { Edit2, Trash2 } from 'lucide-react'

interface NoteCardProps {
  title: string
  content: string
  date: string
  color: string
  onEdit: () => void
  onDelete: () => void
}

export function NoteCard({
  title,
  content,
  date,
  color,
  onEdit,
  onDelete,
}: NoteCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300 }}
      style={{ backgroundColor: color }}
      className="relative min-w-0 rounded-2xl p-6 shadow-sm overflow-hidden group"
    >
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-white/70 text-slate-700 backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:bg-white hover:shadow-md"
          aria-label="Editar nota"
        >
          <Edit2 size={14} />
        </button>

        <button
          onClick={onDelete}
          className="grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-white/70 text-red-500 backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:bg-white hover:shadow-md"
          aria-label="Excluir nota"
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

      <div className="mt-6 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>{date}</span>
      </div>
    </motion.div>
  )
}
