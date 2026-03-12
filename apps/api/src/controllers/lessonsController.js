import pool from '../db/pool.js';
import { bunnyService as bunny } from '../services/bunnyService.js';

// GET /api/lessons/course/:courseId - Get lessons for a course (enrolled or teacher)
export async function getCourseLessons(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const accessQuery = `
      SELECT
        (SELECT teacher_id FROM courses WHERE id = $1) as teacher_id,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = $1 AND student_id = $2) as is_enrolled
    `;
    const accessResult = await pool.query(accessQuery, [courseId, userId]);

    const isTeacher = accessResult.rows[0]?.teacher_id === userId;
    const isEnrolled = parseInt(accessResult.rows[0]?.is_enrolled || 0, 10) > 0;

    if (!isTeacher && !isEnrolled && userRole !== 'admin') {
      return res.status(403).json({ error: 'يجب التسجيل في الدورة أولاً' });
    }

    const query = `
      SELECT l.*,
        CASE WHEN lp.completed THEN true ELSE false END as user_completed,
        lp.watched_seconds
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = $2
      WHERE l.course_id = $1
      ORDER BY l.order_number ASC
    `;

    const result = await pool.query(query, [courseId, userId]);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

// POST /api/lessons/course/:courseId OR /api/lessons - Add lesson to course (Teacher owner only)
export async function createLesson(req, res, next) {
  try {
    const courseId = req.params.courseId || req.body.course_id;
    const teacherId = req.user.id;
    const {
      title,
      duration,
      is_preview,
      is_free,
      order_number,
      lesson_order,
    } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'course_id مطلوب' });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'عنوان الدرس مطلوب' });
    }

    const checkQuery = 'SELECT teacher_id FROM courses WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [courseId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    if (checkResult.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ error: 'غير مسموح بإضافة دروس لهذه الدورة' });
    }

    let finalOrder = order_number || lesson_order;
    if (!finalOrder) {
      const orderQuery = 'SELECT COALESCE(MAX(order_number), 0) + 1 as next_order FROM lessons WHERE course_id = $1';
      const orderResult = await pool.query(orderQuery, [courseId]);
      finalOrder = orderResult.rows[0].next_order;
    }

    const insertQuery = `
      INSERT INTO lessons (course_id, title, duration, is_preview, order_number)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      courseId,
      title,
      Number(duration || 0),
      is_preview === true || is_free === true,
      Number(finalOrder),
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

// PUT/PATCH /api/lessons/:id - Update lesson (Teacher owner only)
export async function updateLesson(req, res, next) {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const {
      title,
      duration,
      is_preview,
      is_free,
      order_number,
      lesson_order,
    } = req.body;

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

    const previewValue =
      is_preview === undefined && is_free === undefined
        ? undefined
        : is_preview === true || is_free === true;

    const updateQuery = `
      UPDATE lessons
      SET
        title = COALESCE($1, title),
        duration = COALESCE($2, duration),
        is_preview = COALESCE($3, is_preview),
        order_number = COALESCE($4, order_number)
      WHERE id = $5
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      title,
      duration === undefined ? undefined : Number(duration),
      previewValue,
      order_number || lesson_order,
      id,
    ]);

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

    await pool.query('DELETE FROM lessons WHERE id = $1', [id]);

    res.json({ message: 'تم حذف الدرس بنجاح' });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/lessons/reorder - Reorder lessons (Teacher owner only)
export async function reorderLessons(req, res, next) {
  try {
    const teacherId = req.user.id;
    const { courseId, lessons } = req.body;

    const checkQuery = 'SELECT teacher_id FROM courses WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [courseId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    if (checkResult.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ error: 'غير مسموح بإعادة ترتيب دروس هذه الدورة' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const lesson of lessons || []) {
        await client.query(
          'UPDATE lessons SET order_number = $1 WHERE id = $2 AND course_id = $3',
          [lesson.order ?? lesson.order_number, lesson.id, courseId]
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
    const isEnrolled = parseInt(lesson.is_enrolled, 10) > 0;
    const isFree = lesson.is_preview;

    if (!isTeacher && !isEnrolled && !isFree) {
      return res.status(403).json({ error: 'يجب التسجيل في الدورة لمشاهدة هذا الدرس' });
    }

    // Fallback: if webhook did not update playback URL yet, try resolving it from Bunny API.
    if (!lesson.bunny_playback_url && lesson.bunny_video_id) {
      const status = await bunny.getVideoStatus(lesson.bunny_video_id);
      if (status === 4) {
        const playbackUrl = bunny.getPlaybackUrl(lesson.bunny_video_id, { signed: false });
        lesson.bunny_playback_url = playbackUrl;
        await pool.query(
          'UPDATE lessons SET bunny_playback_url = $1 WHERE id = $2',
          [playbackUrl, lesson.id]
        );
      }
    }

    // Serve signed CDN URL when token auth is enabled.
    if (lesson.bunny_video_id && lesson.bunny_playback_url) {
      lesson.bunny_playback_url = bunny.getPlaybackUrl(lesson.bunny_video_id, { signed: true });
    }

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
