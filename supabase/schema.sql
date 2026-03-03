-- ============================================================
-- Lerniva (ليرنيفا) - Database Schema
-- Supabase PostgreSQL
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  total_duration INTEGER DEFAULT 0, -- in minutes
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  video_url TEXT,
  duration INTEGER DEFAULT 0, -- in minutes
  is_preview BOOLEAN DEFAULT FALSE,
  order_number INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refunds
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_teacher ON withdrawals(teacher_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Helper to read the current user's role without triggering recursive RLS checks
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Helper to read any user's role by ID (used in RLS policies)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = user_id LIMIT 1;
$$;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories: public read
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON categories FOR ALL USING (public.get_my_role() = 'admin');

-- Users: own data
CREATE POLICY "users_read_own" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_admin_read_all" ON users FOR SELECT USING (public.get_my_role() = 'admin');
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (id = auth.uid());

-- Courses: public read published, teacher manages own
CREATE POLICY "courses_public_read" ON courses FOR SELECT USING (is_published = true AND is_approved = true);
CREATE POLICY "courses_teacher_read_own" ON courses FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "courses_teacher_insert" ON courses FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "courses_teacher_update_own" ON courses FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "courses_admin_all" ON courses FOR ALL USING (public.get_my_role() = 'admin');

-- Lessons: public read preview, enrolled students read all
CREATE POLICY "lessons_public_preview" ON lessons FOR SELECT USING (is_preview = true);
CREATE POLICY "lessons_enrolled_read" ON lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE student_id = auth.uid() AND course_id = lessons.course_id
  )
);
CREATE POLICY "lessons_teacher_manage" ON lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE id = lessons.course_id AND teacher_id = auth.uid())
);

-- Enrollments: student manages own
CREATE POLICY "enrollments_student_read_own" ON enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "enrollments_student_insert" ON enrollments FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "enrollments_student_update_own" ON enrollments FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "enrollments_teacher_read" ON enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE id = enrollments.course_id AND teacher_id = auth.uid())
);
CREATE POLICY "enrollments_admin_all" ON enrollments FOR ALL USING (public.get_my_role() = 'admin');

-- Reviews: public read, student manages own
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_student_insert" ON reviews FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "reviews_student_update_own" ON reviews FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "reviews_admin_delete" ON reviews FOR DELETE USING (public.get_my_role() = 'admin');

-- Withdrawals: teacher manages own, admin all
CREATE POLICY "withdrawals_teacher_own" ON withdrawals FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "withdrawals_teacher_insert" ON withdrawals FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "withdrawals_admin_all" ON withdrawals FOR ALL USING (public.get_my_role() = 'admin');

-- Refunds: student manages own, admin all
CREATE POLICY "refunds_student_own" ON refunds FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "refunds_student_insert" ON refunds FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "refunds_admin_all" ON refunds FOR ALL USING (public.get_my_role() = 'admin');

-- ============================================================
-- SEED DATA (Categories)
-- ============================================================

INSERT INTO categories (name, slug) VALUES
  ('الرياضيات', 'mathematics'),
  ('الفيزياء', 'physics'),
  ('الكيمياء', 'chemistry'),
  ('علم الأحياء', 'biology'),
  ('علوم الحاسوب', 'computer-science'),
  ('الهندسة', 'engineering'),
  ('الإحصاء', 'statistics'),
  ('الذكاء الاصطناعي', 'artificial-intelligence')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
