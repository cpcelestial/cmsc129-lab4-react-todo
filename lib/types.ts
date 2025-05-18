export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  dueDate: string;
  dueTime: string;
  priority: 'high' | 'medium' | 'low';
}

export type SortOption = 'dateAdded' | 'dueDate' | 'priority';
export type SortDirection = 'asc' | 'desc';