# Lerniva Migration Guide
## From: Next.js Fullstack + Supabase + Mux
## To: Node.js/Express API + PostgreSQL + Bunny Stream

---

## Table of Contents
1. [Overview](#overview)
2. [Monorepo Structure](#monorepo-structure)
3. [Phase 1: Database](#phase-1-database)
4. [Phase 2: Express API](#phase-2-express-api)
5. [Phase 3: Bunny Stream](#phase-3-bunny-stream)
6. [Phase 4: Frontend](#phase-4-frontend)
7. [Phase 5: Realtime](#phase-5-realtime)
8. [Phase 6: Environment Variables](#phase-6-environment-variables)
9. [Phase 7: Dependencies](#phase-7-dependencies)
10. [Verification Checklist](#verification-checklist)
11. [Critical Rules](#critical-rules)

---

## Overview

| Layer | Current | Target |
|---|---|---|
| Backend | Next.js API Routes | Express.js REST API |
| Auth | Supabase Auth + SSR | JWT (access + refresh tokens) |
| Database | Supabase (PostgreSQL + RLS) | Raw PostgreSQL (`pg` pool) |
| Video | Mux | Bunny Stream |
| Realtime | Supabase Realtime | Socket.io + PG LISTEN/NOTIFY |
| Payments | Stripe | Stripe (unchanged logic) |
| Frontend | Next.js (fullstack) | Next.js (pure API consumer) |

**Execution Order:**
1. Monorepo setup + dependencies
2. PostgreSQL schema (no RLS, add NOTIFY triggers, rename Mux fields)
3. Express server + JWT auth
4. All API routes/controllers
5. Bunny Stream service + webhook
6. Stripe (adapted to Express)
7. Socket.io realtime bridge
8. Frontend: remove Supabase/Mux, add API client
9. Rewrite auth store, middleware, all pages
10. Replace video components (Mux → Bunny/HLS)

---

## Monorepo Structure

```
lerniva/
├── apps/
│   ├── api/                        ← Express.js backend
│   │   └── src/
│   │       ├── config/             ← db.js, env.js, bunny.js, stripe.js
│   │       ├── middleware/         ← auth.js, roles.js, errorHandler.js, rateLimiter.js
│   │       ├── routes/             ← auth, courses, lessons, enrollments, payments,
│   │       │                          progress, certificates, notifications, reviews,
│   │       │                          admin, teachers, uploads, webhooks
│   │       ├── controllers/        ← one file per domain
│   │       ├── services/           ← bunnyService.js, stripeService.js, jwtService.js,
│   │       │                          notificationService.js, certificateService.js
│   │       ├── db/
│   │       │   ├── pool.js         ← pg Pool config
│   │       │   └── queries/        ← SQL query files per domain
│   │       ├── realtime/           ← socket.js (Socket.io + PG LISTEN/NOTIFY)
│   │       └── index.js            ← Express entry point
│   │
│   └── web/                        ← Next.js 16 frontend
│       └── src/
│           ├── app/                ← All pages preserved exactly (UI unchanged)
│           ├── components/         ← All components preserved (UI unchanged)
│           ├── lib/
│           │   ├── api.js          ← Fetch wrapper (replaces all Supabase calls)
│           │   └── socket.js       ← Socket.io client
│           ├── hooks/useAuth.js    ← Rewritten (no Supabase)
│           ├── store/authStore.js  ← Rewritten (JWT, no Supabase persist)
│           └── middleware.js       ← Rewritten (cookie-based JWT protection)
│
├── database/
│   ├── schema.sql                  ← Full consolidated schema
│   ├── migrations/                 ← SQL migration files
│   └── seed.sql
└── package.json                    ← Monorepo root (workspaces)
```

---

## Phase 1: Database

### 1.1 Schema Changes

Preserve all existing tables. Apply these changes:

**Rename Mux columns:**
```sql
ALTER TABLE lessons RENAME COLUMN mux_asset_id TO bunny_video_id;
ALTER TABLE lessons RENAME COLUMN mux_playback_id TO bunny_playback_url;
```

**Add refresh tokens table (new — required for JWT):**
```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
```

**Remove all RLS policies** — authorization moves to Express middleware.

**Keep all existing tables unchanged:**
`users`, `categories`, `courses`, `lessons`, `enrollments`, `lesson_progress`, `payments`, `certificates`, `notifications`, `reviews`, `audit_logs`

**Keep existing PostgreSQL functions/triggers:**
- `generate_certificate_id()` trigger — pure PG logic, keep as-is

### 1.2 NOTIFY Triggers for Realtime

```sql
-- Notify on new notification insert
CREATE OR REPLACE FUNCTION notify_new_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('new_notification', json_build_object(
    'user_id', NEW.user_id, 'id', NEW.id,
    'type', NEW.type, 'title', NEW.title,
    'message', NEW.message, 'link', NEW.link,
    'created_at', NEW.created_at
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_notification
  AFTER INSERT ON notifications
  FOR EACH ROW EXECUTE FUNCTION notify_new_notification();

-- Notify on enrollment change
CREATE OR REPLACE FUNCTION notify_enrollment_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('enrollment_update', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_enrollment_change
  AFTER INSERT OR UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION notify_enrollment_change();
```

---

## Phase 2: Express API

### 2.1 Server Entry (`apps/api/src/index.js`)

```js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initSocket } from './realtime/socket.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import { rateLimiter } from './middleware/rateLimiter.js';

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
// NOTE: Stripe webhook route uses express.raw() — mount BEFORE express.json()
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(rateLimiter);
app.use('/api', routes);
app.use(errorHandler);

httpServer.listen(process.env.PORT || 4000);
```

### 2.2 JWT Auth Middleware (`src/middleware/auth.js`)

```js
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'غير مصرح' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, email, role }
    next();
  } catch {
    res.status(401).json({ error: 'انتهت صلاحية الجلسة' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ error: 'غير مسموح' });
  next();
};
```

### 2.3 Complete API Routes

#### Auth (`/api/auth`)
| Method | Path | Description |
|---|---|---|
| POST | /login | Email + password → access token + refresh cookie |
| POST | /register | Create user, hash password with bcrypt |
| POST | /logout | Revoke refresh token, clear cookie |
| POST | /refresh | Validate refresh cookie → new access token |
| POST | /forgot-password | Send password reset email |
| POST | /reset-password | Validate reset token, update password |
| GET | /me | Get current user profile |
| PUT | /me | Update name, avatar |

#### Courses (`/api/courses`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | / | Public | List published+approved (filter: category, level, search) |
| GET | /:id | Public | Course detail with teacher, lessons preview, reviews |
| POST | / | Teacher | Create course |
| PUT | /:id | Teacher(owner) | Update course |
| DELETE | /:id | Teacher(owner) | Delete course |
| PATCH | /:id/publish | Teacher(owner) | Toggle publish |
| GET | /teacher/mine | Teacher | All courses for auth teacher |

#### Lessons (`/api/lessons`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /course/:courseId | Auth | Lessons for course (enrolled/teacher) |
| POST | /course/:courseId | Teacher(owner) | Add lesson |
| PUT | /:id | Teacher(owner) | Update lesson |
| DELETE | /:id | Teacher(owner) | Delete lesson |
| PATCH | /reorder | Teacher | Reorder (dnd-kit) |
| GET | /:id/watch | Auth(enrolled) | Lesson + Bunny playback URL |

#### Uploads (`/api/upload`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /video | Teacher | Get Bunny upload credentials for lesson |
| POST | /thumbnail | Teacher | Upload thumbnail |
| DELETE | /video/:bunnyVideoId | Teacher | Delete video from Bunny |

#### Enrollments (`/api/enrollments`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /mine | Student | All enrolled courses |
| POST | / | Student | Enroll (free courses only) |
| GET | /:courseId/check | Auth | Check enrollment status |

#### Progress (`/api/progress`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | / | Student(enrolled) | Save watch duration + mark complete |
| GET | /course/:courseId | Student | All lesson progress for course |

#### Payments (`/api/payments`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /checkout | Student | Create Stripe Checkout Session |
| GET | /mine | Student | Payment history |
| GET | /teacher/revenue | Teacher | Revenue data |

#### Webhooks (`/api/webhooks`) — No auth middleware
| Method | Path | Description |
|---|---|---|
| POST | /stripe | checkout.session.completed → enroll + notify |
| POST | /bunny | Video encoded → update bunny_playback_url |

#### Reviews (`/api/reviews`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /course/:courseId | Public | Get course reviews |
| POST | / | Student(enrolled) | Submit review |
| DELETE | /:courseId | Student | Delete own review |

#### Notifications (`/api/notifications`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | / | Auth | Last 20 notifications |
| PUT | /:id/read | Auth | Mark one as read |
| PUT | /read-all | Auth | Mark all as read |

#### Certificates (`/api/certificates`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /mine | Student | All certificates |
| POST | /generate/:courseId | Student | Generate PDF (jsPDF) |
| GET | /verify/:certificateId | Public | Verify by ID |

#### Admin (`/api/admin`) — `requireRole('admin')`
| Method | Path | Description |
|---|---|---|
| GET | /users | Paginated user list |
| PATCH | /users/:id/status | Ban or activate user |
| GET | /courses/pending | Courses awaiting approval |
| PATCH | /courses/:id/approve | Approve course |
| PATCH | /courses/:id/reject | Reject with reason |
| GET | /payments | All payments (paginated) |
| POST | /refund/:paymentId | Stripe refund + update status |
| GET | /stats | Platform-wide stats |
| GET | /audit-logs | Audit log entries |

#### Teacher Analytics (`/api/teachers`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /analytics | Teacher | Revenue, student count, avg rating |
| GET | /students | Teacher | Students in teacher's courses |

---

## Phase 3: Bunny Stream

### 3.1 Bunny Service (`src/services/bunnyService.js`)

```js
import axios from 'axios';
import crypto from 'crypto';

const BASE = `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}`;
const KEY = process.env.BUNNY_API_KEY;
const CDN = process.env.BUNNY_CDN_HOSTNAME;

export const bunny = {

  async createVideo(title) {
    const { data } = await axios.post(`${BASE}/videos`, { title }, { headers: { AccessKey: KEY } });
    return { videoId: data.guid };
  },

  getPlaybackUrl(videoId) {
    return `https://${CDN}/${videoId}/playlist.m3u8`;
  },

  getThumbnailUrl(videoId) {
    return `https://${CDN}/${videoId}/thumbnail.jpg`;
  },

  async getVideoStatus(videoId) {
    const { data } = await axios.get(`${BASE}/videos/${videoId}`, { headers: { AccessKey: KEY } });
    // status: 0=Created 1=Uploaded 2=Processing 3=Transcoding 4=Finished 5=Error
    return data.status;
  },

  async deleteVideo(videoId) {
    await axios.delete(`${BASE}/videos/${videoId}`, { headers: { AccessKey: KEY } });
  },

  verifyWebhook(rawBody, receivedHash) {
    const hash = crypto.createHash('sha256').update(rawBody + KEY).digest('hex');
    return hash === receivedHash;
  },

  generateSignedUrl(videoId, expiresInSec = 3600) {
    const exp = Math.floor(Date.now() / 1000) + expiresInSec;
    const token = crypto.createHash('sha256').update(KEY + videoId + exp).digest('hex');
    return `https://${CDN}/${videoId}/playlist.m3u8?token=${token}&expires=${exp}`;
  },
};
```

### 3.2 Upload Flow

```
Teacher browser → POST /api/upload/video → Express creates Bunny video → returns { videoId }
Teacher browser → TUS upload directly to Bunny (never proxied through Express)
Bunny encodes → POST /api/webhooks/bunny → UPDATE lessons SET bunny_playback_url WHERE bunny_video_id = videoId
```

### 3.3 Bunny Webhook Handler

```js
// POST /api/webhooks/bunny
export async function handleBunnyWebhook(req, res) {
  const signature = req.headers['bunny-signature'];
  if (!bunny.verifyWebhook(req.body.toString(), signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  const event = JSON.parse(req.body);
  if (event.Status === 4) { // Finished encoding
    const videoId = event.VideoGuid;
    const playbackUrl = bunny.getPlaybackUrl(videoId);
    await pool.query(
      'UPDATE lessons SET bunny_playback_url = $1 WHERE bunny_video_id = $2',
      [playbackUrl, videoId]
    );
    // Notify teacher via Socket.io that video is ready
  }
  res.json({ received: true });
}
```

---

## Phase 4: Frontend

### 4.1 API Client (`apps/web/src/lib/api.js`)

```js
const BASE = process.env.NEXT_PUBLIC_API_URL;
let accessToken = null;

export const setAccessToken = (t) => { accessToken = t; };
export const getAccessToken = () => accessToken;

async function req(method, path, data) {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const res = await fetch(`${BASE}${path}`, {
    method, headers, credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (res.status === 401) {
    const ok = await tryRefresh();
    if (ok) return req(method, path, data);
    window.location.href = '/login';
    return;
  }
  return res.json();
}

async function tryRefresh() {
  try {
    const r = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!r.ok) return false;
    const { accessToken: t } = await r.json();
    setAccessToken(t);
    return true;
  } catch { return false; }
}

export const api = {
  get:    (p)    => req('GET',    p),
  post:   (p, d) => req('POST',   p, d),
  put:    (p, d) => req('PUT',    p, d),
  patch:  (p, d) => req('PATCH',  p, d),
  delete: (p)    => req('DELETE', p),
};
```

### 4.2 Auth Store Rewrite (`src/store/authStore.js`)

Replace Supabase session with JWT. Remove `persist` for `accessToken` (memory only):

```js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAccessToken } from '@/lib/api';

const useAuthStore = create(persist(
  (set, get) => ({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,

    init: async () => {
      set({ isLoading: true });
      try {
        // Uses httpOnly refresh cookie to restore session
        const { accessToken, user } = await api.post('/auth/refresh');
        setAccessToken(accessToken);
        set({ user, profile: user, isAuthenticated: true });
      } catch { set({ user: null, isAuthenticated: false }); }
      finally { set({ isLoading: false }); }
    },

    login: async (email, password) => {
      const { accessToken, user } = await api.post('/auth/login', { email, password });
      setAccessToken(accessToken);
      set({ user, profile: user, isAuthenticated: true });
    },

    logout: async () => {
      await api.post('/auth/logout');
      setAccessToken(null);
      set({ user: null, profile: null, isAuthenticated: false });
    },

    getRole: () => get().user?.role || null,
  }),
  { name: 'lerniva-auth', partialize: (s) => ({ user: s.user, profile: s.profile }) }
));
export default useAuthStore;
```

### 4.3 Next.js Middleware Rewrite (`apps/web/src/middleware.js`)

```js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const protected_ = ['/student', '/teacher', '/admin', '/learn', '/checkout'];
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isProtected = protected_.some((r) => pathname.startsWith(r));
  const isAuth = authRoutes.some((r) => pathname.startsWith(r));
  const hasSession = request.cookies.has('refresh_token');

  if (isProtected && !hasSession)
    return NextResponse.redirect(new URL('/login', request.url));
  if (isAuth && hasSession)
    return NextResponse.redirect(new URL('/', request.url));
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/student/:path*', '/teacher/:path*', '/admin/:path*',
    '/learn/:path*', '/checkout/:path*',
    '/login', '/register', '/forgot-password', '/reset-password',
  ],
};
```

### 4.4 Replace Mux Video Components

**Remove:**
- `src/components/video/MuxPlayerClient.js`
- `src/components/video/MuxUploaderClient.js`
- `src/lib/mux.js`

**Add `BunnyPlayerClient.js`** (hls.js for HLS playback):

```jsx
'use client';
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function BunnyPlayerClient({ playbackUrl, onEnded, onTimeUpdate, title }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!playbackUrl || !ref.current) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(playbackUrl);
      hls.attachMedia(ref.current);
      return () => hls.destroy();
    } else if (ref.current.canPlayType('application/vnd.apple.mpegurl')) {
      ref.current.src = playbackUrl; // Safari native HLS
    }
  }, [playbackUrl]);
  return (
    <video
      ref={ref}
      controls
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      title={title}
      className="w-full rounded-xl aspect-video bg-black"
    />
  );
}
```

**Add `BunnyUploaderClient.js`** (TUS upload via tus-js-client):

```jsx
'use client';
import { useState } from 'react';
import * as tus from 'tus-js-client';
import { api } from '@/lib/api';

export default function BunnyUploaderClient({ lessonId, onUploadComplete }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    setUploading(true);
    // Get Bunny upload credentials from Express API
    const { videoId, uploadUrl } = await api.post('/upload/video', {
      lessonId,
      title: file.name,
    });
    const upload = new tus.Upload(file, {
      endpoint: uploadUrl,
      retryDelays: [0, 3000, 5000, 10000],
      metadata: { filename: file.name, filetype: file.type },
      onProgress: (bytesUploaded, bytesTotal) => {
        setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess: () => {
        setUploading(false);
        onUploadComplete(videoId);
      },
      onError: (err) => {
        console.error('Upload error:', err);
        setUploading(false);
      },
    });
    upload.start();
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="video/*"
        disabled={uploading}
        onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
        className="block w-full text-sm"
      />
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <p className="text-xs text-gray-500 mt-1">{progress}% مكتمل</p>
        </div>
      )}
    </div>
  );
}
```

**Add `LessonProgressClient.js`** (rewritten — no Mux, uses Express API):

```jsx
'use client';
import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';

export default function LessonProgressClient({ lessonId, courseId }) {
  const lastSaved = useRef(0);

  const saveProgress = async (currentTime, duration, ended) => {
    const watched = Math.round(currentTime);
    if (watched - lastSaved.current < 10 && !ended) return; // throttle: save every 10s
    lastSaved.current = watched;
    await api.post('/progress', {
      lessonId,
      courseId,
      watchedSeconds: watched,
      completed: ended || (duration > 0 && currentTime / duration >= 0.9),
    });
  };

  return { saveProgress };
}
```

---

## Phase 5: Realtime

### 5.1 Socket.io + PG LISTEN/NOTIFY (`apps/api/src/realtime/socket.js`)

```js
import { Server } from 'socket.io';
import pg from 'pg';
import jwt from 'jsonwebtoken';

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
  });

  // JWT auth for Socket.io connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('غير مصرح'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('انتهت صلاحية الجلسة'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);
    socket.on('disconnect', () => {});
  });

  // PostgreSQL LISTEN
  const pgClient = new pg.Client({ connectionString: process.env.DATABASE_URL });
  pgClient.connect();

  pgClient.query('LISTEN new_notification');
  pgClient.query('LISTEN enrollment_update');

  pgClient.on('notification', (msg) => {
    const payload = JSON.parse(msg.payload);
    if (msg.channel === 'new_notification') {
      io.to(`user:${payload.user_id}`).emit('notification', payload);
    }
    if (msg.channel === 'enrollment_update') {
      io.to(`user:${payload.student_id}`).emit('enrollment_update', payload);
    }
  });
}

