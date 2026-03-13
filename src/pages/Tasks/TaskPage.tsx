import { useEffect, useState } from "react";
import { useTasks } from "./hooks/useTasks";
import { TaskAreaGrid } from "./components/TaskAreaGrid";
import { TaskForm } from "./components/TaskForm";
import { TaskListModal } from "./components/TaskListModal";

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
    <div className="p-8 min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-extrabold tracking-tight">
              TAREFAS DOMÉSTICAS
            </h1>
            <p className="text-gray-500 uppercase text-sm tracking-wide">
              Organização diária simplificada
            </p>
          </div>

          <button
            onClick={() => setOpenNewTaskForm(true)}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition"
          >
            + Nova Tarefa
          </button>
        </div>

        {/* card */}
        <div className=" ">
          <TaskAreaGrid
            tasks={tasks}
            onOpenCategory={(cat) => setSelectedCategory(cat)}
            createTask={createTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            toggleTask={toggleTask}
          />
        </div>

        {/* modals */}
        <TaskListModal
          tasks={tasks.filter((t) => t.category === selectedCategory)}
          open={!!selectedCategory}
          onOpenChange={() => setSelectedCategory(null)}
          onSave={updateTask}
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
