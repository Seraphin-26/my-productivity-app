// app/api/ai/analyze/route.ts
import { auth }                      from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { prisma }                    from "@/lib/prisma";

const RequestSchema = z.object({
  noteId:  z.string().cuid(),
  title:   z.string().min(1).max(300),
  content: z.string().max(10_000).default(""),
});

const AIResponseSchema = z.object({
  summary:        z.string().min(1).max(600),
  suggestedTasks: z
    .array(z.object({
      id:       z.string(),
      label:    z.string().min(1).max(200),
      priority: z.enum(["low", "medium", "high"]),
    }))
    .length(3),
  suggestedTags: z.array(z.string().min(1).max(50)).length(5),
});

export type AIAnalyzeResponse = z.infer<typeof AIResponseSchema> & { modelUsed: string };

const SYSTEM_PROMPT = `
Tu es un assistant de productivité expert. Quand on te soumet une note,
tu retournes UNIQUEMENT un objet JSON valide (sans markdown, sans backticks)
ayant cette structure exacte :

{
  "summary": "<résumé de la note en exactement 2 phrases claires et actionnables>",
  "suggestedTasks": [
    { "id": "t1", "label": "<tâche concrète à l'infinitif>", "priority": "high|medium|low" },
    { "id": "t2", "label": "<tâche concrète à l'infinitif>", "priority": "high|medium|low" },
    { "id": "t3", "label": "<tâche concrète à l'infinitif>", "priority": "high|medium|low" }
  ],
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Règles strictes :
- summary : exactement 2 phrases, style professionnel, en français.
- suggestedTasks : exactement 3 entrées, verbe d'action à l'infinitif, priorité réaliste.
- suggestedTags : exactement 5 tags, minuscules, sans espaces (utiliser des tirets), en français.
- Aucun texte en dehors du JSON.
`.trim();

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 }); }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 422 });

  const { noteId, title, content } = parsed.data;

  const note = await prisma.note.findFirst({
    where:  { id: noteId, user: { clerkId } },
    select: { id: true },
  });
  if (!note) return NextResponse.json({ error: "Note introuvable" }, { status: 404 });

  const MODEL = "llama-3.3-70b-versatile";
  let rawText: string;

  try {
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model:       MODEL,
      temperature: 0.4,
      max_tokens:  600,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: `Titre : ${title}\nContenu : ${content || "(vide)"}` },
      ],
    });
    rawText = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (err) {
    console.error("[ai/analyze] Groq error:", err);
    return NextResponse.json({ error: "Erreur IA. Réessayez dans quelques instants." }, { status: 502 });
  }

  let aiData: z.infer<typeof AIResponseSchema>;
  try {
    const cleaned = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    aiData = AIResponseSchema.parse(JSON.parse(cleaned));
  } catch (err) {
    console.error("[ai/analyze] Parse error:", rawText, err);
    return NextResponse.json({ error: "Réponse IA invalide." }, { status: 502 });
  }

  await prisma.aI_Insight.upsert({
    where:  { noteId },
    create: { noteId, ...aiData, modelUsed: MODEL },
    update: { ...aiData, modelUsed: MODEL, updatedAt: new Date() },
  });

  return NextResponse.json({ ...aiData, modelUsed: MODEL }, { status: 200 });
}

export function GET()    { return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }); }
export function PUT()    { return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }); }
export function DELETE() { return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }); }
