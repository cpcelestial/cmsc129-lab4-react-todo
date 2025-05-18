"use client";

import { useEffect } from "react";
import { Header } from "@/components/header";
import { TaskList } from "@/components/task-list";
import { toast } from "sonner";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container px-6 py-8">
        <TaskList />
      </main>
    </div>
  );
}
