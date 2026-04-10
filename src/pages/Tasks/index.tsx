import { useEffect, useState } from "react";
import { useTasks } from "../../services/tasks/tasksService";
import { TaskAreaGrid } from "./components/TaskAreaGrid";
import { TaskForm } from "./components/TaskForm";

const taskCategories = [
  "COMPRAS",
  "AFAZERES",
  "ESTUDOS",
  "TRABALHO",
  "FINANCAS",
  "SAUDE",
  "LAZER",
] as const;

export const TasksPage = () => {
  const {
    tasks,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    fetchTasks,
    fetchTasksByCategory,
  } = useTasks();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openNewTaskForm, setOpenNewTaskForm] = useState(false);

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  const handleCategoryChange = async (category: string) => {
    const nextCategory = selectedCategory === category ? null : category;
    setSelectedCategory(nextCategory);

    if (!nextCategory) {
      await fetchTasks();
      return;
    }

    await fetchTasksByCategory(nextCategory);
  };

  const handleCreateTask = async (data: Parameters<typeof createTask>[0]) => {
    const newTask = await createTask(data);
    if (!selectedCategory || !newTask) return;

    if (newTask.category !== selectedCategory) {
      await fetchTasksByCategory(selectedCategory);
    }
  };

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

        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          {taskCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryChange(category)}
              className={`rounded-full px-4 py-2 transition font-semibold ${selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div>
          <TaskAreaGrid
            tasks={tasks}
            updateTask={updateTask}
            deleteTask={deleteTask}
            toggleTask={toggleTask}
          />
        </div>

        <TaskForm
          open={openNewTaskForm}
          onOpenChange={setOpenNewTaskForm}
          onSubmit={handleCreateTask}
          onClose={() => setOpenNewTaskForm(false)}
        />
      </div>
    </div>
  );
};
