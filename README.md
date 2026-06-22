# STREAMIX — Plateforme de Streaming Vidéo

STREAMIX est une plateforme de streaming vidéo full-stack inspirée de YouTube. Les utilisateurs peuvent uploader des vidéos, les regarder en qualité adaptative (HLS), commenter, ajouter en favoris et suivre leur historique de visionnage. Un panneau d'administration permet de modérer les contenus.

---

## Fonctionnalités

- **Streaming HLS adaptatif** — les vidéos sont converties en 3 qualités (1080p / 720p / 480p) via FFmpeg
- **Lecteur vidéo custom** — contrôles complets, sélection de qualité manuelle, raccourcis clavier, picture-in-picture
- **Authentification JWT** — inscription, connexion, token d'accès signé
- **Rôles** — utilisateur standard et administrateur
- **Upload vidéo** — conversion HLS automatique à l'upload
- **Commentaires** — publication instantanée
- **Favoris & historique** — suivi de la progression de visionnage
- **Recherche** — recherche textuelle insensible aux accents
- **Panel admin** — modération des commentaires, gestion des utilisateurs et genres

---

## Stack technique

| Côté | Technologie |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, React Router 7, Axios, HLS.js |
| Backend | Node.js 20, Express 5, TypeScript |
| Base de données | PostgreSQL + Prisma 7 |
| Vidéo | FFmpeg (ffmpeg-static), HLS multi-renditions |
| Auth | JWT (jsonwebtoken), bcrypt |
| Sécurité | Helmet, express-rate-limit, CORS |

---

## Prérequis

- **Node.js** 20+
- **PostgreSQL** 14+ en cours d'exécution en local
- FFmpeg est inclus via `ffmpeg-static` — pas d'installation manuelle nécessaire

---

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/Takidoo/Fil-Rouge-Dev.git
cd Fil-Rouge-Dev
```

### 2. Backend

```bash
cd backend
npm install
```

Créer le fichier `backend/.env` :

```env
DATABASE_URL="postgresql://postgres:motdepasse@localhost:5432/streamix"
JWT_SECRET="une-cle-secrete-longue-et-aleatoire"
NODE_ENV="development"
PORT=3000
ALLOWED_ORIGIN="http://localhost:5173"
```

Initialiser la base de données et insérer les genres :

```bash
npx prisma migrate dev
npm run db:seed
```

Démarrer le serveur :

```bash
npm run dev
# API disponible sur http://localhost:3000
```

### 3. Frontend

Dans un second terminal :

```bash
cd frontend
npm install
npm run dev
# Application disponible sur http://localhost:5173
```

> Le proxy Vite redirige automatiquement les appels `/auth`, `/video`, `/comment`, etc. vers `http://localhost:3000` — aucune configuration supplémentaire nécessaire.

---

## Structure du projet

```
Fil-Rouge-Dev/
├── backend/
│   ├── src/
│   │   ├── server.ts          # Point d'entrée
│   │   ├── app.ts             # Configuration Express
│   │   ├── config/            # Variables d'env, chemins
│   │   ├── controllers/       # Gestion des requêtes HTTP
│   │   ├── services/          # Logique métier
│   │   ├── repositories/      # Accès base de données (Prisma)
│   │   ├── middlewares/       # Auth, erreurs, validation
│   │   ├── validators/        # Schémas Zod
│   │   ├── utils/             # HLS, logger, JWT
│   │   └── db/                # Client Prisma
│   ├── prisma/
│   │   ├── schema.prisma      # Modèle de données
│   │   ├── seed.ts            # Données initiales (genres)
│   │   └── migrations/        # Historique des migrations
│   └── videos/                # Stockage local (originaux + HLS)
│
└── frontend/
    └── src/
        ├── pages/             # Vues (Home, VideoPage, Login…)
        ├── components/        # Composants réutilisables
        ├── api/               # Client Axios + interceptors
        ├── contexts/          # AuthContext
        ├── hooks/             # Hooks custom
        ├── types/             # Types TypeScript
        └── utils/             # Helpers
```

---

## Architecture back-end

Le backend suit une **architecture en couches** :

```
Requête HTTP
    ↓
  Route         →  définit l'endpoint et appelle le controller
    ↓
  Controller    →  valide les données d'entrée (Zod)
    ↓
  Service       →  logique métier
    ↓
  Repository    →  requêtes Prisma / PostgreSQL
```

---

## API — Principaux endpoints

### Authentification
| Méthode | Route | Description |
|---|---|---|
| POST | `/auth/register` | Créer un compte |
| POST | `/auth/login` | Connexion — retourne un JWT |
| POST | `/auth/logout` | Déconnexion |

### Vidéos
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/video` | — | Liste toutes les vidéos |
| GET | `/video/search?q=` | — | Recherche |
| GET | `/video/:id` | — | Détail d'une vidéo |
| POST | `/video` | ✓ | Upload + conversion HLS |
| PUT | `/video/:id` | ✓ | Modifier (propriétaire) |
| DELETE | `/video/:id` | ✓ | Supprimer (propriétaire ou admin) |

### Commentaires
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/comment/video/:id` | — | Commentaires d'une vidéo |
| POST | `/comment/video/:id` | ✓ | Poster un commentaire |
| DELETE | `/comment/:id` | ✓ | Supprimer |

### Utilisateur
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/user/profile` | ✓ | Profil courant |
| PUT | `/user/profile` | ✓ | Modifier le profil |
| GET | `/user/favorites` | ✓ | Mes favoris |
| GET | `/user/history` | ✓ | Mon historique |

### Admin
| Méthode | Route | Admin | Description |
|---|---|---|---|
| GET | `/admin/users` | ✓ | Liste des utilisateurs |
| DELETE | `/admin/users/:id` | ✓ | Supprimer un utilisateur |
| PATCH | `/admin/comment/:id` | ✓ | Modérer un commentaire |

---

## Conversion vidéo HLS

À chaque upload, FFmpeg génère automatiquement 3 renditions :

```
vidéo originale (MP4)
        ↓
   FFmpeg (ffmpeg-static)
        ↓
┌───────────────────────────┐
│  1080p — 5000 kbps        │
│   720p — 2800 kbps        │
│   480p — 1400 kbps        │
└───────────────────────────┘
        ↓
  index.m3u8  (master playlist)
        ↓
  HLS.js — sélection automatique ou manuelle de la qualité
```

---

## Variables d'environnement (`backend/.env`)

| Variable | Obligatoire | Défaut | Description |
|---|---|---|---|
| `DATABASE_URL` | ✓ | — | Connexion PostgreSQL |
| `JWT_SECRET` | ✓ | — | Clé de signature des tokens |
| `NODE_ENV` | — | `development` | Environnement |
| `PORT` | — | `3000` | Port du serveur |
| `ALLOWED_ORIGIN` | — | `http://localhost:5173` | Origine CORS autorisée |

---

## Sécurité

- Mots de passe hachés avec **bcrypt** (12 salt rounds)
- Tokens JWT expiration **8 heures**
- **Rate limiting** — 20 requêtes / 15 min par IP
- Headers sécurisés via **Helmet**
- Validation de toutes les entrées avec **Zod**

---

Projet Fil Rouge — Ynov B2 — 2025/2026
