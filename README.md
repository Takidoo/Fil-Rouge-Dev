# STREAMIX - Video Streaming Platform

A modern video streaming platform built with Express, React, and Prisma. Stream videos with HLS support, manage a personal library, and interact with the community through comments and genre-based discovery.

## Tech Stack

### Backend
- **Framework**: Express 5
- **Database**: PostgreSQL (via Prisma 7 with @prisma/adapter-pg)
- **Language**: TypeScript 6
- **Validation**: Zod 4
- **Authentication**: JWT + bcrypt
- **Video Processing**: fluent-ffmpeg + ffmpeg-static (HLS conversion)
- **Security**: Helmet (CSP), express-rate-limit

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 8
- **Language**: TypeScript 6
- **Routing**: React Router 7
- **HTTP Client**: Axios
- **Video Player**: HLS.js

## Features

- 🎬 **Video Streaming**: HLS-based video delivery with on-demand conversion
- 👤 **User Accounts**: Registration, login, profile management
- 🎯 **Genre Organization**: Browse and filter videos by genre
- 💬 **Comments**: Direct commenting on videos (instant publishing)
- 🔍 **Search**: Accent-insensitive full-text search across titles and descriptions
- 🎬 **Video Upload**: Users can upload, convert, and manage their videos
- 👮 **Admin Panel**: User management, video moderation capabilities
- 📱 **Responsive UI**: Mobile-friendly interface with Vite dev server proxying

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Express app setup
│   │   ├── server.ts              # Server entry point
│   │   ├── config/                # Configuration (env, paths, constants)
│   │   ├── controllers/           # Route handlers
│   │   ├── services/              # Business logic
│   │   ├── repositories/          # Data access layer
│   │   ├── middlewares/           # Express middlewares
│   │   ├── validators/            # Zod schemas
│   │   ├── types/                 # TypeScript types
│   │   ├── utils/                 # Helpers (auth, logging, HLS, etc.)
│   │   └── db/                    # Prisma client
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seed.ts                # Database seeding
│   │   └── migrations/            # Migration history
│   ├── videos/                    # Media storage (HLS, originals, thumbnails)
│   └── dist/                      # Compiled output
│
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Page components
│   │   ├── components/            # Reusable components
│   │   ├── api/                   # API client
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── contexts/              # React contexts
│   │   ├── types/                 # TypeScript types
│   │   ├── utils/                 # Helpers
│   │   ├── constants/             # App constants
│   │   └── App.tsx                # Root component
│   ├── public/                    # Static assets
│   └── dist/                      # Build output
│
└── ARCHITECTURE.md                # Detailed architecture guide
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- FFmpeg (for HLS video conversion)

### Installation

#### Backend

```bash
cd backend
npm install
```

Create `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/streamix"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
PORT=3000
```

Initialize database:
```bash
npx prisma migrate dev
npx prisma db seed
```

Start development server:
```bash
npm run dev
```

Build:
```bash
npm run build
```

#### Frontend

```bash
cd frontend
npm install
```

Start development server:
```bash
npm run dev
```

Build:
```bash
npm run build
```

## API Overview

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Get JWT token
- `POST /auth/logout` - Clear session

### Videos
- `GET /video` - List all videos
- `POST /video` - Upload new video (authenticated)
- `GET /video/:id` - Get video details
- `PUT /video/:id` - Update video (owner only)
- `DELETE /video/:id` - Delete video (owner or admin)
- `GET /video/search?q=...` - Search videos

### Comments
- `GET /comment/video/:videoId` - Get comments for video
- `POST /comment/video/:videoId` - Create comment (authenticated)
- `DELETE /comment/:id` - Delete comment (author or admin)

### Genres
- `GET /genre` - List all genres
- `POST /genre` - Create genre (admin only)

### Users
- `GET /user/profile` - Get current user
- `PUT /user/profile` - Update profile (authenticated)
- `GET /user` - List users (admin only)
- `DELETE /user/:id` - Delete user (admin only)

### Admin
- `GET /admin/users` - Dashboard user stats

## Architecture Highlights

### Layered Architecture
- **Controllers**: HTTP request/response handling
- **Services**: Business logic and validation
- **Repositories**: Database abstraction
- **Middleware**: Cross-cutting concerns (auth, validation, errors)

### Security
- **Authentication**: JWT with 8-hour expiration
- **Password**: bcrypt hashing (12 salt rounds)
- **Authorization**: Role-based access control (ADMIN/USER)
- **CORS**: Configured for frontend origin
- **Rate Limiting**: 15-minute windows, 20 requests per IP
- **CSP**: Helmet with media security headers

### Video Processing
- **Format**: HLS (HTTP Live Streaming)
- **Codec**: H.264 (libx264)
- **Resolution**: 1280x720 (adaptive scaling)
- **Segments**: 6-second TS files
- **Conversion**: On-demand during upload (async recommended for production)

### Search
- Accent-insensitive full-text matching
- Normalized storage (NFD decomposition + accent stripping)
- Genre filtering support

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string (required)
- `JWT_SECRET` - Secret key for JWT signing (required)
- `NODE_ENV` - "development" | "production"
- `PORT` - Server port (default: 3000)

### Frontend
- Vite dev server proxies API to backend (see `vite.config.ts`)

## Development

### Running Tests
```bash
# Backend
npm run test

# Frontend
npm run test
```

### Building
```bash
# Backend
npm run build

# Frontend
npm run build
```

### Type Checking
```bash
# Both projects use TypeScript for compile-time safety
tsc --noEmit
```

## Known Limitations & Future Improvements

1. **Synchronous HLS Conversion**: Blocks upload response; recommend async queue (BullMQ)
2. **Pagination**: Consider adding limits to `findAll()` queries
3. **Media Validation**: Add magic byte validation for uploaded files
4. **Rate Limiting**: Not applied to expensive endpoints like `/video/upload`
5. **Testing**: No visible test suite in current repo

## Contributing

- Follow the existing layered architecture pattern
- Use Zod for all input validation
- Implement proper error handling via `AppError`
- Add TypeScript types for new features
- Keep business logic in services, not controllers

## License

Internal project for Ynov (Fil Rouge Dev).

## Support

For issues or questions, refer to `ARCHITECTURE.md` for detailed design decisions.
