import { useEffect, useState } from "react";
import { useTasks } from "./hooks/useTasks";
import { TaskAreaGrid } from "./components/TaskAreaGrid";
import { TaskForm } from "./components/TaskForm";
import { TaskListModal } from "./components/TaskListModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/UI/dialog";

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
  const { tasks, createTask, updateTask, toggleTask, deleteTask, deleteAllTasks } = useTasks();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openNewTaskForm, setOpenNewTaskForm] = useState(false);
  const [openDeleteAllConfirm, setOpenDeleteAllConfirm] = useState(false);

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

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenDeleteAllConfirm(true)}
              className="px-5 py-3 border border-rose-200 text-rose-600 font-semibold rounded-full hover:border-rose-300 transition disabled:opacity-60"
              disabled={tasks.length === 0}
            >
              Excluir tudo
            </button>
            <button
              onClick={() => setOpenNewTaskForm(true)}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition"
            >
              + Nova Tarefa
            </button>
          </div>
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

      <Dialog open={openDeleteAllConfirm} onOpenChange={setOpenDeleteAllConfirm}>
        <DialogContent className="rounded-3xl border border-rose-100 bg-white p-8 text-slate-700 shadow-2xl">
          <DialogHeader className="gap-3 text-left">
            <DialogTitle className="text-2xl font-extrabold text-rose-600">
              Excluir todas as tarefas?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Essa ação é definitiva e remove todas as tarefas cadastradas.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Você tem {tasks.length} tarefa(s) no momento.
          </div>

          <DialogFooter className="mt-2 sm:justify-end">
            <button
              onClick={() => setOpenDeleteAllConfirm(false)}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                void deleteAllTasks();
                setOpenDeleteAllConfirm(false);
              }}
              className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Excluir tudo
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
