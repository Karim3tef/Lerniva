import pool from '../db/pool.js';
import { stripeService } from '../services/stripeService.js';

// GET /api/admin/users - Get paginated user list
export async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, name, email, role, status, avatar, created_at FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (role) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;

    if (role) {
      countQuery += ` AND role = $${countParamIndex}`;
      countParams.push(role);
      countParamIndex++;
    }

    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (name ILIKE $${countParamIndex} OR email ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      users: result.rows,
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

// PATCH /api/admin/users/:id/status - Ban or activate user
export async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'حالة غير صالحة' });
    }

    const query = `
      UPDATE users
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, role, status
    `;

    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json({
      ...result.rows[0],
      message: status === 'banned' ? 'تم حظر المستخدم' : 'تم تفعيل المستخدم',
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/courses/pending - Get courses awaiting approval
export async function getPendingCourses(req, res, next) {
  try {
    const query = `
      SELECT c.*,
        u.name as teacher_name,
        u.email as teacher_email,
        cat.name as category_name,
        COUNT(l.id) as lessons_count
      FROM courses c
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN lessons l ON c.id = l.course_id
      WHERE c.approval_status = 'pending'
      GROUP BY c.id, u.name, u.email, cat.name
      ORDER BY c.created_at ASC
    `;

    const result = await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/courses/:id/approve - Approve course
export async function approveCourse(req, res, next) {
  try {
    const { id } = req.params;

    const query = `
      UPDATE courses
      SET approval_status = 'approved', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    // Notify teacher
    const teacherId = result.rows[0].teacher_id;
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'course_approved', 'تمت الموافقة على الدورة', 'تمت الموافقة على دورتك وهي الآن متاحة للطلاب', $2)`,
      [teacherId, `/teacher/courses/${id}`]
    );

    res.json({
      ...result.rows[0],
      message: 'تمت الموافقة على الدورة',
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/courses/:id/reject - Reject course
export async function rejectCourse(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const query = `
      UPDATE courses
      SET approval_status = 'rejected', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    // Notify teacher
    const teacherId = result.rows[0].teacher_id;
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'course_rejected', 'تم رفض الدورة', $2, $3)`,
      [teacherId, `تم رفض دورتك. السبب: ${reason || 'غير محدد'}`, `/teacher/courses/${id}`]
    );

    res.json({
      ...result.rows[0],
      message: 'تم رفض الدورة',
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/payments - Get all payments with pagination
export async function getAllPayments(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*,
        c.title as course_title,
        s.name as student_name,
        s.email as student_email,
        t.name as teacher_name
      FROM payments p
      JOIN courses c ON p.course_id = c.id
      JOIN users s ON p.student_id = s.id
      JOIN users t ON c.teacher_id = t.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM payments WHERE 1=1';
    const countParams = status ? [status] : [];

    if (status) {
      countQuery += ' AND status = $1';
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      payments: result.rows,
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

// POST /api/admin/refund/:paymentId - Process refund
export async function processRefund(req, res, next) {
  try {
    const { paymentId } = req.params;

    // Get payment details
    const paymentQuery = 'SELECT * FROM payments WHERE id = $1';
    const paymentResult = await pool.query(paymentQuery, [paymentId]);

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدفعة غير موجودة' });
    }

    const payment = paymentResult.rows[0];

    if (payment.status === 'refunded') {
      return res.status(400).json({ error: 'تم استرداد هذه الدفعة بالفعل' });
    }

    // Process Stripe refund
    await stripeService.createRefund(payment.stripe_payment_intent_id);

    // Update payment status
    await pool.query(
      `UPDATE payments SET status = 'refunded', updated_at = NOW() WHERE id = $1`,
      [paymentId]
    );

    // Remove enrollment
    await pool.query(
      'DELETE FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [payment.course_id, payment.student_id]
    );

    // Notify student
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'refund', 'تم استرداد المبلغ', 'تم استرداد مبلغ الدورة بنجاح')`,
      [payment.student_id]
    );

    res.json({ message: 'تم استرداد المبلغ بنجاح' });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/stats - Get platform-wide statistics
export async function getPlatformStats(req, res, next) {
  try {
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'teacher') as total_teachers,
        (SELECT COUNT(*) FROM courses WHERE approval_status = 'approved') as total_courses,
        (SELECT COUNT(*) FROM courses WHERE approval_status = 'pending') as pending_courses,
        (SELECT COUNT(*) FROM enrollments) as total_enrollments,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') as total_revenue,
        (SELECT COALESCE(SUM(platform_amount), 0) FROM payments WHERE status = 'completed') as platform_revenue,
        (SELECT COUNT(*) FROM payments WHERE status = 'completed' AND created_at > NOW() - INTERVAL '30 days') as monthly_sales
    `;

    const result = await pool.query(statsQuery);

    // Get popular courses
    const popularCoursesQuery = `
      SELECT c.id, c.title, c.thumbnail,
        COUNT(e.id) as enrollments_count,
        COALESCE(AVG(r.rating), 0) as avg_rating
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE c.approval_status = 'approved'
      GROUP BY c.id
      ORDER BY enrollments_count DESC
      LIMIT 5
    `;

    const popularCourses = await pool.query(popularCoursesQuery);

    // Get recent activities
    const recentActivitiesQuery = `
      SELECT 'enrollment' as type, e.enrolled_at as created_at,
        u.name as user_name, c.title as course_title
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.enrolled_at DESC
      LIMIT 10
    `;

    const recentActivities = await pool.query(recentActivitiesQuery);

    res.json({
      stats: result.rows[0],
      popular_courses: popularCourses.rows,
      recent_activities: recentActivities.rows,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/audit-logs - Get audit log entries
export async function getAuditLogs(req, res, next) {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (action) {
      query += ` AND al.action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }

    if (userId) {
      query += ` AND al.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}
