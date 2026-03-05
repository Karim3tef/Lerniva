import pool from '../db/pool.js';

// GET /api/lessons/course/:courseId - Get lessons for a course (enrolled or teacher)
export async function getCourseLessons(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user is the teacher or is enrolled
    const accessQuery = `
      SELECT
        (SELECT teacher_id FROM courses WHERE id = $1) as teacher_id,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = $1 AND student_id = $2) as is_enrolled
    `;
    const accessResult = await pool.query(accessQuery, [courseId, userId]);

    const isTeacher = accessResult.rows[0].teacher_id === userId;
    const isEnrolled = parseInt(accessResult.rows[0].is_enrolled) > 0;

    if (!isTeacher && !isEnrolled && userRole !== 'admin') {
      return res.status(403).json({ error: 'يجب التسجيل في الدورة أولاً' });
    }

    // Get all lessons
    const query = `
      SELECT l.*,
        CASE WHEN lp.completed THEN true ELSE false END as user_completed,
        lp.watched_seconds
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = $2
      WHERE l.course_id = $1
      ORDER BY l.lesson_order ASC
    `;

    const result = await pool.query(query, [courseId, userId]);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

// POST /api/lessons/course/:courseId - Add lesson to course (Teacher owner only)
export async function createLesson(req, res, next) {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.id;
    const { title, description, duration, is_free, lesson_order } = req.body;

    // Check if user owns the course
    const checkQuery = 'SELECT teacher_id FROM courses WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [courseId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    if (checkResult.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ error: 'غير مسموح بإضافة دروس لهذه الدورة' });
    }

    // Get next order if not provided
    let finalOrder = lesson_order;
    if (!finalOrder) {
      const orderQuery = 'SELECT COALESCE(MAX(lesson_order), 0) + 1 as next_order FROM lessons WHERE course_id = $1';
      const orderResult = await pool.query(orderQuery, [courseId]);
      finalOrder = orderResult.rows[0].next_order;
    }

    const insertQuery = `
      INSERT INTO lessons (course_id, title, description, duration, is_free, lesson_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      courseId,
      title,
      description,
      duration || 0,
      is_free || false,
      finalOrder,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

// PUT /api/lessons/:id - Update lesson (Teacher owner only)
export async function updateLesson(req, res, next) {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const { title, description, duration, is_free } = req.body;

    // Check if user owns the course that this lesson belongs to
    const checkQuery = `
      SELECT c.teacher_id
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      WHERE l.id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدرس غير موجود' });
    }

    if (checkResult.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ error: 'غير مسموح بتحديث هذا الدرس' });
    }

    const updateQuery = `
      UPDATE lessons
      SET title = $1, description = $2, duration = $3, is_free = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [title, description, duration, is_free, id]);

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/lessons/:id - Delete lesson (Teacher owner only)
export async function deleteLesson(req, res, next) {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    // Check if user owns the course that this lesson belongs to
    const checkQuery = `
      SELECT c.teacher_id, l.bunny_video_id
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      WHERE l.id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدرس غير موجود' });
    }

    if (checkResult.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ error: 'غير مسموح بحذف هذا الدرس' });
    }

    // TODO: Delete video from Bunny if exists
    // const bunnyVideoId = checkResult.rows[0].bunny_video_id;
    // if (bunnyVideoId) {
    //   await bunny.deleteVideo(bunnyVideoId);
    // }

    await pool.query('DELETE FROM lessons WHERE id = $1', [id]);

    res.json({ message: 'تم حذف الدرس بنجاح' });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/lessons/reorder - Reorder lessons (Teacher owner only, used with dnd-kit)
export async function reorderLessons(req, res, next) {
  try {
    const teacherId = req.user.id;
    const { courseId, lessons } = req.body; // lessons: [{ id, order }, ...]

    // Check if user owns the course
    const checkQuery = 'SELECT teacher_id FROM courses WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [courseId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    if (checkResult.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ error: 'غير مسموح بإعادة ترتيب دروس هذه الدورة' });
    }

    // Update all lesson orders in a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const lesson of lessons) {
        await client.query(
          'UPDATE lessons SET lesson_order = $1 WHERE id = $2 AND course_id = $3',
          [lesson.order, lesson.id, courseId]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'تم إعادة ترتيب الدروس بنجاح' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
}

// GET /api/lessons/:id/watch - Get lesson with playback URL (enrolled students only)
export async function watchLesson(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get lesson and check enrollment
    const query = `
      SELECT l.*,
        c.teacher_id,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND student_id = $2) as is_enrolled
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      WHERE l.id = $1
    `;
    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'الدرس غير موجود' });
    }

    const lesson = result.rows[0];
    const isTeacher = lesson.teacher_id === userId;
    const isEnrolled = parseInt(lesson.is_enrolled) > 0;
    const isFree = lesson.is_free;

    // Check access: must be teacher, enrolled, or lesson is free
    if (!isTeacher && !isEnrolled && !isFree) {
      return res.status(403).json({ error: 'يجب التسجيل في الدورة لمشاهدة هذا الدرس' });
    }

    // Get user progress for this lesson
    const progressQuery = `
      SELECT watched_seconds, completed
      FROM lesson_progress
      WHERE lesson_id = $1 AND student_id = $2
    `;
    const progressResult = await pool.query(progressQuery, [id, userId]);

    res.json({
      ...lesson,
      progress: progressResult.rows[0] || { watched_seconds: 0, completed: false },
    });
  } catch (error) {
    next(error);
  }
}
