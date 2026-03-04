// app/dashboard/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, Clock, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

async function getOrCreateUser(clerkId: string, email: string, name: string) {
  return prisma.user.upsert({
    where: { clerkId },
    create: { clerkId, email, name },
    update: { email, name },
  });
}

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const name  = clerkUser?.fullName ?? clerkUser?.firstName ?? "Utilisateur";

  const user = await getOrCreateUser(clerkId, email, name);

  const [total, done, withInsight] = await Promise.all([
    prisma.note.count({ where: { userId: user.id } }),
    prisma.note.count({ where: { userId: user.id, status: "DONE" } }),
    prisma.note.count({ where: { userId: user.id, aiInsight: { isNot: null } } }),
  ]);

  const todo     = total - done;
  const progress = total ? Math.round((done / total) * 100) : 0;

  const stats = [
    { label: "Total",        value: total,      icon: TrendingUp,  color: "text-indigo-400" },
    { label: "À faire",      value: todo,       icon: Clock,       color: "text-amber-400"  },
    { label: "Terminées",    value: done,       icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Analysées IA", value: withInsight, icon: Sparkles,   color: "text-violet-400" },
  ];

  return (
    <div className="max-w-3xl space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          Bonjour, {name.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Voici un aperçu de votre productivité aujourd'hui.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
            <Icon size={18} className={color} />
            <div>
              <p className="text-2xl font-black">{value}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-sm">Progression globale</p>
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
            {progress}%
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">{done} tâches terminées sur {total}</p>
      </div>

      {/* CTA */}
      <Link
        href="/dashboard/tasks"
        className="inline-flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-900/30 text-sm"
      >
        <CheckCircle2 size={16} />
        Gérer mes tâches
      </Link>
    </div>
  );
}
