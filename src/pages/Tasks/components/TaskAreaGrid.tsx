import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import type { Task } from "../types/task.types";
import { TaskForm } from "./TaskForm";

const noteColorClassMap: Record<string, string> = {
  "#fecaca": "bg-[var(--note-red)]",
  "#bbf7d0": "bg-[var(--note-green)]",
  "#bfdbfe": "bg-[var(--note-blue)]",
  "#fef08a": "bg-[var(--note-yellow)]",
  "#ddd6fe": "bg-[var(--note-purple)]",
};

const formatDueDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface Props {
  tasks: Task[];
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTask: (task: Task) => void;
}

export const TaskAreaGrid = ({ tasks, updateTask, deleteTask, toggleTask }: Props) => {
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [openEditForm, setOpenEditForm] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            Nenhuma tarefa encontrada.
          </div>
        ) : (
          tasks.map((task) => {
            const colorClass = noteColorClassMap[task.color] ?? task.color;
            const hasDueDate = Boolean(task.dueDate);
            const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
            const dueDateStatus = task.dueDate
              ? task.completed
                ? "completed"
                : dueDateObj.getTime() < Date.now()
                  ? "overdue"
                  : "normal"
              : "none";

            return (
              <motion.div
                key={task.id}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 280 }}
                className={`${colorClass} relative rounded-3xl p-6 shadow-lg overflow-hidden group cursor-pointer flex h-full flex-col`}
              >
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaskToEdit(task);
                      setOpenEditForm(true);
                    }}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/70 text-slate-900 backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:bg-white"
                    title="Editar tarefa"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaskToDelete(task);
                      setOpenDeleteConfirm(true);
                    }}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/70 text-red-600 backdrop-blur-sm shadow-sm transition-all hover:scale-105 hover:bg-white"
                    title="Excluir tarefa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mb-4 flex flex-col items-center text-center">
                  <p className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-800/80 shadow-sm">
                    {task.category}
                  </p>
                  <p
                    className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${dueDateStatus === "overdue"
                        ? "bg-red-100 text-red-700"
                        : dueDateStatus === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-white/90 text-slate-800"
                      }`}
                  >
                    {hasDueDate ? `Prazo: ${formatDueDate(task.dueDate)}` : "Sem prazo definido"}
                  </p>
                  <h3 className="mt-4 text-2xl font-bold text-slate-900">{task.title}</h3>
                  <div className="mt-4 rounded-3xl border border-white/80 bg-white/80 p-4 text-sm leading-6 text-slate-700 shadow-sm text-left w-full max-h-36 overflow-y-auto custom-scrollbar">
                    <p className="whitespace-pre-wrap break-words">
                      {task.description || "Sem descrição"}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex w-full flex-col items-center gap-4">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-slate-800">
                      Prioridade {task.priority}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${task.completed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-white/90 text-slate-700"
                        }`}
                    >
                      {task.completed ? "Concluída" : "Pendente"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleTask(task)}
                    className="inline-flex items-center justify-center rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white"
                  >
                    {task.completed ? "Marcar pendente" : "Marcar concluída"}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {taskToEdit && openEditForm && (
        <TaskForm
          open={openEditForm}
          onOpenChange={(open) => {
            setOpenEditForm(open);
            if (!open) setTaskToEdit(null);
          }}
          initialData={taskToEdit}
          isEditing={true}
          onSubmit={(updatedData) => {
            updateTask(updatedData as Task);
            setOpenEditForm(false);
            setTaskToEdit(null);
          }}
          onClose={() => {
            setOpenEditForm(false);
            setTaskToEdit(null);
          }}
        />
      )}

      {taskToDelete && openDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-gray-50 border border-gray-300 p-8 max-w-md w-full mx-4 shadow-lg rounded-3xl">
            <h2 className="text-2xl font-extrabold text-red-600 mb-4 tracking-wide">
              EXCLUIR TAREFA?
            </h2>
            <p className="text-gray-800 mb-8 leading-relaxed">
              Você está prestes a excluir permanentemente:
              <br />
              <strong className="block mt-2 text-gray-900">"{taskToDelete.title}"</strong>
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setOpenDeleteConfirm(false);
                  setTaskToDelete(null);
                }}
                className="px-6 py-3 border border-gray-400 font-medium hover:bg-gray-100 transition tracking-wide rounded-full"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  deleteTask(taskToDelete.id);
                  setOpenDeleteConfirm(false);
                  setTaskToDelete(null);
                }}
                className="px-6 py-3 bg-red-600 text-white font-semibold hover:bg-red-700 transition tracking-wide rounded-full"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
