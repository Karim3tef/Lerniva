-- ============================================================
-- Lerniva Migration: Supabase → PostgreSQL + Express
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- STEP 1: Update Users table (remove auth.users dependency)
-- ============================================================

-- Modify users table to be standalone (no longer references auth.users)
ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE users ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- ============================================================
-- STEP 2: Add missing tables from migration guide
-- ============================================================

-- Lesson Progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  watched_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course ON lesson_progress(course_id);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_id TEXT UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_course ON payments(course_id);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id VARCHAR(20) UNIQUE NOT NULL,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON certificates(course_id);

-- Certificate ID generation function
CREATE OR REPLACE FUNCTION generate_certificate_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.certificate_id := 'LRNV-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 14));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_certificate_id
  BEFORE INSERT ON certificates
  FOR EACH ROW
  WHEN (NEW.certificate_id IS NULL OR NEW.certificate_id = '')
  EXECUTE FUNCTION generate_certificate_id();

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================
-- STEP 3: Rename Mux columns to Bunny columns
-- ============================================================

-- Check and rename mux_asset_id to bunny_video_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'mux_asset_id'
  ) THEN
    ALTER TABLE lessons RENAME COLUMN mux_asset_id TO bunny_video_id;
  END IF;
END $$;

-- Check and rename mux_playback_id to bunny_playback_url
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'mux_playback_id'
  ) THEN
    ALTER TABLE lessons RENAME COLUMN mux_playback_id TO bunny_playback_url;
  END IF;
END $$;

-- Add Bunny columns if they don't exist
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS bunny_video_id TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS bunny_playback_url TEXT;

-- ============================================================
-- STEP 4: Create refresh_tokens table for JWT
-- ============================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- ============================================================
-- STEP 5: Drop all RLS policies
-- ============================================================

-- Drop policies on categories
DROP POLICY IF EXISTS "categories_public_read" ON categories;
DROP POLICY IF EXISTS "categories_admin_write" ON categories;

-- Drop policies on users
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "users_admin_read_all" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;

-- Drop policies on courses
DROP POLICY IF EXISTS "courses_public_read" ON courses;
DROP POLICY IF EXISTS "courses_teacher_read_own" ON courses;
DROP POLICY IF EXISTS "courses_teacher_insert" ON courses;
DROP POLICY IF EXISTS "courses_teacher_update_own" ON courses;
DROP POLICY IF EXISTS "courses_admin_all" ON courses;

-- Drop policies on lessons
DROP POLICY IF EXISTS "lessons_public_preview" ON lessons;
DROP POLICY IF EXISTS "lessons_enrolled_read" ON lessons;
DROP POLICY IF EXISTS "lessons_teacher_manage" ON lessons;

-- Drop policies on enrollments
DROP POLICY IF EXISTS "enrollments_student_read_own" ON enrollments;
DROP POLICY IF EXISTS "enrollments_student_insert" ON enrollments;
DROP POLICY IF EXISTS "enrollments_student_update_own" ON enrollments;
DROP POLICY IF EXISTS "enrollments_teacher_read" ON enrollments;
DROP POLICY IF EXISTS "enrollments_admin_all" ON enrollments;

-- Drop policies on reviews
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
DROP POLICY IF EXISTS "reviews_student_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_student_update_own" ON reviews;
DROP POLICY IF EXISTS "reviews_admin_delete" ON reviews;

-- Drop policies on withdrawals
DROP POLICY IF EXISTS "withdrawals_teacher_own" ON withdrawals;
DROP POLICY IF EXISTS "withdrawals_teacher_insert" ON withdrawals;
DROP POLICY IF EXISTS "withdrawals_admin_all" ON withdrawals;

-- Drop policies on refunds
DROP POLICY IF EXISTS "refunds_student_own" ON refunds;
DROP POLICY IF EXISTS "refunds_student_insert" ON refunds;
DROP POLICY IF EXISTS "refunds_admin_all" ON refunds;

-- Disable RLS on all tables
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE refunds DISABLE ROW LEVEL SECURITY;

-- Drop RLS helper functions (no longer needed)
DROP FUNCTION IF EXISTS public.get_my_role();
DROP FUNCTION IF EXISTS public.get_user_role(UUID);

-- Drop auth trigger (no longer using auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================================
-- STEP 6: Add NOTIFY triggers for realtime
-- ============================================================

-- Notify on new notification insert
CREATE OR REPLACE FUNCTION notify_new_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('new_notification', json_build_object(
    'user_id', NEW.user_id,
    'id', NEW.id,
    'type', NEW.type,
    'title', NEW.title,
    'message', NEW.message,
    'link', NEW.link,
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

-- ============================================================
-- STEP 7: Add updated_at triggers
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
