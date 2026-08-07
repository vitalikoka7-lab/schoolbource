# ScholarPass - Guide de Migration vers Supabase

## 🎯 Objectif

Migrer l'application de lowdb (fichier JSON local) vers Supabase (PostgreSQL cloud) pour une architecture production-ready.

---

## 📋 Prérequis

1. **Compte Supabase** créé sur https://supabase.com
2. **Projet Supabase** initialisé
3. **Clés API** récupérées depuis Settings → API

---

## 🚀 Étapes de Migration

### Étape 1: Setup Base de Données

1. **Aller dans le Dashboard Supabase**
   - Sélectionner ton projet
   - Aller dans "SQL Editor"

2. **Exécuter le schéma SQL**
   - Copier le contenu de `supabase-schema.sql`
   - Coller dans l'éditeur SQL
   - Exécuter (bouton "Run")

3. **Vérifier la création des tables**
   - Aller dans "Table Editor"
   - Confirmer la présence de :
     - `profiles`
     - `documents`
     - `scholarships`
     - `universities`
     - `applications`
     - `conversations`
     - `agent_logs`

4. **Configurer Supabase Storage**
   - Aller dans "Storage"
   - Créer un nouveau bucket : `student-documents`
   - Cocher "Private bucket"
   - Sauvegarder

---

### Étape 2: Variables d'Environnement

Créer `/backend/.env` avec :

```bash
# Clés Supabase
SUPABASE_URL=https://ton-projet.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clés IA
ANTHROPIC_API_KEY=sk-ant-api03-...

# Sécurité
JWT_SECRET=votre_secret_tres_long_et_aleatoire_minimum_32_caracteres
NODE_ENV=development
PORT=4000

# URLs (pour production)
FRONTEND_URL=http://localhost:3000
```

⚠️ **Important** : 
- `SUPABASE_ANON_KEY` : utilisée côté frontend (sécurisée par RLS)
- `SUPABASE_SERVICE_ROLE_KEY` : utilisée UNIQUEMENT côté backend (bypass RLS)
- **Jamais** commiter ce fichier `.env`

---

### Étape 3: Installer Dépendances Supabase

```bash
cd backend
npm install @supabase/supabase-js
```

---

### Étape 4: Refactor Backend (à venir)

Les fichiers suivants seront modifiés :

1. **`config/db.js`** → Remplacer lowdb par client Supabase
2. **`routes/auth.js`** → Migration vers Supabase Auth
3. **Toutes les routes** → Adapter les queries SQL

---

## 🔐 Configuration Row Level Security (RLS)

Le script SQL inclut déjà des policies RLS. Pour vérifier :

1. **Aller dans "Authentication" → "Policies"**
2. **Vérifier chaque table** :
   - `profiles` : policies pour select/insert/update
   - `documents` : policies complètes CRUD
   - `applications` : policies complètes CRUD
   - etc.

3. **Tester la sécurité** :
   ```sql
   -- Cette requête doit échouer sans authentification
   SELECT * FROM profiles;
   
   -- Cette requête doit retourner seulement le profil de l'user connecté
   SELECT * FROM profiles WHERE user_id = auth.uid();
   ```

---

## 📦 Storage : Configuration Avancée

### Policy pour le bucket `student-documents`

Dans Storage → Policies, ajouter :

```sql
-- Les utilisateurs peuvent uploader leurs propres fichiers
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Les utilisateurs peuvent voir leurs propres fichiers
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Les utilisateurs peuvent supprimer leurs propres fichiers
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'student-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Upload avec dossier utilisateur

Structure recommandée :
```
student-documents/
├── {user-id-1}/
│   ├── bulletins/
│   ├── diplomes/
│   └── cv.pdf
├── {user-id-2}/
│   └── ...
```

---

## 🧪 Tests de Validation

### 1. Tester la connexion database

```bash
cd backend
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
supabase.from('scholarships').select('*').then(console.log);
"
```

Doit retourner les 5 bourses de démo.

### 2. Tester l'authentification

Via API ou dashboard Supabase → Authentication → Users

### 3. Tester RLS

Créer deux users et vérifier qu'ils ne voient pas les données l'un de l'autre.

---

## 🔄 Migration des Données Existantes

Si tu as déjà des données dans `backend/data/db.json` :

### Script de migration (à créer)

```javascript
// migrate-lowdb-to-supabase.js
const lowdbData = require('./data/db.json');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(URL, SERVICE_ROLE_KEY);

async function migrate() {
  // Migrer users
  for (const user of lowdbData.users) {
    // ... logic de migration
  }
  
  // Migrer profiles
  // Migrer scholarships
  // etc.
}

migrate();
```

⚠️ **Note** : Pour la première version, il est plus simple de repartir de zéro.

---

## 🎛️ Dashboard Supabase - Fonctionnalités Utiles

### 1. Table Editor
- Voir/modifier les données en temps réel
- Filtrer, trier, exporter CSV

### 2. SQL Editor
- Requêtes personnalisées
- Scripts de migration
- Vues matérialisées

### 3. API Docs
- Génère automatiquement la documentation OpenAPI
- Test des endpoints directement depuis le dashboard

### 4. Logs
- Voir toutes les requêtes API
- Debug des erreurs
- Analytics d'utilisation

### 5. Authentication
- Gestion des users
- Magic links, SSO, etc.
- Audit logs

---

## 💰 Coûts Estimés

### Plan Gratuit (Hobby)
- **Database** : 500 MB inclus
- **Storage** : 1 GB inclus
- **Bandwidth** : 2 GB/mois
- **Auth** : 50k MAU gratuits
- ** Suffisant pour** : ~1000-2000 utilisateurs actifs

### Plan Pro ($25/mois)
- **Database** : 8 GB
- **Storage** : 100 GB
- **Bandwidth** : 250 GB/mois
- **Email** : Inclus (pas de limite)
- ** Suffisant pour** : ~10k-20k utilisateurs

---

## 🔧 Dépannage Courant

### Erreur : "permission denied for table"
→ Vérifier que RLS est activé et les policies correctes

### Erreur : "relation does not exist"
→ Le schema SQL n'a pas été exécuté correctement

### Erreur : "Invalid API key"
→ Vérifier que tu utilises la bonne clé (anon vs service_role)

### Uploads qui échouent
→ Vérifier les policies du bucket Storage
→ Vérifier la taille max (défaut : 50MB)

---

## ✅ Checklist Finale

- [ ] Schema SQL exécuté avec succès
- [ ] Toutes les tables visibles dans Table Editor
- [ ] Bucket Storage `student-documents` créé
- [ ] Policies RLS configurées et testées
- [ ] Fichier `.env` créé avec toutes les clés
- [ ] Dépendances Supabase installées (`@supabase/supabase-js`)
- [ ] Connexion backend testée
- [ ] Authentification fonctionnelle
- [ ] Un utilisateur test créé
- [ ] Données de démo (scholarships) présentes

---

## 📞 Support

- **Docs Supabase** : https://supabase.com/docs
- **Discord Communauté** : https://discord.supabase.com
- **GitHub Issues** : https://github.com/supabase/supabase

---

**Prochaine étape** : Une fois cette migration complétée, attaquer le refactoring du backend pour utiliser Supabase au lieu de lowdb.
