import { useState } from "react";
import type { Task } from "../types/task.types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../../../components/UI/dialog";

import { Button } from "../../../components/UI/button";
import { Input } from "../../../components/UI/input";
import { Textarea } from "../../../components/UI/textarea";
import { Label } from "../../../components/UI/label";
import { cn } from "../../../components/surface";

const noteColors = [
  { name: "red", class: "bg-[var(--note-red)]" },
  { name: "green", class: "bg-[var(--note-green)]" },
  { name: "blue", class: "bg-[var(--note-blue)]" },
  { name: "yellow", class: "bg-[var(--note-yellow)]" },
  { name: "purple", class: "bg-[var(--note-purple)]" },
];

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Task, "id"> | Task) => void;
  initialData?: Task;
  isEditing?: boolean;
  onClose?: () => void;
}

export const TaskForm = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEditing = false,
}: TaskFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [priority, setPriority] = useState(initialData?.priority || 1);
  const [selectedColor, setSelectedColor] = useState(
    initialData?.color || noteColors[0].class
  );

  const handleSubmit = () => {
    if (!title.trim() || !category.trim()) return;

    const data = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority,
      color: selectedColor,
      completed: initialData?.completed ?? false,
      ...(initialData?.id && { id: initialData.id }),
    };

    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Altere os detalhes da tarefa abaixo."
              : "Preencha os campos para criar uma nova tarefa."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Título da tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className=" rounded-[8px] border-slate-200 bg-slate-50/50 px-6"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className=" rounded-[8px] border-slate-200 bg-slate-50/50 px-6"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              placeholder="Categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className=" rounded-[8px] border-slate-200 bg-slate-50/50 px-6"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priority">Prioridade (1-5)</Label>
            <Input
              id="priority"
              type="number"
              min={1}
              max={5}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className=" rounded-[8px] border-slate-200 bg-slate-50/50 px-6"
            />
          </div>

          <div className="grid gap-2">
            <Label>Cor da nota</Label>
            <div className="flex flex-wrap gap-3">
              {noteColors.map((color) => (
                <div
                  key={color.name}
                  className={cn(
                    "w-10 h-10 rounded-full cursor-pointer border-2 transition-all",
                    selectedColor === color.class
                      ? "border-blue-600 scale-110 shadow-lg"
                      : "border-transparent hover:scale-105",
                    color.class
                  )}
                  onClick={() => setSelectedColor(color.class)}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || !category.trim()}
          >
            {isEditing ? "Salvar alterações" : "Criar tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
