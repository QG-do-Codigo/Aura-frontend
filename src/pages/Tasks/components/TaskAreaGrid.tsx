import { useState } from "react";
import type { Task } from "../types/task.types";
import { groupTasksByCategory } from "../utils/groupTasksByCategory";
import { TaskCategoryCard } from "./TaskCategoryCard";
import { TaskForm } from "./TaskForm";
import { CheckTaskModal } from "./Modal";
import { TaskListModal } from "./TaskListModal";

interface Props {
  tasks: Task[];
  onOpenCategory: (category: string) => void;
  createTask: (task: Omit<Task, "id">) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTask: (task: Task) => void;
  deleteCategory?: (category: string) => void;
}

export const TaskAreaGrid = ({
  tasks,

  updateTask,
  deleteTask,
}: Props) => {
  const grouped = groupTasksByCategory(tasks);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<
    "view" | "edit" | "delete-category"
  >("view");

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [openEditForm, setOpenEditForm] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const tasksInCategory = selectedCategory
    ? tasks.filter((t) => t.category === selectedCategory)
    : [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(grouped).map(([category, categoryTasks]) => (
          <TaskCategoryCard
            key={category}
            category={category}
            tasks={categoryTasks}
            onClick={() => {
              setSelectedCategory(category);
            }}
            onEdit={(task) => {
              setTaskToEdit(task);
              setOpenEditForm(true);
            }}
            onDelete={(task) => {
              setTaskToDelete(task);
              setOpenDeleteConfirm(true);
            }}
          />
        ))}
      </div>

      {selectedCategory && (
        <TaskListModal
          tasks={tasks.filter((t) => t.category === selectedCategory)}
          open={!!selectedCategory}
          onOpenChange={() => setSelectedCategory(null)}
          onSave={updateTask}
        />
      )}
      {taskToEdit && (
        <CheckTaskModal
          task={taskToEdit}
          onSave={(updatedTask: Task) => {
            updateTask(updatedTask);
            setTaskToEdit(null);
          }}
          onOpenChange={(open) => !open && setTaskToEdit(null)}
          open={!!taskToEdit}
        />
      )}

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
          <div className="bg-gray-50 border border-gray-300 p-8 max-w-md w-full mx-4 shadow-lg">
            <h2 className="text-2xl font-extrabold text-red-600 mb-4 tracking-wide">
              EXCLUIR TAREFA?
            </h2>
            <p className="text-gray-800 mb-8 leading-relaxed">
              Você está prestes a excluir permanentemente:
              <br />
              <strong className="block mt-2 text-gray-900">
                "{taskToDelete.title}"
              </strong>
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setOpenDeleteConfirm(false);
                  setTaskToDelete(null);
                }}
                className="
            px-6 py-3
            border border-gray-400
            font-medium
            hover:bg-gray-100
            transition
            tracking-wide
          "
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  deleteTask(taskToDelete.id);
                  setOpenDeleteConfirm(false);
                  setTaskToDelete(null);
                }}
                className="
            px-6 py-3
            bg-red-600
            text-white
            font-semibold
            hover:bg-red-700
            transition
            tracking-wide
          "
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
