import pool from '../db/pool.js';

// GET /api/enrollments/mine - Get all enrolled courses for student
export async function getMyEnrollments(req, res, next) {
  try {
    const studentId = req.user.id;

    const query = `
      SELECT e.*,
        c.title as course_title,
        c.description as course_description,
        c.thumbnail_url as course_thumbnail,
        c.level as course_level,
        u.full_name as teacher_name,
        u.avatar_url as teacher_avatar,
        cat.name as category_name,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT CASE WHEN lp.completed THEN lp.id END) as completed_lessons,
        COALESCE(AVG(r.rating), 0) as course_rating
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN lessons l ON c.id = l.course_id
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = e.student_id
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE e.student_id = $1
      GROUP BY e.id, c.id, u.full_name, u.avatar_url, cat.name
      ORDER BY e.purchased_at DESC
    `;

    const result = await pool.query(query, [studentId]);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

// POST /api/enrollments - Enroll in a course (free courses only)
export async function enrollInCourse(req, res, next) {
  try {
    const studentId = req.user.id;
    const { courseId, course_id } = req.body;
    const targetCourseId = courseId || course_id;

    if (!targetCourseId) {
      return res.status(400).json({ error: 'courseId مطلوب' });
    }

    // Check if course exists and is free
    const courseQuery = 'SELECT id, price, title, is_published, is_approved FROM courses WHERE id = $1';
    const courseResult = await pool.query(courseQuery, [targetCourseId]);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    const course = courseResult.rows[0];

    if (!course.is_published || !course.is_approved) {
      return res.status(400).json({ error: 'الدورة غير متاحة للتسجيل' });
    }

    if (parseFloat(course.price) > 0) {
      return res.status(400).json({ error: 'هذه الدورة مدفوعة، يرجى استخدام صفحة الدفع' });
    }

    // Check if already enrolled
    const enrollmentCheck = await pool.query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [targetCourseId, studentId]
    );

    if (enrollmentCheck.rows.length > 0) {
      return res.status(400).json({ error: 'أنت مسجل بالفعل في هذه الدورة' });
    }

    // Enroll student
    const insertQuery = `
      INSERT INTO enrollments (course_id, student_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [targetCourseId, studentId]);

    res.status(201).json({
      ...result.rows[0],
      message: 'تم التسجيل في الدورة بنجاح',
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/enrollments/:courseId/check - Check enrollment status
export async function checkEnrollment(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const query = `
      SELECT
        EXISTS(SELECT 1 FROM enrollments WHERE course_id = $1 AND student_id = $2) as is_enrolled,
        (SELECT teacher_id FROM courses WHERE id = $1) as teacher_id
    `;
    const result = await pool.query(query, [courseId, userId]);

    const isEnrolled = result.rows[0].is_enrolled;
    const isTeacher = result.rows[0].teacher_id === userId;

    res.json({
      is_enrolled: isEnrolled,
      is_teacher: isTeacher,
      has_access: isEnrolled || isTeacher,
    });
  } catch (error) {
    next(error);
  }
}
