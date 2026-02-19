"use client";

import { useState } from "react";
import { Button } from "../../../components/surface";
import type { Task } from "../types/task.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "../../../components/UI/dialog"; // seu wrapper Radix

interface Props {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedTask: Task) => void;
}

export function CheckTaskModal({ task, open, onOpenChange, onSave }: Props) {
  const [completed, setCompleted] = useState(task.completed);

  const handleSave = () => {
    onSave({ ...task, completed });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-slate-600 rounded-3xl p-6 flex flex-col gap-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
        </DialogHeader>

        <label className="flex items-center cursor-pointer select-none gap-3 mt-4">
          <div
            className={`w-12 h-6 rounded-full transition-colors duration-300 ${
              completed ? "bg-blue-500" : "bg-gray-700"
            }`}
            onClick={() => setCompleted(!completed)}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                completed ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
          <span className="font-medium">
            {completed ? "Marcar como pendente" : "Marcar como concluída"}
          </span>
        </label>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer rounded-full"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="cursor-pointer rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            Salvar
          </Button>
        </DialogFooter>

        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
