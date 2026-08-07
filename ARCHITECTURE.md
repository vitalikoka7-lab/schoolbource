# ScholarPass - Architecture Multi-Agents IA

## 🎯 Vision

Plateforme d'orientation intelligente où **10 agents IA spécialisés** collaborent pour analyser le profil complet d'un étudiant et lui proposer les meilleures opportunités de bourses et universités.

---

## 🏗️ Architecture Technique

### Stack Technologique

```
Frontend (Vercel)
├── HTML/CSS/JS Vanilla (léger, rapide)
└── Widget Nova (chat conversationnel)

Backend (Node.js/Express)
├── API RESTful
├── 10 Agents IA (Anthropic Claude)
├── Authentification JWT
└── Orchestration des workflows

Database (Supabase PostgreSQL)
├── Tables relationnelles
├── Row Level Security (RLS)
├── Storage (documents)
└── Real-time subscriptions

IA (Anthropic Claude)
├── 10 rôles spécialisés
├── Parallel processing
└── JSON structured outputs
```

---

## 🤖 Les 10 Agents IA

### Agent 1 - PROFIL (PersonalInfoAgent)
**Rôle** : Extraire et structurer les informations personnelles
- Prénom, âge, nationalité, pays de résidence
- Langues parlées, passeport, besoins particuliers
- **Trigger** : Formulaire onboarding + réponse libre

### Agent 2 - PARCOURS (EducationAgent)
**Rôle** : Analyser le parcours académique
- Diplômes, moyennes, écoles
- Bulletins, diplômes (via OCR/extraction)
- **Trigger** : Upload documents + données formulaire

### Agent 3 - PAYS (CountryPreferenceAgent)
**Rôle** : Identifier les préférences géographiques
- Pays souhaités/refusés
- Francophone/anglophone, climat, distance familiale
- Projet d'immigration post-études
- **Trigger** : Questions dédiées + analyse réponse "10 ans"

### Agent 4 - UNIVERSITÉS (UniversityMatcherAgent)
**Rôle** : Recommander les établissements adaptés
- Public/privé, taille campus, vie étudiante
- Matching avec profil académique
- **Trigger** : Après complétion profil + domaine choisi

### Agent 5 - DOMAINE (FieldOfStudyAgent)
**Rôle** : Identifier le domaine d'études optimal
- Centres d'intérêt, matières préférées
- Projet professionnel, motivation profonde
- **Trigger** : Question "vie dans 10 ans" + parcours

### Agent 6 - FINANCEMENT (ScholarshipFitAgent)
**Rôle** : Évaluer les besoins financiers
- Bourse complète/partielle
- Logement, billet avion, assurance
- **Trigger** : Section financement + profil socio-économique

### Agent 7 - DOSSIER (DocumentExtractorAgent)
**Rôle** : Extraire automatiquement les infos des documents
- OCR + NLP sur bulletins, diplômes, CV
- Détection documents manquants
- Génération CV auto
- **Trigger** : Upload chaque document

### Agent 8 - PERSONNALITÉ (PersonalityInsightAgent)
**Rôle** : Analyser forces, faiblesses, motivations
- Points forts/faibles, qualités/défauts
- Passions, bénévolat, leadership
- **Trigger** : Questions dédiées + analyse rédactionnelle

### Agent 9 - STRATÉGIE (ApplicationStrategyAgent)
**Rôle** : Calculer chances et prioriser candidatures
- Score compatibilité profil ↔ bourse/université
- Documents à améliorer
- Calendrier optimal
- **Trigger** : Profil complété à 80%+

### Agent 10 - COACH (NovaCoachAgent)
**Rôle** : Accompagner l'étudiant en continu
- Chat conversationnel (interface visible)
- Rappels dates limites
- Aide lettres de motivation
- Préparation entretiens
- **Trigger** : Permanent (widget toujours actif)

---

## 📊 Workflow Multi-Agents

```
┌─────────────────────────────────────────────────────────────┐
│                    ÉTUDIANT CRÉE COMPTE                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              QUESTION PUISSANTE : "10 ANS"                   │
│         → Agent 5 (Domaine) + Agent 3 (Pays)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           ONBOARDING PROGRESSIF (6 étapes)                  │
│  1. Info perso → Agent 1                                   │
│  2. Parcours   → Agent 2                                   │
│  3. Compétences → Agent 8                                  │
│  4. Documents  → Agent 7 (extraction auto)                 │
│  5. Objectifs  → Agent 5 + Agent 3                         │
│  6. Financement → Agent 6                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            ANALYSE PARALLÈLE DES 10 AGENTS                  │
│         (tous travaillent simultanément)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 RÉSULTATS COMBINÉS                          │
│  • Profil complet structuré                                 │
│  • CV généré automatiquement                                │
│  • Score de compatibilité par opportunité                   │
│  • Top 10 bourses recommandées                              │
│  • Top 5 universités adaptées                               │
│  • Plan d'action personnalisé                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              ACCOMPAGNEMENT CONTINU (Agent 10)              │
│  • Rappels dates limites                                    │
│  • Aide rédaction lettres                                   │
│  • Simulation entretiens                                    │
│  • Suivi candidatures                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Schéma de Base de Données (Supabase)

### Tables Principales

```sql
-- Utilisateurs (gérés par Supabase Auth)
users (id, email, created_at)

