# STREAMIX - Plateforme de Diffusion Vidéo

Une plateforme moderne de diffusion vidéo construite avec Express, React et Prisma. Diffusez des vidéos en HLS, gérez votre bibliothèque personnelle et interagissez avec la communauté grâce aux commentaires et à la découverte par genre.

## Stack Technologique

### Backend
- **Framework**: Express 5
- **Base de données**: PostgreSQL (via Prisma 7 avec @prisma/adapter-pg)
- **Langage**: TypeScript 6
- **Validation**: Zod 4
- **Authentification**: JWT + bcrypt
- **Traitement vidéo**: fluent-ffmpeg + ffmpeg-static (conversion HLS)
- **Sécurité**: Helmet (CSP), express-rate-limit

### Frontend
- **Framework**: React 19
- **Outil de build**: Vite 8
- **Langage**: TypeScript 6
- **Routage**: React Router 7
- **Client HTTP**: Axios
- **Lecteur vidéo**: HLS.js

## Fonctionnalités

- 🎬 **Diffusion vidéo**: Livraison vidéo basée sur HLS avec conversion à la demande
- 👤 **Comptes utilisateur**: Inscription, connexion, gestion de profil
- 🎯 **Organisation par genre**: Parcourir et filtrer les vidéos par genre
- 💬 **Commentaires**: Commenter directement les vidéos (publication instantanée)
- 🔍 **Recherche**: Recherche textuelle insensible aux accents sur les titres et descriptions
- 🎬 **Téléversement vidéo**: Les utilisateurs peuvent télécharger, convertir et gérer leurs vidéos
- 👮 **Panneau administrateur**: Gestion des utilisateurs et des capacités de modération
- 📱 **Interface réactive**: Interface adaptée aux mobiles avec proxy du serveur de développement Vite

## Structure du projet

```
.
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Configuration de l'app Express
│   │   ├── server.ts              # Point d'entrée du serveur
│   │   ├── config/                # Configuration (env, chemins, constantes)
│   │   ├── controllers/           # Handlers des routes
│   │   ├── services/              # Logique métier
│   │   ├── repositories/          # Couche d'accès aux données
│   │   ├── middlewares/           # Middlewares Express
│   │   ├── validators/            # Schémas Zod
│   │   ├── types/                 # Types TypeScript
│   │   ├── utils/                 # Helpers (auth, logging, HLS, etc.)
│   │   └── db/                    # Client Prisma
│   ├── prisma/
│   │   ├── schema.prisma          # Schéma de base de données
│   │   ├── seed.ts                # Peuplement initial
│   │   └── migrations/            # Historique des migrations
│   ├── videos/                    # Stockage média (HLS, originaux, miniatures)
│   └── dist/                      # Sortie compilée
│
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Composants de pages
│   │   ├── components/            # Composants réutilisables
│   │   ├── api/                   # Client API
│   │   ├── hooks/                 # Hooks React personnalisés
│   │   ├── contexts/              # Contextes React
│   │   ├── types/                 # Types TypeScript
│   │   ├── utils/                 # Helpers
│   │   ├── constants/             # Constantes de l'app
│   │   └── App.tsx                # Composant racine
│   ├── public/                    # Ressources statiques
│   └── dist/                      # Sortie de build
│
└── ARCHITECTURE.md                # Guide d'architecture détaillé
```

## Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- FFmpeg (pour la conversion vidéo HLS)

#### Backend

```bash
cd backend
npm install
```

Créer `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/streamix"
JWT_SECRET="votre-cle-secrete-ici"
NODE_ENV="development"
PORT=3000
```

Initialiser la base de données:
```bash
npx prisma migrate dev
npx prisma db seed
```

Démarrer le serveur de développement:
```bash
npm run dev
```

Compiler:
```bash
npm run build
```

#### Frontend

```bash
cd frontend
npm install
```

Démarrer le serveur de développement:
```bash
npm run dev
```

Compiler:
```bash
npm run build
```

## Aperçu de l'API

### Authentification
- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Obtenir un token JWT
- `POST /auth/logout` - Terminer la session

