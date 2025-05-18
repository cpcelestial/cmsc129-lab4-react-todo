"use client"

import { useState } from "react"
import { formatDate, formatTime, getPriorityColor } from "@/lib/utils"
import type { Task } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Clock, Calendar, Trash2, Edit } from "lucide-react"
import { TaskForm } from "./task-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TaskItemProps {
  task: Task
  onUpdate: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleCompletionToggle = async () => {
    setIsUpdating(true)
    try {
      await onUpdate({
        ...task,
        completed: !task.completed,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEdit = async (updatedTask: Task) => {
    setIsUpdating(true)
    try {
      await onUpdate(updatedTask)
      setIsEditDialogOpen(false)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${task.completed ? "bg-secondary/30" : "bg-card"}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={handleCompletionToggle}
            disabled={isUpdating}
            className="mt-1 h-5 w-5 transition-transform duration-200 hover:scale-110"
          />

          <div className="flex-1 space-y-2">
            <div>
              <h3 className={`text-lg font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={`mt-1 text-sm ${
                    task.completed ? "text-muted-foreground/70 line-through" : "text-muted-foreground"
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {task.dueDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}

              {task.dueTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTime(task.dueTime)}</span>
                </div>
              )}

              <Badge variant="outline" className={`${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 px-6 py-3 bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditDialogOpen(true)}
          disabled={isUpdating}
          className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isUpdating}
              className="h-8 px-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(task.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm initialTask={task} onSubmit={handleEdit} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
