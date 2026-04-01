import { useEffect, useState } from "react";
import type { Task, TaskCategory } from "../types/task.types";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/UI/select";
import { cn } from "../../../components/surface";

const noteColors = [
  { name: "red", class: "bg-[var(--note-red)]", hex: "#fecaca" },
  { name: "green", class: "bg-[var(--note-green)]", hex: "#bbf7d0" },
  { name: "blue", class: "bg-[var(--note-blue)]", hex: "#bfdbfe" },
  { name: "yellow", class: "bg-[var(--note-yellow)]", hex: "#fef08a" },
  { name: "purple", class: "bg-[var(--note-purple)]", hex: "#ddd6fe" },
];

const taskCategories: TaskCategory[] = [
  "COMPRAS",
  "AFAZERES",
  "ESTUDOS",
  "TRABALHO",
  "FINANCAS",
  "SAUDE",
  "LAZER",
];

const taskPriorities = [1, 2, 3, 4, 5] as const;

type TaskPriority = (typeof taskPriorities)[number];

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
  onClose,
}: TaskFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [category, setCategory] = useState<TaskCategory | "">(
    initialData?.category || ""
  );
  const [priority, setPriority] = useState<TaskPriority>(
    (initialData?.priority as TaskPriority) || 1
  );
  const [selectedColor, setSelectedColor] = useState(
    noteColors.find(c => c.hex === initialData?.color) || noteColors[0]
  );

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority(1);
    setSelectedColor(noteColors[0]);
  };

  useEffect(() => {
    if (isEditing) {
      setTitle(initialData?.title || "");
      setDescription(initialData?.description || "");
      setCategory(initialData?.category || "");
      setPriority((initialData?.priority as TaskPriority) || 1);
      setSelectedColor(
        noteColors.find((c) => c.hex === initialData?.color) || noteColors[0]
      );
    } else {
      resetForm();
    }
  }, [open, isEditing, initialData]);

  const isValidCategory = (value: any): value is TaskCategory => {
    return value !== "";
  };

  const handleSubmit = () => {
    if (!title.trim() || !isValidCategory(category)) return;

    const data = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      color: selectedColor.hex,
      completed: initialData?.completed ?? false,
    };

    onSubmit(data);

    if (!isEditing) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) {
          onClose?.();
        }
      }}
    >
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
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as TaskCategory)}
            >
              <SelectTrigger id="category" className="rounded-[8px] border border-slate-200 !bg-white px-4 text-slate-900 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:!bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="!bg-white text-slate-900 dark:!bg-slate-900 dark:text-slate-100">
                {taskCategories.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={String(priority)}
              onValueChange={(value) => setPriority(Number(value) as TaskPriority)}
            >
              <SelectTrigger id="priority" className="rounded-[8px] border border-slate-200 !bg-white px-4 text-slate-900 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:!bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent className="!bg-white text-slate-900 dark:!bg-slate-900 dark:text-slate-100">
                {taskPriorities.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Cor da nota</Label>
            <div className="flex flex-wrap gap-3">
              {noteColors.map((color) => (
                <div
                  key={color.name}
                  className={cn(
                    "w-10 h-10 rounded-full cursor-pointer border-2 transition-all",
                    selectedColor.name === color.name
                      ? "border-blue-600 scale-110 shadow-lg"
                      : "border-transparent hover:scale-105",
                    color.class
                  )}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer rounded-full"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || !category.trim()}
            className="cursor-pointer rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            {isEditing ? "Salvar alterações" : "Criar tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
