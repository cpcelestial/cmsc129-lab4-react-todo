"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { Task } from "@/lib/types";
import { generateId, cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define the form schema with Zod
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  dueTime: z.string().min(1, "Due time is required"),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "Priority is required",
  }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  initialTask?: Task;
  onSubmit: (task: Task) => void;
}

export function TaskForm({ initialTask, onSubmit }: TaskFormProps) {
  // Initialize the form with React Hook Form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialTask?.title || "",
      description: initialTask?.description || "",
      dueDate: initialTask?.dueDate ? new Date(initialTask.dueDate) : undefined,
      dueTime: initialTask?.dueTime || "",
      priority: initialTask?.priority || "medium",
    },
  });

  // Handle form submission
  const handleSubmit = (values: TaskFormValues) => {
    const task: Task = {
      id: initialTask?.id || generateId(),
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      dueDate: values.dueDate.toISOString().split("T")[0],
      dueTime: values.dueTime,
      priority: values.priority,
      completed: initialTask?.completed || false,
      createdAt: initialTask?.createdAt || new Date().toISOString(),
    };

    onSubmit(task);

    if (!initialTask) {
      form.reset({
        title: "",
        description: "",
        dueDate: undefined,
        dueTime: "09:00",
        priority: "medium",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add details about your task"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Due Date & Time</FormLabel>
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "PPP")
                            : "Select date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueTime"
              render={({ field }) => (
                <FormItem className="w-[140px]">
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-3 gap-2"
                >
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem
                        value="high"
                        id="high"
                        className="sr-only"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="high"
                      className={cn(
                        "flex h-12 w-full cursor-pointer items-center justify-center rounded-md border p-3 transition-all duration-200 hover:opacity-90 active:scale-95",
                        field.value === "high"
                          ? "bg-destructive/10 border-destructive text-destructive"
                          : "hover:border-destructive/50 hover:text-destructive"
                      )}
                    >
                      High
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem
                        value="medium"
                        id="medium"
                        className="sr-only"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="medium"
                      className={cn(
                        "flex h-12 w-full cursor-pointer items-center justify-center rounded-md border p-3 transition-all duration-200 hover:opacity-90 active:scale-95",
                        field.value === "medium"
                          ? "bg-amber-500/10 border-amber-500 text-amber-500"
                          : "hover:border-amber-500/50 hover:text-amber-500"
                      )}
                    >
                      Medium
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem
                        value="low"
                        id="low"
                        className="sr-only"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="low"
                      className={cn(
                        "flex h-12 w-full cursor-pointer items-center justify-center rounded-md border p-3 transition-all duration-200 hover:opacity-90 active:scale-95",
                        field.value === "low"
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                          : "hover:border-emerald-500/50 hover:text-emerald-500"
                      )}
                    >
                      Low
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialTask ? "Update Task" : "Add Task"}
        </Button>
      </form>
    </Form>
  );
}
