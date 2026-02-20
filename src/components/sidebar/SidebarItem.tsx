import { motion } from 'framer-motion'
import { cn } from '../surface'

interface SidebarItemProps {
  icon: React.ElementType
  label: string
  isActive: boolean
  onClick: () => void
  color: string
  bg: string
}

export function SidebarItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  color,
  bg,
}: SidebarItemProps) {
  return (
    <button onClick={onClick} className="relative w-full text-left">
      {/*  ativo */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bg"
          className={cn('absolute inset-0 rounded-full', bg)}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        />
      )}

      {/* pill lateral */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-full bg-primary"
        />
      )}

      <div
        className={cn(
          'relative z-10 flex items-center gap-3 px-5 py-3 rounded-full transition-colors cursor-pointer',
          isActive
            ? cn(color, 'font-medium') // aplica text-indigo-500, text-blue-500 etc.
            : 'text-muted-foreground hover:text-primary'
        )}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </div>
    </button>
  )
}
