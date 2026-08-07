# 🚀 Migration Backend - ScholarPass vers Supabase

## ✅ Ce qui a été fait

### 1. **Configuration**
- `package.json` mis à jour (v2.0.0) avec `@supabase/supabase-js`
- `.env` et `.env.example` créés avec tes identifiants Supabase
- `lowdb` supprimé des dépendances

### 2. **Database (config/db.js)**
Nouveau module avec :
- Client Supabase configuré
- Helpers : `getUserById()`, `createProfile()`, `updateProfileSection()`, `computeCompletion()`
- Gestion d'erreurs complète

### 3. **Routes migrées**

| Fichier | Status | Changements |
|---------|--------|-------------|
| `routes/auth.js` | ✅ OK | Supabase Auth (signInWithPassword, admin.createUser) |
| `routes/profile.js` | ✅ OK | Lecture/écriture via Supabase |
| `routes/scholarships.js` | ✅ OK | Filtres + recommandations |
| `routes/applications.js` | ✅ OK | CRUD complet avec jointures |
| `routes/documents.js` | ✅ OK | Supabase Storage + presigned URLs |
| `routes/agents.js` | ✅ OK | IA + sauvegarde auto dans Supabase |
| `server.js` | ✅ OK | Logs de connexion, meilleure gestion erreurs |

---

## 📋 TODO - Actions Requises

### 1. Récupérer ta SUPABASE_SERVICE_ROLE_KEY

Va dans ton dashboard Supabase :
```
https://supabase.com/dashboard/project/kyyzpggpfcijglqfbvjh/settings/api
```

Copie la clé **service_role** (pas anon/public !) et remplace-la dans `.env` :

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...TA_VRAIE_CLE_ICI
```

### 2. Exécuter le schema SQL dans Supabase

1. Va dans : https://supabase.com/dashboard/project/kyyzpggpfcijglqfbvjh/sql/new
2. Copie-colle le contenu de `/workspace/supabase-schema.sql`
3. Clique sur **Run**

⚠️ **Important** : Vérifie que les tables sont créées :
- `profiles`
- `documents`
- `scholarships`
- `universities`
- `applications`
- `conversations`
- `agent_logs`

### 3. Créer le bucket Storage

Dans Supabase Dashboard :
```
Storage → Create new bucket
Nom: documents
Public: false (privé)
File size limit: 10MB
Allowed MIME types: application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

### 4. Ajouter ta clé Anthropic

Dans `.env`, remplace :
```env
ANTHROPIC_API_KEY=sk-ant-api03-TA_VRAIE_CLE_ANTHROPIC_ICI
```

### 5. Tester le serveur

```bash
cd /workspace/backend
npm run dev
```

Tu devrais voir :
```
✅ ScholarPass backend (Supabase) démarré sur http://localhost:4000
📊 Connected to Supabase: OK
🤖 Anthropic API: OK
```

---

## 🧪 Tests rapides

### Health check
```bash
curl http://localhost:4000/api/health
```

### Inscription (si Supabase Auth configuré)
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🔐 Sécurité

### Variables sensibles dans .env (NE PAS COMMITER)
- `SUPABASE_SERVICE_ROLE_KEY` - Clé admin (contourne RLS)
- `ANTHROPIC_API_KEY` - Clé API IA
- `JWT_SECRET` - Secret pour les tokens

### Fichiers à ajouter à .gitignore
Vérifie que `/workspace/.gitignore` contient :
```
.env
node_modules/
uploads/
*.log
.DS_Store
```

---

## 🐛 Dépannage

### Erreur "Variables SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquantes"
→ Vérifie que `.env` existe et est bien chargé

### Erreur "Invalid API key" (Supabase)
→ La SERVICE_ROLE_KEY est incorrecte, récupère-la depuis le dashboard

### Erreur "relation 'profiles' does not exist"
→ Le schema SQL n'a pas été exécuté dans Supabase

### Erreur "bucket not found" (documents)
→ Crée le bucket `documents` dans Storage

---

## 📊 Architecture finale

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Frontend   │────▶│  Backend     │────▶│  Supabase   │
│  (Vercel)   │     │  (Node.js)   │     │  (Postgres) │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  Anthropic   │     │  Storage    │
                    │  (Claude IA) │     │  (Buckets)  │
                    └──────────────┘     └─────────────┘
```

---

## 🎯 Prochaines étapes

1. ✅ Récupérer SERVICE_ROLE_KEY
2. ✅ Exécuter supabase-schema.sql
3. ✅ Créer bucket Storage
4. ✅ Ajouter ANTHROPIC_API_KEY
5. ✅ Tester avec `npm run dev`
6. 🔄 Migrer les données existantes (si besoin)
7. 🔄 Déployer sur Vercel + Supabase Production
