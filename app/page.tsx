// app/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Sparkles, ArrowRight, CheckCircle2, Zap, Shield } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-[#09090e] flex flex-col items-center justify-center px-6 py-20">
      {/* Gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-2xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-700/40 bg-violet-950/40 text-violet-300 text-sm font-medium">
          <Sparkles size={14} />
          Propulsé par LLaMA 3.3 70B
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
          Vos tâches.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
            Amplifiées par l&apos;IA.
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
          Créez des notes, organisez vos tâches par drag & drop, et laissez l&apos;IA résumer,
          extraire des actions concrètes et suggérer des tags pour chaque note.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {userId ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-900/40 active:scale-95"
            >
              Aller au dashboard
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-900/40 active:scale-95"
              >
                Commencer gratuitement
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/sign-in"
                className="px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl transition-all"
              >
                Se connecter
              </Link>
            </>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
          {[
            { icon: CheckCircle2, title: "CRUD complet",  desc: "Créez, éditez, réorganisez vos tâches par drag & drop" },
            { icon: Zap,          title: "Magie IA",      desc: "Résumé, 3 tâches concrètes et 5 tags en 1 clic"      },
            { icon: Shield,       title: "Sécurisé",      desc: "Auth Clerk, données PostgreSQL, ownership vérifié"    },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 text-left space-y-2">
              <Icon size={18} className="text-violet-400" />
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
