// app/api/notes/route.ts
import { auth }          from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma }        from "@/lib/prisma";
import { z }             from "zod";

const CreateSchema = z.object({
  title:   z.string().min(1).max(300),
  content: z.string().max(10_000).default(""),
  tags:    z.array(z.string()).default([]),
  status:  z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
});

// GET /api/notes – liste toutes les notes de l'user
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user)  return NextResponse.json({ notes: [] });

  const notes = await prisma.note.findMany({
    where:   { userId: user.id },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    include: { aiInsight: true },
  });

  return NextResponse.json({ notes });
}

// POST /api/notes – créer une note
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const body   = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const lastNote = await prisma.note.findFirst({
    where:   { userId: user.id },
    orderBy: { position: "desc" },
    select:  { position: true },
  });
  const position = (lastNote?.position ?? -1) + 1;

  const note = await prisma.note.create({
    data:    { ...parsed.data, userId: user.id, position },
    include: { aiInsight: true },
  });

  return NextResponse.json({ note }, { status: 201 });
}
