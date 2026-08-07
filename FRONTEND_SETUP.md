# 🚀 Configuration Supabase - Frontend Next.js

## ✅ Fichiers Créés

Votre frontend a été configuré avec Next.js et Supabase. Voici les fichiers ajoutés :

### 1. Variables d'environnement
**Fichier:** `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://kyyzpggpfcijglqfbvjh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_kxbx9vKM-9d5EwDOPWE9xQ_Ldk8WXYW
```

### 2. Clients Supabase
- **`utils/supabase/client.ts`** - Client pour le navigateur (composants client)
- **`utils/supabase/server.ts`** - Client pour le serveur (Server Components)
- **`utils/supabase/middleware.ts`** - Client pour le middleware (gestion des sessions)

### 3. Middleware
**Fichier:** `middleware.ts`
- Gère automatiquement les sessions utilisateur
- Rafraîchit les cookies de session

### 4. Configuration Next.js
- `package.json` - Dépendances installées
- `tsconfig.json` - Configuration TypeScript
- `next.config.js` - Configuration Next.js
- `tailwind.config.ts` - Configuration Tailwind CSS
- `.gitignore` - Ignore les fichiers sensibles

## 📦 Installation

Exécutez cette commande pour installer les dépendances :

```bash
cd /workspace/frontend
npm install
```

## ▶️ Démarrage du projet

Après l'installation, démarrez le serveur de développement :

```bash
npm run dev
```

Le frontend sera accessible sur **http://localhost:3000**

## 🔧 Utilisation dans vos composants

### Dans un Server Component (par défaut)
```tsx
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function MaPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: user } = await supabase.auth.getUser()
  
  return <div>Bonjour {user?.user?.email}</div>
}
```

### Dans un Client Component
```tsx
'use client'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function MonComposant() {
  const [user, setUser] = useState(null)
  const supabase = createClient()
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])
  
  return <div>Bonjour {user?.email}</div>
}
```

## 📝 Migration depuis l'ancien frontend HTML

Vos fichiers HTML existants (`index.html`, `dashboard.html`, etc.) doivent être convertis en composants React/Next.js. 

Voici la structure recommandée :
```
frontend/
├── app/
│   ├── page.tsx              # Page d'accueil (/)
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard (/dashboard)
│   ├── profile/
│   │   └── page.tsx          # Profil (/profile)
│   ├── dossiers/
│   │   └── page.tsx          # Dossiers (/dossiers)
│   └── layout.tsx            # Layout global
├── components/               # Composants réutilisables
├── utils/supabase/           # Clients Supabase
└── .env.local                # Variables d'environnement
```

## 🔐 Authentification

Pour implémenter l'authentification :

1. Créez une page de connexion `/app/login/page.tsx`
2. Utilisez `supabase.auth.signInWithPassword()`
3. Le middleware gérera automatiquement la session

Exemple de connexion :
```tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'utilisateur@email.com',
  password: 'motdepasse'
})
```

## 📚 Ressources

- [Documentation Supabase SSR](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Guide d'authentification](https://supabase.com/docs/guides/auth)
