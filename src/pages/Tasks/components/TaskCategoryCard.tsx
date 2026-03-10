import { motion } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import type { Task } from "../types/task.types";

interface Props {
  category: string;
  tasks: Task[];
  onClick: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export const TaskCategoryCard = ({
  category,
  tasks,
  onClick,
  onEdit,
  onDelete,
}: Props) => {
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const progress = total === 0 ? 0 : (completed / total) * 100;

  const colorClass = tasks[0]?.color || "bg-gray-200";

  const firstTask = tasks[0];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`${colorClass} relative rounded-2xl p-6 shadow-sm overflow-hidden group cursor-pointer`}
    >
      {tasks.length > 0 && (
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(firstTask);
            }}
            className="p-2 rounded-lg bg-white/70 hover:bg-white text-gray-700 transition"
            title="Editar tarefa"
          >
            <Edit2 size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(firstTask);
            }}
            className="p-2 rounded-lg bg-white/70 hover:bg-red-50 text-red-600 transition"
            title="Excluir tarefa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2">{category}</h2>
      {tasks.map((task) => (
        <p key={task.id} className="text-gray-800 font-medium mb-2 truncate">
          {task.title}
        </p>
      ))}
      <p className="text-sm text-gray-700 mb-3">
        {completed}/{total} concluídas
      </p>
      <div className="w-full bg-white/40 h-3 rounded-full overflow-hidden">
        <motion.div
          className="bg-white h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="mt-4 w-full bg-ghost flex items-center justify-center py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
      >
        Abrir Lista
      </div>{" "}
    </motion.div>
  );
};
