import { useState } from "react";
import type { Task } from "../types/task.types";

interface Props {
  onSubmit: (data: Omit<Task, "id">) => void;
  onClose: () => void;
}

const noteColors = [
  { name: "red", class: "bg-[var(--note-red)]" },
  { name: "green", class: "bg-[var(--note-green)]" },
  { name: "blue", class: "bg-[var(--note-blue)]" },
  { name: "yellow", class: "bg-[var(--note-yellow)]" },
  { name: "purple", class: "bg-[var(--note-purple)]" },
];

export const TaskForm = ({ onSubmit, onClose }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState(1);
  const [selectedColor, setSelectedColor] = useState(noteColors[0].class);

  const handleSubmit = () => {
    if (!title || !category) return;

    onSubmit({
      title,
      description,
      category,
      priority,
      color: selectedColor,
      completed: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px]">
        <h2 className="text-xl font-bold mb-4">Nova Anotação</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="border p-2 w-full mb-3 h-24"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="number"
          className="border p-2 w-full mb-4"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
        />

        {/* seletor de cores */}
        <div className="flex gap-3 mb-4">
          {noteColors.map((color) => (
            <div
              key={color.name}
              className={`${
                color.class
              } w-8 h-8 rounded-full cursor-pointer border-2 ${
                selectedColor === color.class
                  ? "border-black"
                  : "border-transparent"
              }`}
              onClick={() => setSelectedColor(color.class)}
            />
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Criar nota
          </button>
        </div>
      </div>
    </div>
  );
};
