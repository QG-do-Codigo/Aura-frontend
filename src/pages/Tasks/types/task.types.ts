export type TaskCategory =
  | "COMPRAS"
  | "AFAZERES"
  | "ESTUDOS"
  | "TRABALHO"
  | "FINANCAS"
  | "SAUDE"
  | "LAZER";

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  completed: boolean;
  priority: number;
  color: string;
}

export interface CreateTaskDTO {
  title: string;
  description: string;
  category: TaskCategory;
  priority: number;
  color: string;
  completed: boolean;
}
