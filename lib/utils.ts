import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Task, SortOption, SortDirection } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":").map(Number);

  return new Date(0, 0, 0, hours, minutes).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function sortTasks(
  tasks: Task[],
  sortBy: SortOption,
  direction: SortDirection
): Task[] {
  return [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "dateAdded":
        comparison =
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        break;
      case "dueDate":
        const dateA = new Date(`${a.dueDate}T${a.dueTime}`).getTime();
        const dateB = new Date(`${b.dueDate}T${b.dueTime}`).getTime();
        comparison = dateA - dateB;
        break;
      case "priority":
        const priorityMap = { high: 0, medium: 1, low: 2 };
        comparison = priorityMap[a.priority] - priorityMap[b.priority];
        break;
    }

    return direction === "asc" ? comparison : -comparison;
  });
}

export function getPriorityColor(priority: Task["priority"]) {
  switch (priority) {
    case "high":
      return "bg-destructive/10 border-destructive text-destructive";
    case "medium":
      return "bg-amber-500/10 border-amber-500 text-amber-500";
    case "low":
      return "bg-emerald-500/10 border-emerald-500 text-emerald-500";
    default:
      return "text-muted-foreground bg-muted/50";
  }
}
