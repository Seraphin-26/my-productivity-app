// app/api/notes/[id]/route.ts
import { auth }          from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma }        from "@/lib/prisma";
import { z }             from "zod";

const UpdateSchema = z.object({
  title:    z.string().min(1).max(300).optional(),
  content:  z.string().max(10_000).optional(),
  status:   z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  tags:     z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
  position: z.number().int().optional(),
});

async function getNote(noteId: string, clerkId: string) {
  return prisma.note.findFirst({
    where: { id: noteId, user: { clerkId } },
    include: { aiInsight: true },
  });
}

// PATCH /api/notes/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const note = await getNote(id, clerkId);
  if (!note) return NextResponse.json({ error: "Note introuvable" }, { status: 404 });

  const body   = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const updated = await prisma.note.update({
    where:   { id },
    data:    parsed.data,
    include: { aiInsight: true },
  });

  return NextResponse.json({ note: updated });
}

// DELETE /api/notes/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const note = await getNote(id, clerkId);
  if (!note) return NextResponse.json({ error: "Note introuvable" }, { status: 404 });

  await prisma.note.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
