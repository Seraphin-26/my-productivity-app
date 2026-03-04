// app/dashboard/tasks/page.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TasksClient from "@/components/TasksClient";

export default async function TasksPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/dashboard");

  const notes = await prisma.note.findMany({
    where:   { userId: user.id },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    include: { aiInsight: true },
  });

  // ✅ Sérialiser pour éviter l'erreur "Classes not supported"
  const serializedNotes = JSON.parse(JSON.stringify(notes));

  return <TasksClient initialNotes={serializedNotes} />;
}