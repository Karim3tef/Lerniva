# ليرنيفا – Lerniva

منصة تعليمية عربية متخصصة في العلوم والتكنولوجيا والهندسة والرياضيات (STEM).

Lerniva is a premium Arabic STEM e-learning marketplace that connects expert instructors with motivated learners. Instructors create and monetize high-quality courses, while students enjoy a seamless, fully Arabic learning experience.

---

## 🚀 Tech Stack

- **Next.js** (App Router, JavaScript)
- **Tailwind CSS** (RTL + Arabic fonts)
- **Supabase** (PostgreSQL + Auth + Storage)
- **Zustand** (state management)
- **React Hook Form + Zod** (forms & validation)
- **Recharts** (analytics charts)
- **Lucide Icons**

---

## 📁 Project Structure

```
/src
  /app
    /(public)       ← Landing page, courses, about
    /(auth)         ← Login, register, forgot-password
    /student/       ← Student dashboard, my-courses
    /teacher/       ← Teacher dashboard, analytics, course management
    /admin/         ← Admin panel (users, courses, refunds)
  /components
    /ui             ← Button, Input, Card, Badge, Modal
    /layout         ← Header, Footer, Sidebar
    /course         ← CourseCard, CourseGrid, CourseFilters
    /dashboard      ← StatsCard, RevenueChart
    /forms          ← LoginForm, RegisterForm, CreateCourseForm
  /lib              ← supabase.js, auth.js, helpers.js, validations.js
  /hooks            ← useAuth, useCourses, useEnrollments
  /store            ← authStore (Zustand), courseStore (Zustand)
  /constants        ← App-wide constants, navigation, categories
/supabase
  schema.sql        ← Full DB schema + RLS policies + seed data
```

---

## ⚙️ Setup Instructions

### 1. Install

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. This creates all tables, RLS policies, indexes, and seed data

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 💼 Business Logic

| Rule | Detail |
|------|--------|
| Commission (≤400 enrollments) | 20 EGP per student |
| Commission (>400 enrollments) | 15 EGP per student |
| Refund window | 3 days after purchase |
| Refund condition | Less than 20% course watched |
| Course publishing | Min 3 lessons, 30+ mins, 1 preview, thumbnail, admin approval |

---

## 🔐 Security

- Row Level Security (RLS) on all tables
- Role-based middleware route protection
- Zod input validation on all forms
- Supabase Auth for session management

---

## 📊 Dashboards

| Dashboard | Features |
|-----------|----------|
| **Student** | Enrolled courses, progress bars, resume watching, reviews |
| **Teacher** | Revenue analytics, enrollment charts, course management, withdrawal requests |
| **Admin** | Course approvals, refund management, user management, platform statistics |

---

## 🌐 Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/courses` | Browse all courses |
| `/about` | About Lerniva |
| `/login` | Login |
| `/register` | Sign up |
| `/student/dashboard` | Student portal |
| `/teacher/dashboard` | Teacher portal |
| `/admin/dashboard` | Admin panel |