### Vidéos
- `GET /video` - Lister toutes les vidéos
- `POST /video` - Téléverser une nouvelle vidéo (authentifiée)
- `GET /video/:id` - Obtenir les détails d'une vidéo
- `PUT /video/:id` - Mettre à jour une vidéo (propriétaire uniquement)
- `DELETE /video/:id` - Supprimer une vidéo (propriétaire ou admin)
- `GET /video/search?q=...` - Rechercher des vidéos

### Commentaires
- `GET /comment/video/:videoId` - Obtenir les commentaires d'une vidéo
- `POST /comment/video/:videoId` - Créer un commentaire (authentifié)
- `DELETE /comment/:id` - Supprimer un commentaire (auteur ou admin)

### Genres
- `GET /genre` - Lister tous les genres
- `POST /genre` - Créer un genre (admin uniquement)

### Utilisateurs
- `GET /user/profile` - Obtenir l'utilisateur courant
- `PUT /user/profile` - Mettre à jour le profil (authentifié)
- `GET /user` - Lister les utilisateurs (admin uniquement)
- `DELETE /user/:id` - Supprimer un utilisateur (admin uniquement)

### Admin
- `GET /admin/users` - Statistiques du tableau de bord

## Points clés de l'architecture

### Architecture en couches
- **Controllers**: Gestion des requêtes/réponses HTTP
- **Services**: Logique métier et validation
- **Repositories**: Abstraction de la base de données
- **Middleware**: Préoccupations transversales (auth, validation, erreurs)

### Sécurité
- **Authentification**: JWT avec expiration 8 heures
- **Mots de passe**: Hachage bcrypt (12 salt rounds)
- **Autorisation**: Contrôle d'accès basé sur les rôles (ADMIN/USER)
- **CORS**: Configuré pour l'origine du frontend
- **Rate Limiting**: Fenêtres 15 minutes, 20 requêtes par IP
- **CSP**: Helmet avec headers de sécurité média

### Traitement vidéo
- **Format**: HLS (HTTP Live Streaming)
- **Codec**: H.264 (libx264)
- **Résolution**: 1280x720 (mise à l'échelle adaptative)
- **Segments**: Fichiers TS de 6 secondes
- **Conversion**: À la demande lors du téléversement (async recommandé en production)

### Recherche
- Correspondance textuelle insensible aux accents
- Stockage normalisé (décomposition NFD + suppression d'accents)
- Support du filtrage par genre

## Variables d'environnement

### Backend
- `DATABASE_URL` - Chaîne de connexion PostgreSQL (obligatoire)
- `JWT_SECRET` - Clé secrète pour la signature JWT (obligatoire)
- `NODE_ENV` - "development" | "production"
- `PORT` - Port du serveur (défaut: 3000)

### Frontend
- Le serveur de développement Vite proxie l'API vers le backend (voir `vite.config.ts`)

## Développement

### Exécuter les tests
```bash
# Backend
npm run test

# Frontend
npm run test
```

### Compiler
```bash
# Backend
npm run build

# Frontend
npm run build
```

### Vérification des types
```bash
# Les deux projets utilisent TypeScript pour la sécurité au temps de compilation
tsc --noEmit
```

## Limitations connues et améliorations futures

1. **Conversion HLS synchrone**: Bloque la réponse de téléversement; recommande une file d'attente async (BullMQ)
2. **Pagination**: Considérer l'ajout de limites aux requêtes `findAll()`
3. **Validation média**: Ajouter la validation du magic byte pour les fichiers téléversés
4. **Rate Limiting**: Non appliqué aux endpoints coûteux comme `/video/upload`
5. **Tests**: Aucune suite de tests visible dans le repo actuel

## Contribution

- Suivre le modèle d'architecture en couches existant
- Utiliser Zod pour toute la validation des entrées
- Implémenter une gestion d'erreurs appropriée via `AppError`
- Ajouter des types TypeScript pour les nouvelles fonctionnalités
- Garder la logique métier dans les services, pas dans les controllers

## Licence

Projet interne pour Ynov (Fil Rouge Dev).

## Support

Pour les problèmes ou questions, consultez `ARCHITECTURE.md` pour les décisions de conception détaillées.
