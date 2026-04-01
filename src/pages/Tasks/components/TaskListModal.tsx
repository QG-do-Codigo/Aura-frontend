"use client";

import { useState } from "react";
import type { Task } from "../types/task.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/UI/dialog";
import { CheckTaskModal } from "./Modal";

interface Props {
  tasks: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedTask: Task) => void;
}

export function TaskListModal({ tasks, open, onOpenChange, onSave }: Props) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white text-slate-600 rounded-3xl p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Lista de Tarefas
            </DialogTitle>
          </DialogHeader>

          {tasks.length === 0 && (
            <p className="text-gray-400">Nenhuma tarefa encontrada.</p>
          )}

          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition"
            >
              <span
                className={`font-medium ${task.completed ? "line-through text-gray-400" : ""
                  }`}
              >
                {task.title}
              </span>

              <span
                className={`text-sm px-3 py-1 rounded-full ${task.completed
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-200 text-gray-600"
                  }`}
              >
                {task.completed ? "Concluída" : "Pendente"}
              </span>
            </div>
          ))}
        </DialogContent>
      </Dialog>

      {selectedTask && (
        <CheckTaskModal
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={() => setSelectedTask(null)}
          onSave={(updatedTask) => {
            onSave(updatedTask);
            setSelectedTask(null);
          }}
        />
      )}
    </>
  );
}