-- Profils étudiants
profiles (
  id, user_id, 
  completion_percentage,
  personal_info JSONB,      -- Agent 1
  education JSONB[],        -- Agent 2
  skills TEXT[],            -- Agent 8
  experiences JSONB[],      -- Agent 8
  goals JSONB,              -- Agent 5
  preferred_countries TEXT[], -- Agent 3
  financial_needs JSONB,    -- Agent 6
  personality_analysis JSONB, -- Agent 8
  created_at, updated_at
)

-- Documents uploadés
documents (
  id, user_id,
  type, original_name, stored_name,
  extracted_data JSONB,     -- Agent 7
  is_processed BOOLEAN,
  uploaded_at
)

-- Bourses
scholarships (
  id, title, provider, country,
  levels TEXT[], field TEXT[],
  deadline, requirements JSONB,
  benefits JSONB,           -- logement, billet, assurance
  active BOOLEAN
)

-- Universités
universities (
  id, name, country, city,
  type (public/private), size,
  campus_life BOOLEAN,
  programs JSONB
)

-- Candidatures
applications (
  id, user_id, scholarship_id/university_id,
  status, progress,
  strategy_score INTEGER,   -- Agent 9
  missing_documents TEXT[],
  created_at, updated_at
)

-- Conversations Nova (Agent 10)
conversations (
  id, user_id,
  messages JSONB[],
  context JSONB,
  updated_at
)

-- Logs d'agents (debug/analytics)
agent_logs (
  id, user_id, agent_name,
  input TEXT, output JSONB,
  tokens_used INTEGER,
  created_at
)
```

---

## 🔐 Sécurité & Bonnes Pratiques

### 1. Row Level Security (Supabase)
```sql
-- Exemple : un utilisateur ne voit que son profil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

### 2. Clés API Sécurisées
- **Jamais** exposées côté frontend
- Stockées dans `.env` backend
- Rotation régulière recommandée

### 3. Validation des Inputs
- Zod ou Joi pour valider tous les payloads
- Sanitization des uploads (type, taille, virus scan)
- Rate limiting sur routes IA (coûteux en tokens)

### 4. Storage Cloud (Supabase Storage)
- Bucket privé `student-documents`
- URLs signées temporaires
- Backup automatique activé

---

## 🚀 Déploiement

### Backend (Render/Railway/Fly.io)
```bash
# Variables d'environnement requises
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
JWT_SECRET=votre_secret_solide
NODE_ENV=production
PORT=4000
```

### Frontend (Vercel)
```bash
# Variables d'environnement
NEXT_PUBLIC_API_URL=https://ton-backend.com/api
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Database (Supabase)
1. Créer projet sur supabase.com
2. Exécuter le script SQL (`supabase-schema.sql`)
3. Configurer RLS policies
4. Créer bucket storage `student-documents`
5. Récupérer URL + clés → `.env` backend

---

## 📈 Roadmap de Développement

### Phase 1 - Fondation (Semaine 1)
- [ ] Setup Supabase (tables + RLS + storage)
- [ ] Migration auth (Supabase Auth vs JWT custom)
- [ ] Refactor routes backend pour PostgreSQL
- [ ] .gitignore complet

### Phase 2 - Agents Core (Semaine 2)
- [ ] Agent 1 (Profil) + Agent 5 (Domaine)
- [ ] Agent 7 (Extraction documents)
- [ ] Agent 10 (Nova coach)
- [ ] Endpoint `/api/agents/analyze-all`

### Phase 3 - Matching & Stratégie (Semaine 3)
- [ ] Agent 3 (Pays) + Agent 4 (Universités)
- [ ] Agent 6 (Financement)
- [ ] Agent 9 (Stratégie + scoring)
- [ ] Algorithme de recommandation

### Phase 4 - Expérience Utilisateur (Semaine 4)
- [ ] Onboarding progressif gamifié
- [ ] Dashboard avec scores et recommandations
- [ ] Notifications (dates limites, nouvelles bourses)
- [ ] Export PDF (CV + dossier complet)

### Phase 5 - Production Ready (Semaine 5)
- [ ] Tests unitaires backend
- [ ] Monitoring (logs, erreurs, coûts IA)
- [ ] Optimisation performances
- [ ] Documentation API

---

## 💰 Estimation Coûts IA

| Agent | Tokens/requête | Requêtes/mois (1000 users) | Coût mensuel* |
|-------|----------------|---------------------------|---------------|
| Agent 1-6 | ~500 tokens | 6 000 | ~$3 |
| Agent 7 (OCR) | ~2000 tokens | 3 000 | ~$6 |
| Agent 8-9 | ~1000 tokens | 2 000 | ~$4 |
| Agent 10 (chat) | ~300 tokens | 30 000 | ~$15 |
| **Total** | | | **~$28/mois** |

*Basé sur Claude Haiku ($0.25/1M tokens input + $1.25/1M output)

---

## 🎯 Métriques de Succès

- **Taux de complétion profil** > 70%
- **Temps moyen onboarding** < 8 minutes
- **Score satisfaction Nova** > 4.5/5
- **Taux de conversion** (visite → candidature) > 15%
- **Coût IA par utilisateur** < $0.50

---

## 📝 Notes Importantes

1. **Ne jamais commiter** `.env`, `node_modules/`, `uploads/`
2. **Backup quotidien** Supabase activé
3. **Logs d'agents** conservés 30 jours max (RGPD)
4. **Consentement explicite** pour traitement IA des documents
5. **Option "supprimer mon compte"** obligatoire (RGPD)

---

**Prochaines actions immédiates :**
1. Fournir ton code SQL Supabase → j'adapte le schéma
2. Valider cette architecture → je commence le refactoring
3. Décider : on garde JWT custom ou migration Supabase Auth ?
