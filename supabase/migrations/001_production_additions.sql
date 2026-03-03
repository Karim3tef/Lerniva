-- ============================================================
-- Migration 001: Production Additions
-- ============================================================

-- users: add status for admin ban/activate
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
  CHECK (status IN ('active', 'banned', 'pending'));

-- enrollments: add completed_at for certificate issuance
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- courses: add UX fields shown on course detail page
ALTER TABLE courses ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'Arabic';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS requirements TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS what_you_learn TEXT[];

-- lessons: add Mux-specific fields (replace raw video_url with Mux asset)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS mux_asset_id TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS mux_playback_id TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS lesson_type VARCHAR(20) DEFAULT 'video'
  CHECK (lesson_type IN ('video', 'text', 'quiz'));

-- courses: track total lessons count
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_lessons INTEGER DEFAULT 0;

-- payments: Stripe payment audit trail
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_session_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- certificates
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  certificate_url TEXT,
  UNIQUE(student_id, course_id)
);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS for New Tables
-- ============================================================

-- payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_student_own" ON payments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "payments_teacher_own" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE id = payments.course_id AND teacher_id = auth.uid())
);
CREATE POLICY "payments_admin_all" ON payments FOR ALL USING (public.get_my_role() = 'admin');

-- certificates
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certs_student_own" ON certificates FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "certs_public_read" ON certificates FOR SELECT USING (true);

-- notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifs_user_own" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifs_user_update" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- DB Function: Auto-Issue Certificate on 100% Progress
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_enrollment_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.progress = 100 AND OLD.progress < 100 THEN
    UPDATE enrollments SET completed_at = NOW() WHERE id = NEW.id;
    INSERT INTO certificates (student_id, course_id)
    VALUES (NEW.student_id, NEW.course_id)
    ON CONFLICT (student_id, course_id) DO NOTHING;
    -- Notify student
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.student_id,
      'certificate_issued',
      'تهانيك! لقد أكملت الدورة',
      'يمكنك الآن تنزيل شهادتك',
      '/student/certificates'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_enrollment_complete
  AFTER UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION public.handle_enrollment_complete();
