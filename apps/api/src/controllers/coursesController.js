import pool from '../db/pool.js';

// GET /api/courses - List published and approved courses
export async function listCourses(req, res, next) {
  try {
    const { category, level, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*,
        u.name as teacher_name,
        u.avatar as teacher_avatar,
        cat.name as category_name,
        COUNT(DISTINCT e.id) as students_count,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as reviews_count
      FROM courses c
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE c.is_published = true AND c.approval_status = 'approved'
    `;

    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND c.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (level) {
      query += ` AND c.level = $${paramIndex}`;
      params.push(level);
      paramIndex++;
    }

    if (search) {
      query += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY c.id, u.name, u.avatar, cat.name`;
    query += ` ORDER BY c.created_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM courses c
      WHERE c.is_published = true AND c.approval_status = 'approved'
    `;
    const countParams = [];
    let countParamIndex = 1;

    if (category) {
      countQuery += ` AND c.category_id = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }

    if (level) {
      countQuery += ` AND c.level = $${countParamIndex}`;
      countParams.push(level);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (c.title ILIKE $${countParamIndex} OR c.description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      courses: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/courses/:id - Get course detail
export async function getCourse(req, res, next) {
  try {
    const { id } = req.params;

    const courseQuery = `
      SELECT c.*,
        u.name as teacher_name,
        u.avatar as teacher_avatar,
        u.bio as teacher_bio,
        cat.name as category_name,
        COUNT(DISTINCT e.id) as students_count,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as reviews_count
      FROM courses c
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE c.id = $1
      GROUP BY c.id, u.name, u.avatar, u.bio, cat.name
    `;

    const courseResult = await pool.query(courseQuery, [id]);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    const course = courseResult.rows[0];

    // Get lessons preview (title, order, duration only for non-enrolled)
    const lessonsQuery = `
      SELECT id, title, lesson_order, duration, is_free
      FROM lessons
      WHERE course_id = $1
      ORDER BY lesson_order ASC
    `;
    const lessonsResult = await pool.query(lessonsQuery, [id]);

    // Get recent reviews
    const reviewsQuery = `
      SELECT r.*, u.name as user_name, u.avatar as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.course_id = $1
      ORDER BY r.created_at DESC
      LIMIT 5
    `;
    const reviewsResult = await pool.query(reviewsQuery, [id]);

    res.json({
      ...course,
      lessons: lessonsResult.rows,
      recent_reviews: reviewsResult.rows,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/courses - Create course (Teacher only)
export async function createCourse(req, res, next) {
  try {
    const teacherId = req.user.id;
    const {
      title,
      description,
      category_id,
      level,
      price,
      thumbnail,
      what_you_will_learn,
      requirements,
    } = req.body;

    const query = `
      INSERT INTO courses (
        teacher_id, title, description, category_id, level,
        price, thumbnail, what_you_will_learn, requirements,
        is_published, approval_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, 'pending')
      RETURNING *
    `;

    const result = await pool.query(query, [
      teacherId,
      title,
      description,
      category_id,
      level,
      price,
      thumbnail,
      what_you_will_learn,
      requirements,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

// PUT /api/courses/:id - Update course (Teacher owner only)
export async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const {
      title,
      description,
      category_id,
      level,
      price,
      thumbnail,
      what_you_will_learn,
      requirements,
    } = req.body;

    // Check ownership
    const checkQuery = 'SELECT teacher_id FROM courses WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    if (checkResult.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ error: 'غير مسموح بتحديث هذه الدورة' });
    }

    const updateQuery = `
      UPDATE courses
      SET title = $1, description = $2, category_id = $3, level = $4,
          price = $5, thumbnail = $6, what_you_will_learn = $7,
          requirements = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      title,
      description,
      category_id,
      level,
      price,
      thumbnail,
      what_you_will_learn,
      requirements,
      id,
    ]);

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/courses/:id - Delete course (Teacher owner only)
export async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    // Check ownership
    const checkQuery = 'SELECT teacher_id FROM courses WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    if (checkResult.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ error: 'غير مسموح بحذف هذه الدورة' });
    }

    // Delete course (cascade will handle related records)
    await pool.query('DELETE FROM courses WHERE id = $1', [id]);

    res.json({ message: 'تم حذف الدورة بنجاح' });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/courses/:id/publish - Toggle publish status (Teacher owner only)
export async function togglePublish(req, res, next) {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    // Check ownership
    const checkQuery = 'SELECT teacher_id, is_published FROM courses WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    if (checkResult.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ error: 'غير مسموح بتحديث هذه الدورة' });
    }

    const newStatus = !checkResult.rows[0].is_published;

    const updateQuery = `
      UPDATE courses
      SET is_published = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [newStatus, id]);

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

// GET /api/courses/teacher/mine - Get all courses for authenticated teacher
export async function getTeacherCourses(req, res, next) {
  try {
    const teacherId = req.user.id;

    const query = `
      SELECT c.*,
        cat.name as category_name,
        COUNT(DISTINCT e.id) as students_count,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as reviews_count,
        COUNT(DISTINCT l.id) as lessons_count
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      LEFT JOIN lessons l ON c.id = l.course_id
      WHERE c.teacher_id = $1
      GROUP BY c.id, cat.name
      ORDER BY c.created_at DESC
    `;

    const result = await pool.query(query, [teacherId]);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

// GET /api/courses/:id/stats - Get course statistics (Teacher owner only)
export async function getCourseStats(req, res, next) {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    // Check ownership
    const checkQuery = 'SELECT teacher_id FROM courses WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    if (checkResult.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ error: 'غير مسموح' });
    }

    // Get comprehensive stats
    const statsQuery = `
      SELECT
        COUNT(DISTINCT e.id) as total_students,
        COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as total_revenue_count,
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount END), 0) as total_revenue,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as total_reviews,
        COUNT(DISTINCT l.id) as total_lessons
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN payments p ON c.id = p.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      LEFT JOIN lessons l ON c.id = l.course_id
      WHERE c.id = $1
    `;

    const result = await pool.query(statsQuery, [id]);

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}
