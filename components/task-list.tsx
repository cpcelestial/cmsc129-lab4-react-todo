"use client";

import { useState, useEffect } from "react";
import type { Task, SortOption, SortDirection } from "@/lib/types";
import { taskStore } from "@/lib/task-store";
import { sortTasks } from "@/lib/utils";
import { TaskItem } from "@/components/task-item";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CheckCircle2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("dateAdded");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Initial load of tasks
    const loadTasks = async () => {
      try {
        const loadedTasks = await taskStore.getTasks();
        setTasks(loadedTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();

    // Subscribe to real-time updates
    const unsubscribe = taskStore.subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      await taskStore.updateTask(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    // Find the task to delete
    const taskToDelete = tasks.find((task) => task.id === taskId);

    if (!taskToDelete) {
      console.error("Task not found:", taskId);
      return;
    }

    console.log("Task to delete:", taskToDelete);

    try {
      // First delete the task from Firestore
      await taskStore.deleteTask(taskId);
      console.log("Task deleted from Firestore");

      // Then show toast with undo button that has direct access to the deleted task
      toast("Task deleted", {
        description: `"${taskToDelete.title}" has been removed`,
        action: {
          label: "Undo",
          onClick: async () => {
            console.log("Undo clicked, restoring task:", taskToDelete);

            try {
              // Use the stored taskToDelete directly instead of relying on state
              await taskStore.addTask(taskToDelete);
              console.log("Task restored successfully");
              toast.success("Task restored successfully");
            } catch (error) {
              console.error("Error restoring task:", error);
              toast.error("Failed to restore task");
            }
          },
        },
        duration: 10000,
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const sortedTasks = sortTasks(tasks, sortBy, sortDirection);
  const completedTasks = sortedTasks.filter((task) => task.completed);
  const pendingTasks = sortedTasks.filter((task) => !task.completed);

  if (!user) {
    return (
      <Card className="border-dashed bg-background">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <CardTitle className="text-xl font-normal">Not signed in</CardTitle>
          <CardDescription>
            Please sign in to view and manage your tasks.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="space-y-4">
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Tasks</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateAdded">Date Added</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortDirection}
            className="w-10 h-10"
          >
            <ArrowUpDown
              className={`h-4 w-4 transition-transform ${
                sortDirection === "desc" ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <Card className="border-dashed bg-background">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <CardTitle className="text-xl font-normal">No tasks yet</CardTitle>
            <CardDescription>
              Create your first task by clicking the Add Task button above.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {pendingTasks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Pending Tasks ({pendingTasks.length})
              </h3>
              <div className="grid gap-4">
                {pendingTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Completed Tasks ({completedTasks.length})
              </h3>
              <div className="grid gap-4 opacity-75">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
