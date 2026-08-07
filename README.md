# ScholarPass

Application d'aide à la recherche de bourses d'études, inspirée de tes
maquettes : tableau de bord, profil progressif type "jeu" (%), dossiers
de candidature, CV auto-généré, et un assistant IA ("Nova") qui
s'appuie sur l'API Claude d'Anthropic pour analyser le profil de
l'étudiant.

## Structure du projet

```
kelasi/
├── backend/     API Node.js / Express (auth, profil, bourses, dossiers, agents IA)
└── frontend/    Pages HTML/CSS/JS (aucune compilation nécessaire)
```

Choix techniques (simples pour démarrer vite, faciles à faire évoluer) :
- **Backend** : Node.js + Express, base de données JSON locale (lowdb) — à remplacer par PostgreSQL/MongoDB quand tu voudras passer en production.
- **Frontend** : HTML/CSS/JS pur, sans étape de build — tu peux l'ouvrir directement dans un navigateur ou le déployer sur n'importe quel hébergeur statique (Vercel, Netlify, GitHub Pages...).
- **IA** : SDK officiel `@anthropic-ai/sdk`, appelé uniquement côté backend — **ta clé API n'est jamais exposée au frontend.**

## 1. Configuration des clés API (sécurisé)

Toutes les clés vivent **uniquement côté backend**, dans un fichier `.env` qui n'est jamais commité (il est dans `.gitignore`).

```bash
cd backend
cp .env.example .env
```

Ouvre `.env` et remplis :
- `ANTHROPIC_API_KEY` → ta clé Claude (console.anthropic.com)
- `JWT_SECRET` → une chaîne aléatoire longue (sert à sécuriser les sessions)

## 2. Lancer le backend

```bash
cd backend
npm install
npm run seed     # ajoute quelques bourses de démonstration
npm run dev       # démarre le serveur sur http://localhost:4000
```

Vérifie que ça fonctionne : http://localhost:4000/api/health doit répondre `{"status":"ok"}`.

## 3. Lancer le frontend

Le frontend est 100% statique. Le plus simple :

```bash
cd frontend
npx serve .
```

(ou utilise l'extension "Live Server" de VS Code, ou n'importe quel serveur statique.)
Par défaut le frontend appelle `http://localhost:4000/api`. Si ton backend tourne
ailleurs, ajoute avant les scripts dans chaque page :
```html
<script>window.SCHOLARPASS_API_URL = "https://ton-backend.com/api";</script>
```

## 4. Pages principales

| Page | Fichier | Description |
|---|---|---|
| Connexion / Inscription | `index.html` | Auth email + mot de passe |
| Accueil | `dashboard.html` | Stats + bourses recommandées |
| Créer/Modifier mon profil | `profile.html` | Assistant en 6 étapes (comme un formulaire "jeu") |
| Bourses | `scholarships.html` | Recherche et candidature |
| Mes Dossiers | `dossiers.html` | Suivi des candidatures par statut |
| Mon Profil / CV | `cv.html` | CV généré automatiquement à partir du profil |
| Forces & Objectifs | `forces.html` | Analyse IA des forces/faiblesses |

Le bouton flottant 💬 (visible sur le tableau de bord) ouvre **Nova**, l'assistant
conversationnel — c'est la façade unique derrière laquelle tournent les "10 agents"
décrits dans ton brief (voir `backend/utils/agents.js`).

## 5. Les "10 agents IA"

Plutôt que de faire tourner 10 systèmes séparés, `backend/utils/agents.js` définit
10 **rôles** (prompts système) que le même modèle Claude peut endosser selon le
besoin : Profil, Parcours scolaire, Pays, Universités, Domaine d'études,
Financement, Dossier intelligent, Personnalité, Stratégie de candidature, Coach
(Nova). C'est une architecture volontairement simple pour démarrer ; tu pourras
la complexifier plus tard (function-calling, agents autonomes qui se déclenchent
entre eux, etc.) une fois le MVP validé.

## 6. Prochaines étapes suggérées

1. Brancher une vraie base de données (PostgreSQL + Prisma est un bon choix) à la place de lowdb.
2. Ajouter l'extraction réelle de texte des documents uploadés (OCR / parsing PDF) avant de les envoyer à l'agent "Dossier".
3. Déployer : backend sur Render/Railway/Fly.io, frontend sur Vercel/Netlify.
4. Ajouter des tests automatisés sur les routes backend.
5. Remplacer le stockage de fichiers local (`backend/uploads`) par un stockage cloud (S3, Cloudinary...) avant la mise en production.

## Sécurité — rappel important

- Ne commit jamais le fichier `.env`.
- Les mots de passe sont hashés avec bcrypt, jamais stockés en clair.
- Les routes sensibles sont protégées par un token JWT.
- Un rate-limiter protège les routes `/api/*` (utile surtout pour `/api/agents`, qui consomme des tokens API payants).
