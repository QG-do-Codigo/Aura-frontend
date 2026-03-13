import type { Task } from "../types/task.types";

export const groupTasksByCategory = (tasks: Task[]) => {
  return tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }

    acc[task.category].push(task);

    return acc;
  }, {} as Record<string, Task[]>);
};
