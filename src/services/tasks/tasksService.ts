import { useEffect, useState } from "react";
import { api } from "../api";
import type { CreateTaskDTO, Task } from "../../pages/Tasks/types/task.types";

const sortTasksByDueDate = (tasks: Task[]) =>
  [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;

    const aTime = new Date(a.dueDate).getTime();
    const bTime = new Date(b.dueDate).getTime();
    return aTime - bTime;
  });

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const token = localStorage.getItem("token");

  const [categories, setCategories] = useState<string[]>([]);

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setTasks(sortTasksByDueDate(response.data));
      setCategories(Array.from(new Set(response.data.map((task: Task) => task.category))));
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      return [];
    }
  };

  const fetchTasksByCategory = async (category: string) => {
    try {
      const response = await api.get(`/tasks/category/${category}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(sortTasksByDueDate(response.data));
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar tarefas por categoria:", error);
      return [];
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

      setTasks((prev) => sortTasksByDueDate([...prev, response.data]));
      setCategories((prev) =>
        prev.includes(response.data.category)
          ? prev
          : [...prev, response.data.category]
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      return null;
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      const updatedCompleted = !task.completed;

      await api.patch(
        `/tasks/update/${task.id}`,
        { completed: updatedCompleted },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks((prev) =>
        sortTasksByDueDate(
          prev.map((t) =>
            t.id === task.id ? { ...t, completed: updatedCompleted } : t
          )
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
      setTasks((prev) => sortTasksByDueDate(prev.map((t) => (t.id === task.id ? { ...t, ...task } : t))));
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    categories,
    createTask,
    toggleTask,
    updateTask,
    deleteTask,
    fetchTasks,
    fetchTasksByCategory,
  };
};
