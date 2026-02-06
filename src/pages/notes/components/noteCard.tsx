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
      className="relative rounded-2xl p-6 shadow-sm overflow-hidden group"
    >
      {/* AÇÕES */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg bg-white/60 hover:bg-white transition"
        >
          <Edit2 size={14} />
        </button>

        <button
          onClick={onDelete}
          className="p-2 rounded-lg bg-white/60 hover:bg-red-50 text-red-500 transition"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <h4 className="font-black text-lg mb-3 text-slate-800">{title}</h4>

      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
        {content}
      </p>

      <div className="mt-6 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>{date}</span>
      </div>
    </motion.div>
  )
}
