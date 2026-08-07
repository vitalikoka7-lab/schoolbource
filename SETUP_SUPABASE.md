# 🚀 Configuration de Supabase pour ScholarPass

## ✅ Identifiants déjà configurés

Votre projet Supabase est configuré avec les informations suivantes :

- **Projet ID** : `kyyzpggpfcijglqfbvjh`
- **URL Supabase** : `https://kyyzpggpfcijglqfbvjh.supabase.co`
- **Publishable Key (Anon)** : `sb_publishable_kxbx9vKM-9d5EwDOPWE9xQ_Ldk8WXYW`

---

## ⚠️ Actions Requises

### 1. Récupérer la SERVICE_ROLE_KEY (Obligatoire)

La clé que vous avez fournie est la clé **publishable** (publique). Pour le backend, vous avez besoin de la **service_role key** (secrète).

**Comment la récupérer :**

1. Allez sur https://supabase.com/dashboard/project/kyyzpggpfcijglqfbvjh
2. Cliquez sur **Settings** (roue dentée en bas à gauche)
3. Cliquez sur **API** dans le menu
4. Copiez la **service_role key** (clé secrète - ne jamais partager)
5. Collez-la dans `/backend/.env` à la ligne `SUPABASE_SERVICE_ROLE_KEY`

### 2. Définir le mot de passe PostgreSQL

Dans votre fichier `.env`, remplacez `[YOUR-PASSWORD]` par votre mot de passe réel :

```bash
DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@db.kyyzpggpfcijglqfbvjh.supabase.co:5432/postgres
```

Pour trouver votre mot de passe :
1. Dashboard Supabase → Settings → Database
2. Cliquez sur "Reveal database password"

### 3. Initialiser le schéma de base de données

Exécutez le fichier SQL dans Supabase :

1. Dashboard Supabase → SQL Editor
2. Copiez le contenu de `/workspace/supabase-schema.sql`
3. Collez et exécutez ("Run")

Cela créera toutes les tables nécessaires :
- `profiles`
- `documents`
- `scholarships`
- `universities`
- `applications`
- `conversations`
- `agent_logs`

### 4. Configurer Supabase Storage

Pour le stockage des documents :

1. Dashboard Supabase → Storage
2. Créez un nouveau bucket nommé : `student-documents`
3. Cochez "Private bucket"
4. Sauvegardez

---

## 🔧 CLI Setup (Optionnel)

Si vous voulez utiliser la CLI Supabase :

```bash
# Installation
npm install -g supabase

# Connexion
supabase login

# Initialisation du projet
cd /workspace/backend
supabase init

# Lier au projet
supabase link --project-ref kyyzpggpfcijglqfbvjh
```

---

## 📁 Fichier .env Final

Après configuration, votre `/backend/.env` doit ressembler à :

```bash
# Configuration Supabase
SUPABASE_URL=https://kyyzpggpfcijglqfbvjh.supabase.co
SUPABASE_ANON_KEY=sb_publishable_kxbx9vKM-9d5EwDOPWE9xQ_Ldk8WXYW
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (votre vraie clé)

# Connection string PostgreSQL
DATABASE_URL=postgresql://postgres:VotreMotDePasse123@db.kyyzpggpfcijglqfbvjh.supabase.co:5432/postgres

# Configuration Backend
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5500

# JWT Secret (génère-en un aléatoire)
JWT_SECRET=votre_secret_tres_long_et_aleatoire_minimum_32_caracteres

# API Keys
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## ▶️ Démarrage du Backend

```bash
cd /workspace/backend
npm install
npm start
```

Le serveur démarrera sur http://localhost:4000

---

## 🧪 Vérification

Après démarrage, vérifiez que tout fonctionne :

```bash
curl http://localhost:4000/api/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2025-...",
  "version": "2.0.0-supabase"
}
```

---

## 📝 Notes Importantes

- ⚠️ **Ne jamais commiter** le fichier `.env` dans Git
- ⚠️ La `service_role_key` bypass les règles RLS - à garder secrète
- ✅ La `anon_key` peut être utilisée côté frontend (sécurisée par RLS)
- 🔄 Les clés API Anthropic sont optionnelles pour les fonctionnalités IA
