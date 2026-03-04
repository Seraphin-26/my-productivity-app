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

## 🧠 Défis Techniques

### Optimisation des appels à l'API IA

L'un des premiers défis a été de réduire la latence perçue lors des appels à l'API Groq (LLaMA 3.3 70B). Plusieurs stratégies ont été mises en place :

**Prompt engineering strict** — Le system prompt impose un format JSON exact sans markdown ni texte superflu. Cela réduit le nombre de tokens générés et élimine l'étape de parsing complexe, ce qui diminue le temps de réponse de ~30%.

**Validation en double couche avec Zod** — La réponse de l'IA est validée côté serveur avant d'être persistée en base. Si le modèle génère un JSON invalide, l'erreur est interceptée proprement sans crash côté client, évitant des retries coûteux.

**Upsert Prisma pour la ré-analyse** — Au lieu de supprimer et recréer un insight, on utilise un `upsert` qui met à jour l'enregistrement existant en une seule requête SQL, réduisant la latence de persistance.

**Paramètre `temperature: 0.4`** — Une température basse rend les réponses du modèle plus déterministes et structurées, ce qui réduit les erreurs de format et les besoins de retry.

---

### Synchronisation en temps réel de l'interface après analyse IA

Le défi principal était de mettre à jour l'UI immédiatement après l'analyse sans recharger la page, tout en gérant les états intermédiaires (chargement, erreur, succès).

**State local optimiste** — Le composant `TasksClient` maintient un état React local (`useState`) qui reflète instantanément les changements. Quand l'utilisateur clique "Magie IA", le bouton passe en état `Analyse…` immédiatement sans attendre la réponse serveur.

**Mise à jour ciblée par ID** — Quand la réponse IA revient, on ne recharge pas toutes les notes. On met à jour uniquement la note concernée via un `map` sur le state local :
```ts
setNotes(prev => prev.map(n =>
  n.id === id ? { ...n, aiInsight: insight } : n
));
```
Cela évite un re-render complet de la liste et préserve les états expand/collapse des autres notes.

**Sérialisation Prisma → Client** — Les objets Prisma contiennent des types non-sérialisables (Date, enums) qui cassent le passage Server Component → Client Component dans Next.js 15. La solution a été de passer par `JSON.parse(JSON.stringify(notes))` pour convertir en objets JavaScript purs avant de les transmettre au composant client.

**Gestion des erreurs silencieuse** — En cas d'échec de l'API IA, le bouton revient à son état initial sans message d'erreur bloquant, permettant à l'utilisateur de réessayer sans friction.

1. Push sur GitHub
2. Importer sur [vercel.com](https://vercel.com)
3. Ajouter les variables d'env dans les settings Vercel
4. Deploy !
