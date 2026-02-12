import { useEffect, useState } from "react";
import { useTasks } from "./hooks/useTasks";
import { TaskAreaGrid } from "./components/TaskAreaGrid";
import { TaskItemModal } from "./components/TaskItemModal";
import { TaskForm } from "./components/TaskForm";

export interface Tasks {
  title: string;
  description: string;
  category: string;
  completed: boolean;
  priority: number;
}

export const TasksPage = () => {
  const { tasks, createTask, toggleTask, deleteTask } = useTasks();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ZGZmMTA5Yi1jNDZiLTRjN2YtYWQ0MC01NzYyZWU4NWNlN2UiLCJlbWFpbCI6InZpY3RvcmlhZGlhc2oyMkBnbWFpbC5jb20iLCJpYXQiOjE3NzA5MzM2MTAsImV4cCI6MTc3MDkzNzIxMCwiYXVkIjoidG9rZW4tYXVkaWVuY2UiLCJpc3MiOiJ0b2tlbi1pc3N1ZXIifQ.4T6zuhoosUspgfRl3mBt-jFP-2Th6Quu1gQO6iqdpe8";

  useEffect(() => {
    localStorage.setItem("token", token);
  }, []);

  const tasksByCategory = selectedCategory
    ? tasks.filter((t) => t.category === selectedCategory)
    : [];

  return (
    <div className="p-6">
      <button onClick={() => setOpenForm(true)}>Adicionar Área</button>

      <TaskAreaGrid
        tasks={tasks}
        onOpenCategory={(cat) => setSelectedCategory(cat)}
      />

      {selectedCategory && (
        <TaskItemModal
          category={selectedCategory}
          tasks={tasksByCategory}
          onClose={() => setSelectedCategory(null)}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      )}

      {openForm && (
        <TaskForm onSubmit={createTask} onClose={() => setOpenForm(false)} />
      )}
    </div>
  );
};
