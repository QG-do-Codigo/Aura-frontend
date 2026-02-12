import type { Task } from "../types/task.types";

interface Props {
  category: string;
  tasks: Task[];
  onClick: () => void;
}

export const TaskCategoryCard = ({ category, tasks, onClick }: Props) => {
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const progress = total === 0 ? 0 : (completed / total) * 100;

  const colorClass = tasks[0]?.color || "bg-gray-200";

  return (
    <div
      onClick={onClick}
      className={`${colorClass} p-5 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition`}
    >
      <h2 className="text-xl font-semibold mb-2">{category}</h2>

      <p className="text-sm text-gray-700 mb-3">
        {completed}/{total} concluídas
      </p>

      {/* barra de progresso*/}
      <div className="w-full bg-white/40 h-3 rounded-full">
        <div
          className={`${colorClass} h-3 rounded-full transition-all opacity-70`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
