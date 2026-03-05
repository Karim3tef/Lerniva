import pool from '../db/pool.js';
import { stripeService } from '../services/stripeService.js';

// POST /api/payments/checkout - Create Stripe checkout session
export async function createCheckout(req, res, next) {
  try {
    const studentId = req.user.id;
    const studentEmail = req.user.email;
    const { courseId } = req.body;

    // Get course details
    const courseQuery = 'SELECT id, title, price, teacher_id FROM courses WHERE id = $1';
    const courseResult = await pool.query(courseQuery, [courseId]);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    const course = courseResult.rows[0];

    if (parseFloat(course.price) === 0) {
      return res.status(400).json({ error: 'هذه الدورة مجانية، يمكنك التسجيل مباشرة' });
    }

    // Check if already enrolled
    const enrollmentCheck = await pool.query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [courseId, studentId]
    );

    if (enrollmentCheck.rows.length > 0) {
      return res.status(400).json({ error: 'أنت مسجل بالفعل في هذه الدورة' });
    }

    // Create Stripe checkout session
    const session = await stripeService.createCheckoutSession({
      courseId: course.id,
      courseTitle: course.title,
      price: parseFloat(course.price),
      studentEmail,
      studentId,
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/payments/mine - Get payment history for student
export async function getMyPayments(req, res, next) {
  try {
    const studentId = req.user.id;

    const query = `
      SELECT p.*,
        c.title as course_title,
        c.thumbnail as course_thumbnail,
        u.name as teacher_name
      FROM payments p
      JOIN courses c ON p.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE p.student_id = $1
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query, [studentId]);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

// GET /api/payments/teacher/revenue - Get revenue data for teacher
export async function getTeacherRevenue(req, res, next) {
  try {
    const teacherId = req.user.id;

    const query = `
      SELECT
        COUNT(DISTINCT p.id) as total_sales,
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.teacher_amount END), 0) as teacher_earnings,
        COALESCE(SUM(CASE WHEN p.status = 'refunded' THEN p.amount END), 0) as refunded_amount,
        COUNT(DISTINCT p.student_id) as unique_students
      FROM payments p
      JOIN courses c ON p.course_id = c.id
      WHERE c.teacher_id = $1
    `;

    const statsResult = await pool.query(query, [teacherId]);

    // Get recent transactions
    const transactionsQuery = `
      SELECT p.*,
        c.title as course_title,
        u.name as student_name
      FROM payments p
      JOIN courses c ON p.course_id = c.id
      JOIN users u ON p.student_id = u.id
      WHERE c.teacher_id = $1
      ORDER BY p.created_at DESC
      LIMIT 20
    `;

    const transactionsResult = await pool.query(transactionsQuery, [teacherId]);

    res.json({
      stats: statsResult.rows[0],
      recent_transactions: transactionsResult.rows,
    });
  } catch (error) {
    next(error);
  }
}
