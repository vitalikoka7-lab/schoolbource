# ScholarPass

**Plateforme d'orientation intelligente multi-agents IA** - Trouve les bourses et universités parfaites grâce à l'analyse collaborative de 10 agents spécialisés.

[![Architecture](https://img.shields.io/badge/architecture-multi--agents-blue)](./ARCHITECTURE.md)
[![Database](https://img.shields.io/badge/database-supabase-postgresql-green)](./supabase-schema.sql)
[![Frontend](https://img.shields.io/badge/frontend-vercel-lightgrey)](./frontend/)
[![Backend](https://img.shields.io/badge/backend-nodejs-express-yellow)](./backend/)

---

## 🎯 Vision

ScholarPass n'est **pas un simple formulaire** : c'est un **conseiller d'orientation intelligent** où 10 agents IA travaillent ensemble pour :

1. **Analyser** chaque aspect du profil étudiant (personnel, académique, personnalité, projets)
2. **Comprendre** le projet de vie ("Décris la vie que tu aimerais avoir dans 10 ans")
3. **Recommander** les bourses et universités réellement adaptées
4. **Accompagner** l'étudiant jusqu'à l'obtention de sa bourse

---

## 🤖 Les 10 Agents IA

| # | Agent | Rôle | Trigger |
|---|-------|------|---------|
| 1 | **Profil** | Extrait infos personnelles | Onboarding |
| 2 | **Parcours** | Analyse diplômes & bulletins | Upload docs |
| 3 | **Pays** | Identifie préférences géo | Questions + réponse "10 ans" |
| 4 | **Universités** | Recommande établissements | Profil complété |
| 5 | **Domaine** | Choisit domaine d'études | Question "10 ans" |
| 6 | **Financement** | Évalue besoins financiers | Section financement |
| 7 | **Dossier** | Extrait données documents | Chaque upload |
| 8 | **Personnalité** | Analyse forces/faiblesses | Questions dédiées |
| 9 | **Stratégie** | Calcule chances admission | Profil 80%+ |
| 10 | **Coach (Nova)** | Accompagne en continu | Permanent |

📖 **Documentation complète** : [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js >= 18.0.0
- Compte Supabase (gratuit)
- Clé API Anthropic (Claude)

### 1. Configuration Supabase

```bash
# Dans le dashboard Supabase → SQL Editor
# Exécuter le fichier supabase-schema.sql
```

📄 **Guide complet** : [MIGRATION_SUPABASE.md](./MIGRATION_SUPABASE.md)

### 2. Variables d'Environnement

Créer `backend/.env` :

```bash
SUPABASE_URL=https://ton-projet.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-api03-...
JWT_SECRET=votre_secret_tres_long
NODE_ENV=development
PORT=4000
```

### 3. Installation

```bash
# Backend
cd backend
npm install
npm run dev  # http://localhost:4000

# Frontend (nouveau terminal)
cd frontend
npx serve .  # http://localhost:3000
```

### 4. Données de Démo

```bash
cd backend
npm run seed  # Ajoute 5 bourses exemple
```

---

## 📁 Structure du Projet

```
scholarpass/
├── ARCHITECTURE.md          # Documentation des 10 agents
├── MIGRATION_SUPABASE.md    # Guide migration lowdb → Supabase
├── README.md                # Ce fichier
├── supabase-schema.sql      # Schema complet PostgreSQL + RLS
│
├── backend/
│   ├── config/
│   │   └── db.js            # Client Supabase (à migrer)
│   ├── middleware/
│   │   └── auth.js          # JWT verification
│   ├── routes/
│   │   ├── agents.js        # Endpoints IA (10 agents)
│   │   ├── applications.js  # Gestion candidatures
│   │   ├── auth.js          # Login/Register
│   │   ├── documents.js     # Upload & extraction
│   │   ├── profile.js       # CRUD profil
│   │   └── scholarships.js  # Recherche bourses
│   ├── utils/
│   │   ├── agents.js        # Définition des 10 rôles IA
│   │   └── completion.js    # Calcul % profil
│   ├── server.js            # Point d'entrée API
│   └── package.json
│
└── frontend/
    ├── index.html           # Login/Register
    ├── dashboard.html       # Accueil + stats + recommandations
    ├── profile.html         # Onboarding 6 étapes
    ├── scholarships.html    # Recherche bourses
    ├── universities.html    # (À implémenter)
    ├── dossiers.html        # Suivi candidatures
    ├── cv.html              # CV auto-généré
    ├── forces.html          # Analyse personnalité IA
    ├── js/
    │   ├── api.js           # Client API
    │   └── app.js           # Widget Nova + utilitaires
    ├── css/
    │   └── style.css        # Styles complets
    └── assets/
        └── logo.svg
```

---

## 🔐 Sécurité

- ✅ **Row Level Security (RLS)** sur toutes les tables Supabase
- ✅ **JWT** pour authentification API
- ✅ **Clés API** jamais exposées côté frontend
- ✅ **Storage privé** avec URLs signées
- ✅ **.gitignore complet** inclus

---

## 📊 Fonctionnalités Clés

### Onboarding Progressif
- 6 étapes gamifiées avec % de progression
- Question puissante : "Décris la vie que tu aimerais avoir dans 10 ans"
- Analyse IA en temps réel par Nova (Agent 10)

### Multi-Agents Collaboration
- 10 agents travaillent en parallèle
- Résultats combinés pour recommandations personnalisées
- Scores de compatibilité profil ↔ bourse

### Documents Intelligents
- Upload bulletins, diplômes, CV, lettres
- Extraction automatique des données (Agent 7)
- Détection documents manquants
- CV généré automatiquement

### Coach Personnel (Nova)
- Chat conversationnel toujours disponible
- Rappels dates limites
- Aide rédaction lettres de motivation
- Préparation aux entretiens

---

## 💰 Coûts Estimés

| Service | Plan Gratuit | ~1000 users/mois |
|---------|-------------|------------------|
| Supabase | ✅ Inclus | $0 |
| Anthropic Claude | - | ~$28 |
| Vercel Frontend | ✅ Inclus | $0 |
| **Total** | **$0** | **~$28/mois** |

---

## 🗺️ Roadmap

### ✅ Phase 1 - Fondation (Semaine 1)
- [x] Architecture multi-agents documentée
- [x] Schéma Supabase complet
- [x] .gitignore sécurisé
- [ ] Migration backend lowdb → Supabase
- [ ] Supabase Auth intégré

### 🔄 Phase 2 - Agents Core (Semaine 2)
- [ ] Agent 1 (Profil) + Agent 5 (Domaine)
- [ ] Agent 7 (Extraction documents)
- [ ] Agent 10 (Nova coach) amélioré
- [ ] Endpoint `/api/agents/analyze-all`

### 📅 Phase 3 - Matching & Stratégie (Semaine 3)
- [ ] Agent 3 (Pays) + Agent 4 (Universités)
- [ ] Agent 6 (Financement)
- [ ] Agent 9 (Stratégie + scoring)
- [ ] Algorithme de recommandation v1

### 📅 Phase 4 - Expérience Utilisateur (Semaine 4)
- [ ] Onboarding gamifié complet
- [ ] Dashboard avec scores détaillés
- [ ] Notifications (emails + in-app)
- [ ] Export PDF (CV + dossier)

### 📅 Phase 5 - Production Ready (Semaine 5)
- [ ] Tests unitaires backend
- [ ] Monitoring (logs, erreurs, coûts IA)
- [ ] Optimisation performances
- [ ] Documentation API publique

---

## 🛠️ Technologies

| Couche | Technologie | Pourquoi |
|--------|-----------|----------|
| Frontend | HTML/CSS/JS Vanilla | Léger, pas de build, déploiement instantané |
| Backend | Node.js + Express | Simple, performant, écosystème riche |
| Database | Supabase (PostgreSQL) | Open-source, RLS, Storage, Real-time |
| IA | Anthropic Claude | Meilleur rapport qualité/prix, JSON natif |
| Auth | Supabase Auth + JWT | Sécurisé, gratuit jusqu'à 50k MAU |
| Hosting | Vercel + Render/Railway | Gratuit pour démarrer, scale facile |

---

## 📝 Notes Importantes

1. **RGPD** : Consentement explicite requis pour traitement IA des documents
2. **Suppression compte** : Fonctionnalité obligatoire (implémentée via cascade delete)
3. **Logs agents** : Conservés 30 jours max
4. **Backup** : Automatique via Supabase (plan gratuit inclus)

---

## 🤝 Contribution

1. Fork le projet
2. Crée une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit tes changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvre une Pull Request

---

## 📞 Support & Contact

- 📚 **Docs Supabase** : https://supabase.com/docs
- 🤖 **Docs Anthropic** : https://docs.anthropic.com
- 💬 **Discord Supabase** : https://discord.supabase.com
- 🐛 **Issues GitHub** : https://github.com/ton-repo/scholarpass/issues

---

## 📄 License

MIT License - voir LICENSE pour détails

---

**Prochaines actions immédiates :**

1. ✅ Exécuter `supabase-schema.sql` dans ton projet Supabase
2. ✅ Créer `backend/.env` avec tes clés
3. ✅ Installer `@supabase/supabase-js` : `npm install @supabase/supabase-js`
4. 🔄 Commencer la migration du backend (fichier `config/db.js` en premier)

---

<p align="center">
  <strong>ScholarPass</strong> • L'IA au service de l'orientation étudiante
</p>
