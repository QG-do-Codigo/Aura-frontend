import type { Task } from "../types/task.types";
import { TaskItem } from "./TaskItem";

interface Props {
  category: string;
  tasks: Task[];
  onClose: () => void;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItemModal = ({
  category,
  tasks,
  onClose,
  onToggle,
  onDelete,
}: Props) => {
  const ordered = [...tasks].sort((a, b) => b.priority - a.priority);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">{category}</h2>
          <button onClick={onClose}>X</button>
        </div>

        {ordered.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onToggle(task)}
            onDelete={() => onDelete(task.id)}
          />
        ))}
      </div>
    </div>
  );
};
