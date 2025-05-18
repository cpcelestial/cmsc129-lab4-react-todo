import { db, auth } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import type { Task } from "./types";

// Firebase Firestore implementation
class TaskStore {
  private readonly COLLECTION_NAME = "tasks";

  // Get all tasks for the current user
  async getTasks(): Promise<Task[]> {
    if (!auth.currentUser) return [];

    try {
      const tasksRef = collection(db, this.COLLECTION_NAME);
      const q = query(tasksRef, where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          completed: data.completed,
          createdAt: data.createdAt.toDate().toISOString(),
          dueDate: data.dueDate,
          dueTime: data.dueTime,
          priority: data.priority,
        };
      });
    } catch (error) {
      console.error("Error getting tasks:", error);
      return [];
    }
  }

  // Subscribe to tasks for real-time updates
  subscribeToTasks(callback: (tasks: Task[]) => void): () => void {
    if (!auth.currentUser) {
      callback([]);
      return () => {};
    }

    const tasksRef = collection(db, this.COLLECTION_NAME);
    const q = query(tasksRef, where("userId", "==", auth.currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const tasks = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            completed: data.completed,
            createdAt: data.createdAt.toDate().toISOString(),
            dueDate: data.dueDate,
            dueTime: data.dueTime,
            priority: data.priority,
          };
        });
        callback(tasks);
      },
      (error) => {
        console.error("Error subscribing to tasks:", error);
      }
    );

    return unsubscribe;
  }

  // Add a new task or restore a deleted task
  async addTask(task: Task): Promise<Task> {
    console.log("addTask called with task:", task);

    if (!auth.currentUser) {
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }

    try {
      // If the task already has an ID (like when restoring a deleted task),
      // use that ID instead of generating a new one
      if (task.id) {
        console.log("Restoring existing task with ID:", task.id);
        const taskRef = doc(db, this.COLLECTION_NAME, task.id);

        // Convert the createdAt string to a Timestamp
        let createdAtTimestamp;
        try {
          createdAtTimestamp = Timestamp.fromDate(new Date(task.createdAt));
        } catch (error) {
          console.error("Error converting createdAt to Timestamp:", error);
          createdAtTimestamp = Timestamp.now();
        }

        const taskData = {
          userId: auth.currentUser.uid,
          title: task.title,
          description: task.description || "",
          completed: task.completed,
          createdAt: createdAtTimestamp,
          dueDate: task.dueDate,
          dueTime: task.dueTime,
          priority: task.priority,
        };

        console.log("Setting document with data:", taskData);
        await setDoc(taskRef, taskData);
        console.log("Task restored successfully");
        return task;
      } else {
        // For new tasks, create a new document with auto-generated ID
        console.log("Creating new task");
        const taskData = {
          userId: auth.currentUser.uid,
          title: task.title,
          description: task.description || "",
          completed: task.completed,
          createdAt: Timestamp.now(),
          dueDate: task.dueDate,
          dueTime: task.dueTime,
          priority: task.priority,
        };

        const docRef = await addDoc(
          collection(db, this.COLLECTION_NAME),
          taskData
        );
        console.log("New task created with ID:", docRef.id);
        return { ...task, id: docRef.id };
      }
    } catch (error) {
      console.error("Error adding/restoring task:", error);
      throw error;
    }
  }

  // Update an existing task
  async updateTask(updatedTask: Task): Promise<Task> {
    if (!auth.currentUser) throw new Error("User not authenticated");

    try {
      const taskRef = doc(db, this.COLLECTION_NAME, updatedTask.id);
      await updateDoc(taskRef, {
        title: updatedTask.title,
        description: updatedTask.description || "",
        completed: updatedTask.completed,
        dueDate: updatedTask.dueDate,
        dueTime: updatedTask.dueTime,
        priority: updatedTask.priority,
      });

      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    if (!auth.currentUser) throw new Error("User not authenticated");

    try {
      const taskRef = doc(db, this.COLLECTION_NAME, taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  // Get a specific task by ID
  async getTask(taskId: string): Promise<Task | null> {
    if (!auth.currentUser) return null;

    try {
      const taskRef = doc(db, this.COLLECTION_NAME, taskId);
      const docSnap = await getDoc(taskRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title,
          description: data.description,
          completed: data.completed,
          createdAt: data.createdAt.toDate().toISOString(),
          dueDate: data.dueDate,
          dueTime: data.dueTime,
          priority: data.priority,
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting task:", error);
      return null;
    }
  }
}

export const taskStore = new TaskStore();
