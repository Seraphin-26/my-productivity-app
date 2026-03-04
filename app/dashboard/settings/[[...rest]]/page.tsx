// app/dashboard/settings/[[...rest]]/page.tsx
"use client";
import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Paramètres</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez votre compte et vos préférences.</p>
      </div>
      <UserProfile routing="hash" />
    </div>
  );
}
