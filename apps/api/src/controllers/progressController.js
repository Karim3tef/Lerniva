import pool from '../db/pool.js';

// POST /api/progress - Save lesson progress
export async function saveProgress(req, res, next) {
  try {
    const studentId = req.user.id;
    const { lessonId, courseId, watchedSeconds, completed } = req.body;

    // Check if student is enrolled in the course
    const enrollmentCheck = await pool.query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [courseId, studentId]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({ error: 'يجب التسجيل في الدورة أولاً' });
    }

    // Upsert progress
    const query = `
      INSERT INTO lesson_progress (lesson_id, student_id, watched_seconds, completed)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (lesson_id, student_id)
      DO UPDATE SET
        watched_seconds = GREATEST(lesson_progress.watched_seconds, EXCLUDED.watched_seconds),
        completed = lesson_progress.completed OR EXCLUDED.completed,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await pool.query(query, [lessonId, studentId, watchedSeconds, completed]);

    // If lesson is now completed, check if course is complete
    if (completed) {
      const completionCheck = await pool.query(
        `SELECT
          COUNT(*) as total_lessons,
          COUNT(CASE WHEN lp.completed THEN 1 END) as completed_lessons
        FROM lessons l
        LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = $2
        WHERE l.course_id = $1`,
        [courseId, studentId]
      );

      const { total_lessons, completed_lessons } = completionCheck.rows[0];

      if (parseInt(total_lessons) === parseInt(completed_lessons)) {
        // Course is complete - could trigger certificate generation
        res.json({
          ...result.rows[0],
          course_completed: true,
          message: 'تهانينا! لقد أكملت جميع دروس الدورة',
        });
        return;
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

// GET /api/progress/course/:courseId - Get all lesson progress for a course
export async function getCourseProgress(req, res, next) {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Check enrollment
    const enrollmentCheck = await pool.query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [courseId, studentId]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({ error: 'غير مسجل في هذه الدورة' });
    }

    const query = `
      SELECT l.id as lesson_id, l.title, l.lesson_order,
        COALESCE(lp.watched_seconds, 0) as watched_seconds,
        COALESCE(lp.completed, false) as completed,
        l.duration
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = $2
      WHERE l.course_id = $1
      ORDER BY l.lesson_order ASC
    `;

    const result = await pool.query(query, [courseId, studentId]);

    // Calculate overall progress
    const totalLessons = result.rows.length;
    const completedLessons = result.rows.filter((l) => l.completed).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    res.json({
      lessons: result.rows,
      stats: {
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        progress_percentage: progressPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
}
