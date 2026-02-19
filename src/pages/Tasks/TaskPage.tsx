import { useEffect, useState } from "react";
import { useTasks } from "./hooks/useTasks";
import { TaskAreaGrid } from "./components/TaskAreaGrid";
import { TaskForm } from "./components/TaskForm";

export interface Tasks {
  title: string;
  description: string;
  category: string;
  completed: boolean;
  priority: number;
  color?: string;
  id: string;
}

export const TasksPage = () => {
  const { tasks, createTask, updateTask, toggleTask, deleteTask } = useTasks();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openNewTaskForm, setOpenNewTaskForm] = useState(false);

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-col">
            {" "}
            <h1 className="text-3xl font-bold text-gray-800">
              Tarefas Domésticas
            </h1>
            <p className="text-gray-600">Mantenha seu lar em harmonia.</p>
          </div>
          <button
            onClick={() => setOpenNewTaskForm(true)}
            className="px-5 py-3 bg-blue-600 text-white cursor-pointer rounded-full hover:bg-blue-700 transition shadow-sm"
          >
            + Nova Tarefa
          </button>
        </div>

        <TaskAreaGrid
          tasks={tasks}
          onOpenCategory={(cat) => setSelectedCategory(cat)}
          createTask={createTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
          toggleTask={toggleTask}
        />

        <TaskForm
          open={openNewTaskForm}
          onOpenChange={setOpenNewTaskForm}
          onSubmit={createTask}
          onClose={() => setOpenNewTaskForm(false)}
        />
      </div>
    </div>
  );
};
