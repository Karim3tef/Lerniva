# Lerniva - منصة ليرنيفا التعليمية

> منصة تعليمية عربية متخصصة في العلوم والتكنولوجيا والهندسة والرياضيات (STEM)

## 🚀 Architecture

This project has been migrated to a **monorepo architecture**:

### Previous Stack
- **Frontend**: Next.js (fullstack with API routes)
- **Auth**: Supabase Auth + SSR
- **Database**: Supabase (PostgreSQL + RLS)
- **Video**: Mux
- **Realtime**: Supabase Realtime

### Current Stack (Post-Migration)
- **Frontend**: Next.js 16 (pure API consumer)
- **Backend**: Express.js REST API
- **Auth**: JWT (access + refresh tokens)
- **Database**: Raw PostgreSQL (pg pool)
- **Video**: Bunny Stream
- **Realtime**: Socket.io + PostgreSQL LISTEN/NOTIFY
- **Payments**: Stripe (unchanged)

## 📁 Project Structure

```
lerniva/
├── apps/
│   ├── api/                    # Express.js backend
│   │   ├── src/
│   │   │   ├── config/         # env.js, db config
│   │   │   ├── controllers/    # Business logic
│   │   │   ├── routes/         # API routes
│   │   │   ├── middleware/     # Auth, error handling, rate limiting
│   │   │   ├── services/       # Bunny, Stripe, JWT, notifications
│   │   │   ├── db/             # PostgreSQL pool & queries
│   │   │   ├── realtime/       # Socket.io + PG LISTEN/NOTIFY
│   │   │   └── index.js        # Express entry point
│   │   └── package.json
│   │
│   └── web/                    # Next.js 16 frontend
│       ├── src/
│       │   ├── app/            # All pages (UI unchanged)
│       │   ├── components/     # All components (UI unchanged)
│       │   ├── lib/            # API client, Socket.io client
│       │   ├── hooks/          # useAuth, useCourses, etc.
│       │   └── store/          # Zustand stores
│       └── package.json
│
├── database/
│   ├── schema.sql              # Complete PostgreSQL schema
│   └── migrations/             # SQL migration files
│
├── MIGRATION_GUIDE.md          # Detailed migration specification
├── MIGRATION_STATUS.md         # Current progress tracker
└── package.json                # Monorepo root
```

## 🔧 Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone and Install

```bash
git clone <repository-url>
cd lerniva
npm install  # Installs all workspace dependencies
```

### 2. Database Setup

```bash
# Create database
createdb lerniva

# Run schema
psql lerniva < database/schema.sql
```

### 3. Environment Variables

**Backend (`apps/api/.env`):**
```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your credentials
```

**Frontend (`apps/web/.env.local`):**
```bash
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local
```

### 4. Development

```bash
# Run both API and Web concurrently
npm run dev

# Or run separately:
npm run dev:api   # Runs on http://localhost:4000
npm run dev:web   # Runs on http://localhost:3000
```

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

Refresh tokens are stored as httpOnly cookies.

### Endpoints

#### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns access token + sets refresh cookie)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (revokes refresh token)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

#### Courses (TBD)
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (teacher)
- `PUT /api/courses/:id` - Update course (teacher)
- `DELETE /api/courses/:id` - Delete course (teacher)
- `PATCH /api/courses/:id/publish` - Toggle publish
- `GET /api/courses/teacher/mine` - Get teacher's courses

#### ... and 45+ more endpoints (see MIGRATION_STATUS.md)

## 🔐 Security Features

- **JWT Authentication**: Access tokens (15min) + Refresh tokens (30 days)
- **httpOnly Cookies**: Refresh tokens stored securely
- **Rate Limiting**: 100 requests/15min, 5 auth requests/15min
- **Helmet.js**: Security headers
- **CORS**: Configured for frontend origin only
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Zod schemas
- **SQL Injection Protection**: Parameterized queries

## 📊 Realtime Features

Powered by Socket.io + PostgreSQL LISTEN/NOTIFY:

- **Notifications**: Instant push when new notification created
- **Enrollment Updates**: Live enrollment status changes
- **User-specific Rooms**: Each user joins `user:{userId}` room

## 🎥 Video Streaming

Powered by Bunny Stream:

- **HLS Playback**: Using hls.js
- **TUS Upload**: Direct browser → Bunny CDN (no proxy)
- **Webhook Processing**: Automatic playback URL updates
- **Signed URLs**: Secure video access for enrolled students only

## 💳 Payments

Powered by Stripe:

- **Checkout Sessions**: Hosted checkout page
- **Webhooks**: Automatic enrollment on successful payment
- **Refunds**: Admin-initiated refunds within rules

## 🚧 Migration Status

**Current Phase**: Phase 3 - API Development (30% complete)

See [MIGRATION_STATUS.md](./MIGRATION_STATUS.md) for detailed progress.

**Completed**:
- ✅ Monorepo structure
- ✅ Database schema migration
- ✅ Express API infrastructure
- ✅ Auth system (complete)
- ✅ Socket.io realtime
- ✅ All backend services

**In Progress**:
- 🔄 API routes and controllers (~45 endpoints remaining)

**Not Started**:
- ⏳ Frontend migration (API client, auth store, components)
- ⏳ Testing & verification

## 🧪 Testing

```bash
# Backend tests (when available)
cd apps/api
npm test

# Frontend tests (when available)
cd apps/web
npm test
```

## 🏗️ Build

```bash
# Build all workspaces
npm run build

# Build individually
npm run build --workspace=apps/api
npm run build --workspace=apps/web
```

## 📝 Contributing

This is a migration in progress. Major architectural changes are being made according to the specification in `MIGRATION_GUIDE.md`.

## 📄 License

Private - Lerniva Platform

## 👥 Team

- Architecture: Following MIGRATION_GUIDE.md spec
- Backend: Express.js + PostgreSQL
- Frontend: Next.js 16
- DevOps: Node.js monorepo

## 🔗 Links

- Migration Guide: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Migration Status: [MIGRATION_STATUS.md](./MIGRATION_STATUS.md)
- Original README: See git history for pre-migration documentation
