// app/dashboard/ai/page.tsx
import { auth }    from "@clerk/nextjs/server";
import { prisma }  from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Sparkles, Brain, Tag } from "lucide-react";

export default async function AIPage() {
  const { userId: clerkId } = auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/dashboard");

  const insights = await prisma.aI_Insight.findMany({
    where:   { note: { userId: user.id } },
    include: { note: { select: { title: true, status: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Sparkles size={22} className="text-violet-400" />
          Insights IA
        </h1>
        <p className="text-slate-500 text-sm mt-1">{insights.length} analyse{insights.length > 1 ? "s" : ""} générée{insights.length > 1 ? "s" : ""}</p>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <Brain size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune analyse pour le moment.</p>
          <p className="text-xs mt-1">Cliquez sur "Magie IA" sur une tâche pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map(insight => {
            const tasks = insight.suggestedTasks as Array<{ id: string; label: string; priority: string }>;
            return (
              <div key={insight.id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-100">{insight.note.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Analysé avec {insight.modelUsed} · {new Date(insight.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Sparkles size={14} className="text-violet-400 flex-shrink-0 mt-0.5" />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed border-l-2 border-violet-600 pl-3">
                  {insight.summary}
                </p>

                {tasks.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2">Tâches extraites</p>
                    <ul className="space-y-1.5">
                      {tasks.map(t => (
                        <li key={t.id} className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="w-1 h-1 rounded-full bg-violet-500 flex-shrink-0" />
                          {t.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {insight.suggestedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {insight.suggestedTags.map((tag: string) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-700/40 text-indigo-300 text-[10px] font-medium">
                        <Tag size={8} />{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
