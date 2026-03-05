import pool from '../db/pool.js';

// GET /api/teachers/analytics - Get teacher analytics
export async function getTeacherAnalytics(req, res, next) {
  try {
    const teacherId = req.user.id;

    // Get revenue and earnings stats
    const revenueQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.teacher_amount END), 0) as total_earnings,
        COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as total_sales,
        COUNT(DISTINCT CASE WHEN p.status = 'refunded' THEN p.id END) as refund_count
      FROM courses c
      LEFT JOIN payments p ON c.id = p.course_id
      WHERE c.teacher_id = $1
    `;

    const revenueResult = await pool.query(revenueQuery, [teacherId]);

    // Get student stats
    const studentsQuery = `
      SELECT
        COUNT(DISTINCT e.student_id) as total_students,
        COUNT(DISTINCT CASE WHEN e.enrolled_at > NOW() - INTERVAL '30 days' THEN e.student_id END) as new_students_this_month
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.teacher_id = $1
    `;

    const studentsResult = await pool.query(studentsQuery, [teacherId]);

    // Get course stats
    const coursesQuery = `
      SELECT
        COUNT(*) as total_courses,
        COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_courses,
        COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_courses,
        COUNT(CASE WHEN is_published = true THEN 1 END) as published_courses
      FROM courses
      WHERE teacher_id = $1
    `;

    const coursesResult = await pool.query(coursesQuery, [teacherId]);

    // Get average rating
    const ratingQuery = `
      SELECT COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.id) as total_reviews
      FROM courses c
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE c.teacher_id = $1
    `;

    const ratingResult = await pool.query(ratingQuery, [teacherId]);

    // Get monthly revenue trend (last 6 months)
    const trendQuery = `
      SELECT
        DATE_TRUNC('month', p.created_at) as month,
        COALESCE(SUM(p.teacher_amount), 0) as earnings,
        COUNT(*) as sales_count
      FROM courses c
      LEFT JOIN payments p ON c.id = p.course_id AND p.status = 'completed'
      WHERE c.teacher_id = $1 AND p.created_at > NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', p.created_at)
      ORDER BY month DESC
    `;

    const trendResult = await pool.query(trendQuery, [teacherId]);

    // Get top performing courses
    const topCoursesQuery = `
      SELECT
        c.id, c.title, c.thumbnail,
        COUNT(DISTINCT e.id) as enrollments_count,
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.teacher_amount END), 0) as earnings,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as reviews_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN payments p ON c.id = p.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE c.teacher_id = $1
      GROUP BY c.id
      ORDER BY enrollments_count DESC
      LIMIT 5
    `;

    const topCoursesResult = await pool.query(topCoursesQuery, [teacherId]);

    res.json({
      revenue: revenueResult.rows[0],
      students: studentsResult.rows[0],
      courses: coursesResult.rows[0],
      rating: ratingResult.rows[0],
      monthly_trend: trendResult.rows,
      top_courses: topCoursesResult.rows,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/teachers/students - Get students enrolled in teacher's courses
export async function getTeacherStudents(req, res, next) {
  try {
    const teacherId = req.user.id;
    const { page = 1, limit = 20, courseId } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT DISTINCT
        u.id, u.name, u.email, u.avatar,
        e.enrolled_at,
        c.id as course_id, c.title as course_title,
        COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.completed = true) as completed_lessons,
        COUNT(DISTINCT l.id) as total_lessons
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      JOIN users u ON e.student_id = u.id
      LEFT JOIN lessons l ON c.id = l.course_id
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = u.id
      WHERE c.teacher_id = $1
    `;

    const params = [teacherId];
    let paramIndex = 2;

    if (courseId) {
      query += ` AND c.id = $${paramIndex}`;
      params.push(courseId);
      paramIndex++;
    }

    query += ` GROUP BY u.id, e.enrolled_at, c.id, c.title`;
    query += ` ORDER BY e.enrolled_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT e.student_id) as total
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      WHERE c.teacher_id = $1
    `;

    const countParams = [teacherId];

    if (courseId) {
      countQuery += ' AND c.id = $2';
      countParams.push(courseId);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      students: result.rows,
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
