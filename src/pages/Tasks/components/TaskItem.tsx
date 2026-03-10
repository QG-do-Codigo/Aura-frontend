import type { Task } from "../types/task.types";

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

export const TaskItem = ({ task, onToggle, onDelete }: Props) => {
  return (
    <div className="flex justify-between items-center border-b py-3">
      <div>
        <p
          className={`font-medium ${
            task.completed ? "line-through text-gray-400" : ""
          }`}
        >
          {task.title}
        </p>
        <p className="text-sm text-gray-500">Prioridade: {task.priority}</p>
      </div>

      <div className="flex gap-2 items-center">
        <input type="checkbox" checked={task.completed} onChange={onToggle} />
        <button onClick={onDelete} className="text-red-500 text-sm">
          Excluir
        </button>
      </div>
    </div>
  );
};
