import { useState } from "react";
import type { Task } from "../types/task.types";
import { groupTasksByCategory } from "../utils/groupTasksByCategory";
import { TaskCategoryCard } from "./TaskCategoryCard";
import { TaskForm } from "./TaskForm";

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
              setModalMode("view");
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

      {/* Modal da Categoria – descomente quando quiser */}
      {/* {selectedCategory && (
        <TaskItemModal
          category={selectedCategory}
          tasks={tasksInCategory}
          onClose={() => {
            setSelectedCategory(null);
            setModalMode("view");
          }}
          onToggle={toggleTask}
          onDelete={deleteTask}
          mode={modalMode}
          onDeleteCategory={deleteCategory}
        />
      )} */}

      {/* Formulário de edição de tarefa */}
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

      {/* Confirmação de exclusão simples (mantive seu código original) */}
      {taskToDelete && openDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Excluir tarefa?
            </h2>
            <p className="text-gray-700 mb-8">
              Você está prestes a excluir permanentemente:
              <br />
              <strong className="block mt-2">"{taskToDelete.title}"</strong>
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setOpenDeleteConfirm(false);
                  setTaskToDelete(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteTask(taskToDelete.id);
                  setOpenDeleteConfirm(false);
                  setTaskToDelete(null);
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
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
