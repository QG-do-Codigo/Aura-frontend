export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  priority: number;
  color: string;
}

export interface CreateTaskDTO {
  title: string;
  description: string;
  category: string;
  priority: number;
  color: string;
  completed: boolean;
}
