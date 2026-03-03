-- ============================================================
-- Migration 002: Lesson Progress, Certificate IDs, Audit Logs
-- ============================================================

-- lesson_progress: per-lesson tracking
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  watch_duration INTEGER DEFAULT 0,
  UNIQUE(student_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lp_student_own" ON lesson_progress FOR ALL USING (student_id = auth.uid());
CREATE POLICY "lp_teacher_read" ON lesson_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE id = lesson_progress.course_id AND teacher_id = auth.uid())
);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student_course ON lesson_progress(student_id, course_id);

-- Add certificate_id to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certificate_id VARCHAR(12) UNIQUE;

-- Add rejection_reason to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- audit_logs: admin activity tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admin_only" ON audit_logs FOR SELECT USING (public.get_my_role() = 'admin');
CREATE POLICY "audit_insert_all" ON audit_logs FOR INSERT WITH CHECK (true);

-- Function to generate short certificate ID
CREATE OR REPLACE FUNCTION public.generate_certificate_id()
RETURNS TRIGGER AS $$
DECLARE
  new_id VARCHAR(12);
  exists_check INTEGER;
BEGIN
  IF NEW.certificate_id IS NULL THEN
    LOOP
      new_id := 'LRNV-' || upper(substring(md5(random()::text) from 1 for 7));
      SELECT COUNT(*) INTO exists_check FROM certificates WHERE certificate_id = new_id;
      EXIT WHEN exists_check = 0;
    END LOOP;
    NEW.certificate_id := new_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_certificate_id
  BEFORE INSERT ON certificates
  FOR EACH ROW EXECUTE FUNCTION public.generate_certificate_id();