export { io };
```

### 5.2 Socket.io Client (`apps/web/src/lib/socket.js`)

```js
import { io } from 'socket.io-client';
import { getAccessToken } from './api';

let socket = null;

export function connectSocket() {
  if (socket?.connected) return socket;
  socket = io(process.env.NEXT_PUBLIC_API_URL, {
    auth: { token: getAccessToken() },
    withCredentials: true,
    transports: ['websocket'],
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket() {
  return socket;
}
```

### 5.3 Notification Hook (`apps/web/src/hooks/useNotifications.js`)

```js
'use client';
import { useEffect, useState } from 'react';
import { connectSocket } from '@/lib/socket';
import { api } from '@/lib/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load initial notifications
    api.get('/notifications').then((data) => {
      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    });

    // Listen for real-time notifications via Socket.io
    const socket = connectSocket();
    socket.on('notification', (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.off('notification');
  }, []);

  const markAsRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
```

---

## Phase 6: Environment Variables

### 6.1 Backend (`apps/api/.env`)

```env
# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lerniva

# JWT
JWT_SECRET=your-strong-jwt-secret-min-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# Bunny Stream
BUNNY_LIBRARY_ID=your-bunny-library-id
BUNNY_API_KEY=your-bunny-api-key
BUNNY_CDN_HOSTNAME=your-library.b-cdn.net
BUNNY_WEBHOOK_SECRET=your-bunny-webhook-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (for password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@lerniva.com
SMTP_PASS=your-smtp-password
EMAIL_FROM=Lerniva <noreply@lerniva.com>
```

### 6.2 Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 6.3 Variables to Remove (no longer needed)

```env
# REMOVE — Supabase (no longer used)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# REMOVE — Mux (replaced by Bunny)
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
NEXT_PUBLIC_MUX_PUBLIC_KEY=
```

---

## Phase 7: Dependencies

### 7.1 Backend (`apps/api/package.json`)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "cookie-parser": "^1.4.6",
    "pg": "^8.11.3",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "socket.io": "^4.7.2",
    "axios": "^1.6.2",
    "stripe": "^14.10.0",
    "nodemailer": "^6.9.8",
    "express-rate-limit": "^7.1.5",
    "tus-js-client": "^3.1.3",
    "uuid": "^9.0.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### 7.2 Frontend (`apps/web/package.json`)

```json
{
  "dependencies": {
    "next": "^16.1.6",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "socket.io-client": "^4.7.2",
    "hls.js": "^1.5.7",
    "tus-js-client": "^3.1.3",
    "zustand": "^5.0.2",
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "stripe": "^14.10.0",
    "jspdf": "^2.5.1",
    "recharts": "^2.10.3",
    "lucide-react": "^0.460.0",
    "tailwindcss": "^4.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0"
  }
}
```

### 7.3 Packages to Remove

```
# From frontend — no longer needed:
@supabase/supabase-js
@supabase/ssr
@mux/mux-player-react
@mux/mux-uploader-react
svix
```

---

## Verification Checklist

### Database
- [ ] Mux columns renamed: `mux_asset_id` → `bunny_video_id`, `mux_playback_id` → `bunny_playback_url`
- [ ] `refresh_tokens` table created with index
- [ ] All RLS policies dropped
- [ ] NOTIFY triggers active: `on_new_notification`, `on_enrollment_change`
- [ ] `generate_certificate_id()` trigger preserved

### Backend (Express)
- [ ] Server starts on port 4000
- [ ] CORS allows frontend origin with credentials
- [ ] Stripe webhook mounted before `express.json()`
- [ ] All 60+ API endpoints respond correctly
- [ ] JWT middleware blocks unauthenticated requests with Arabic error messages
- [ ] Refresh token rotation works (15m access / 30d refresh)
- [ ] Rate limiting active

### Bunny Stream
- [ ] `POST /api/upload/video` returns `{ videoId, uploadUrl }`
- [ ] TUS upload completes end-to-end
- [ ] Webhook `POST /api/webhooks/bunny` updates `bunny_playback_url` in DB
- [ ] Webhook signature verification passes
- [ ] Signed URLs generated for enrolled students only

### Stripe Payments
- [ ] Checkout session created successfully
- [ ] Webhook `checkout.session.completed` enrolls student and creates notification
- [ ] Refunds process correctly from admin panel

### Frontend
- [ ] No Supabase imports anywhere in `apps/web/`
- [ ] No Mux imports anywhere in `apps/web/`
- [ ] `api.js` handles 401 → auto-refresh → retry
- [ ] Auth store initializes from refresh cookie on page load
- [ ] Middleware (`proxy.js` / `middleware.js`) uses `refresh_token` cookie only
- [ ] All Arabic UI text preserved (RTL, Cairo font)
- [ ] BunnyPlayerClient plays HLS in Chrome, Firefox, Safari
- [ ] BunnyUploaderClient shows progress bar during upload

### Realtime
- [ ] Socket.io connects with JWT auth token
- [ ] Notifications appear instantly without page refresh
- [ ] Enrollment updates propagate in real-time
- [ ] Socket disconnects cleanly on logout

### End-to-End Flows
- [ ] Register → Login → Browse courses → Enroll (free) → Watch video → Progress saved
- [ ] Register → Login → Pay (Stripe) → Enrolled automatically → Notification received
- [ ] Teacher: Create course → Add lesson → Upload video → Publish → Approve (admin)
- [ ] Student: Complete all lessons → Certificate generated → Verify certificate (public)
- [ ] Admin: View pending courses → Approve/reject → View platform stats

---

## Critical Rules

1. **Never mix Supabase and Express** — after migration, zero Supabase client imports in frontend or backend.

2. **Never proxy video uploads through Express** — TUS uploads go directly from browser to Bunny CDN. Express only creates the video metadata entry.

3. **Access tokens are memory-only** — never store in `localStorage` or `sessionStorage`. Only persist non-sensitive user metadata (name, role, avatar) in Zustand persist.

4. **httpOnly cookies for refresh tokens** — set `httpOnly: true`, `sameSite: 'strict'`, `secure: true` in production.

5. **Stripe webhook requires raw body** — always mount `express.raw()` for `/api/webhooks/stripe` BEFORE `express.json()`.

6. **Bunny webhook requires signature verification** — always verify `bunny-signature` header before processing encoding events.

7. **RLS is removed** — all authorization logic lives in Express middleware (`authenticate` + `requireRole`). Every sensitive query must be scoped to the authenticated user's ID.

8. **Arabic UI is preserved** — do not touch any text content, RTL layout (`dir="rtl"`), or Cairo font configuration during migration.

9. **Keep dnd-kit for lesson reordering** — the `PATCH /api/lessons/reorder` endpoint receives the ordered array of `{ id, order }` from the existing drag-and-drop UI.

10. **PostgreSQL LISTEN uses a dedicated client** — never use the shared pool for `LISTEN/NOTIFY`. Use a separate long-lived `pg.Client` instance in `realtime/socket.js`.
