import { motion } from "framer-motion";
import { cn } from "../surface";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  color: string;
  bg: string;
  indicator: string;
  id: string;
}

export function SidebarItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  color,
  bg,
  indicator,
  id,
}: SidebarItemProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={cn(
        "w-full flex text-sm items-center gap-4 px-4 py-3.5 rounded-[20px] cursor-pointer transition-all duration-300 group relative overflow-hidden",
        isActive
          ? `${bg} ${color} font-black shadow-sm`
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
      )}
    >
      {/* fundo ativo */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bg"
          className={cn("absolute inset-0 rounded-[20px]", bg)}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
        />
      )}

      {/* indicador lateral */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className={cn("absolute left-0 w-1.5 h-6 rounded-r-full", indicator)}
        />
      )}

      <div
        className={cn(
          "relative z-10 flex items-center gap-2",
          isActive
            ? cn(color, "font-semibold")
            : "text-muted-foreground hover:text-primary"
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5 transition-transform group-hover:scale-110",
            isActive ? color : "text-slate-300"
          )}
        />
        <span className="text-sm tracking-tight">{label}</span>
      </div>
    </button>
  );
}
