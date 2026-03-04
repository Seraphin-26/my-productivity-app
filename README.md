# 🚀 ProductivityAI — Setup

Application de productivité fullstack Next.js avec IA intégrée.

## Stack
- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Clerk** — Authentification
- **PostgreSQL** + **Prisma ORM** — Base de données
- **OpenAI GPT-4o mini** — Analyse IA des notes
- **TanStack Query** + **Zustand** — State management

---

## ⚡ Installation en 5 étapes

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer les variables d'environnement
```bash
cp .env.example .env.local
```
Puis remplir `.env.local` avec :

| Variable | Où la trouver |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [dashboard.clerk.com](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | [dashboard.clerk.com](https://dashboard.clerk.com) |
| `DATABASE_URL` | [neon.tech](https://neon.tech) (gratuit) |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) |

### 3. Générer le client Prisma + migrer la base
```bash
npm run db:migrate
```
> Si tu utilises Neon ou Supabase, tu peux aussi faire `npm run db:push` pour aller plus vite.

### 4. Lancer en développement
```bash
npm run dev
```

### 5. Ouvrir l'app
[http://localhost:3000](http://localhost:3000)

---

## 📁 Structure du projet
```
my-productivity-app/
├── app/
│   ├── api/
│   │   ├── notes/           → GET, POST /api/notes
│   │   │   └── [id]/        → PATCH, DELETE /api/notes/:id
│   │   └── ai/analyze/      → POST /api/ai/analyze
│   ├── dashboard/
│   │   ├── layout.tsx       → Sidebar + layout principal
│   │   ├── page.tsx         → Vue d'ensemble (stats)
│   │   ├── tasks/page.tsx   → CRUD tâches + bouton IA
│   │   ├── ai/page.tsx      → Historique analyses IA
│   │   └── settings/page.tsx→ Profil Clerk
│   ├── sign-in/             → Page connexion Clerk
│   ├── sign-up/             → Page inscription Clerk
│   ├── layout.tsx           → ClerkProvider + fonts
│   ├── globals.css
│   └── page.tsx             → Landing page
├── components/
│   └── TasksClient.tsx      → Composant tâches interactif
├── lib/
│   └── prisma.ts            → Client Prisma singleton
├── prisma/
│   └── schema.prisma        → Modèles User, Note, AI_Insight
├── middleware.ts             → Protection routes Clerk
└── .env.example             → Template variables d'env
```

---

## 🔑 Commandes utiles
```bash
npm run dev          # Démarrer en dev
npm run build        # Build production
npm run db:migrate   # Créer/migrer la BDD
npm run db:push      # Push schema sans migration (dev rapide)
npm run db:studio    # Prisma Studio (interface visuelle BDD)
npm run db:generate  # Régénérer le client Prisma
```

---

## 🌐 Déploiement Vercel
1. Push sur GitHub
2. Importer sur [vercel.com](https://vercel.com)
3. Ajouter les variables d'env dans les settings Vercel
4. Deploy !
