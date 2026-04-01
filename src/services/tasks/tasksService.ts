import { useEffect, useState } from "react";
import { api } from "../api";
import type { CreateTaskDTO, Task } from "../../pages/Tasks/types/task.types";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const token = localStorage.getItem("token");

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setTasks(response.data);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
  };

  const createTask = async (data: CreateTaskDTO) => {
    try {
      console.log(data);

      const response = await api.post("/tasks/create", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Nova tarefa criada:", response.data);

      setTasks((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      await api.patch(
        `/tasks/${task.id}`,
        { completed: !task.completed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
    }
  };

  const updateTask = async (task: Task) => {
    try {
      await api.patch(`/tasks/update/${task.id}`, task, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, ...task } : t))
      );
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    createTask,
    toggleTask,
    updateTask,
    deleteTask,
    fetchTasks,
  };
};
