# Lerniva Migration Progress

This document tracks the progress of migrating Lerniva from Next.js + Supabase + Mux to Express.js + PostgreSQL + Bunny Stream.

## Migration Guide Reference

The migration is based on the detailed specification in `MIGRATION_GUIDE.md`.

## Completed Work

### ✅ Phase 1: Monorepo Setup
- Monorepo structure created with workspaces
- Root package.json configured
- apps/api and apps/web directories established
- Build scripts configured

### ✅ Phase 2: Database
- Complete PostgreSQL schema created (database/schema.sql)
- Migration script created (database/migrations/001_migrate_to_express.sql) including:
  - Mux → Bunny column renames
  - refresh_tokens table for JWT
  - RLS policies removal
  - NOTIFY triggers for realtime
  - All missing tables added (lesson_progress, payments, certificates, notifications, audit_logs)
- All existing tables preserved
- Certificate ID generation trigger preserved

### ✅ Phase 3: Express API Infrastructure
**Completed:**
- Express server entry point (src/index.js)
- Environment configuration (src/config/env.js)
- Database pool (src/db/pool.js)
- Middleware:
  - JWT authentication (src/middleware/auth.js)
  - Error handler (src/middleware/errorHandler.js)
  - Rate limiter (src/middleware/rateLimiter.js)
- Services:
  - JWT service (src/services/jwtService.js)
  - Bunny Stream service (src/services/bunnyService.js)
  - Stripe service (src/services/stripeService.js)
  - Notification service (src/services/notificationService.js)
- Auth routes & controller (COMPLETE):
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/refresh
  - POST /api/auth/logout
  - GET /api/auth/me
  - PUT /api/auth/me
  - POST /api/auth/forgot-password
  - POST /api/auth/reset-password

**Still Needed:**
Routes and controllers for:
- Courses (8 endpoints)
- Lessons (6 endpoints)
- Uploads (3 endpoints)
- Enrollments (3 endpoints)
- Progress (2 endpoints)
- Payments (3 endpoints)
- Webhooks (2 endpoints - Stripe & Bunny)
- Reviews (3 endpoints)
- Notifications (3 endpoints)
- Certificates (3 endpoints)
- Admin (9 endpoints)
- Teachers (2 endpoints)

Total: ~45 more endpoints to implement

### ✅ Phase 4: Realtime (Socket.io)
- Socket.io server initialized (src/realtime/socket.js)
- PostgreSQL LISTEN/NOTIFY bridge implemented
- JWT authentication for Socket.io connections
- User-specific rooms for targeted notifications
- Notification and enrollment update channels

### ⏳ Phase 5: Frontend Migration
**Not Started - Major Work Required:**
- Create API client (lib/api.js)
- Rewrite auth store (remove Supabase)
- Rewrite middleware (cookie-based JWT)
- Create Socket.io client
- Replace all Supabase calls (~100+ files)
- Create Bunny video components:
  - BunnyPlayerClient
  - BunnyUploaderClient
  - LessonProgressClient
- Update all pages
- Update all hooks

### ✅ Phase 6: Environment & Dependencies
- Backend package.json created with all dependencies
- Frontend package.json created with correct dependencies
- Backend .env.example created
- Frontend .env.example updated (removed Supabase/Mux vars)
- .gitignore updated for monorepo

## Next Steps (Priority Order)

1. **Complete API Routes** (Highest Priority)
   - Implement courses controller & routes
   - Implement lessons controller & routes
   - Implement uploads controller & routes (Bunny integration)
   - Implement enrollments controller & routes
   - Implement progress controller & routes
   - Implement payments controller & routes (Stripe)
   - Implement webhooks controller & routes (Stripe + Bunny)
   - Implement reviews controller & routes
   - Implement notifications controller & routes
   - Implement certificates controller & routes
   - Implement admin controller & routes
   - Implement teachers controller & routes

2. **Frontend API Client & Auth**
   - Create lib/api.js with automatic token refresh
   - Rewrite authStore.js (JWT, no Supabase)
   - Create Socket.io client (lib/socket.js)
   - Rewrite middleware.js (cookie-based)

3. **Frontend Video Components**
   - Create BunnyPlayerClient (hls.js)
   - Create BunnyUploaderClient (tus-js-client)
   - Create LessonProgressClient
   - Remove Mux components

4. **Frontend Page Updates**
   - Update auth pages (login, register, etc.)
   - Update course pages
   - Update lesson/learn pages
   - Update dashboard pages
   - Update admin pages
   - Update teacher pages
   - Update student pages

5. **Testing & Verification**
   - Set up development database
   - Run migration scripts
   - Test auth flow
   - Test course management
   - Test video upload/playback
   - Test payment flow
   - Test realtime notifications
   - Test all user roles

## Estimated Remaining Work

- **Backend API**: ~45 endpoints × ~30 min each = ~22 hours
- **Frontend Migration**: ~100 files to update = ~40 hours
- **Testing**: ~10 hours
- **Total**: ~72 hours of development work

## Notes

- The migration maintains exact UI/UX (all Arabic text preserved)
- All business logic preserved (commission, refund rules, etc.)
- No breaking changes to user experience
- Database migration is reversible (RLS can be re-enabled if needed)

## Running the Project

### Backend (once API routes are complete):
```bash
cd apps/api
npm install
# Set up .env file
npm run dev
```

### Frontend (once migration is complete):
```bash
cd apps/web
npm install
# Set up .env.local file
npm run dev
```

### Database Setup:
```bash
# Create database
createdb lerniva

# Run schema
psql lerniva < database/schema.sql

# Or run migration from existing Supabase DB
psql lerniva < database/migrations/001_migrate_to_express.sql
```
