import type { Task } from "../types/task.types";
import { groupTasksByCategory } from "../utils/groupTasksByCategory";
import { TaskCategoryCard } from "./TaskCategoryCard";

interface Props {
  tasks: Task[];
  onOpenCategory: (category: string) => void;
}

export const TaskAreaGrid = ({ tasks, onOpenCategory }: Props) => {
  const grouped = groupTasksByCategory(tasks);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(grouped).map(([category, tasks]) => (
        <TaskCategoryCard
          key={category}
          category={category}
          tasks={tasks}
          onClick={() => onOpenCategory(category)}
        />
      ))}
    </div>
  );
};
