import pool from '../db/pool.js';
import { stripeService } from '../services/stripeService.js';

async function ensureVerifiedStudent(studentId) {
  const userResult = await pool.query(
    'SELECT email_verified FROM users WHERE id = $1',
    [studentId]
  );

  if (userResult.rows.length === 0) return { ok: false, reason: 'not_found' };
  if (!userResult.rows[0].email_verified) return { ok: false, reason: 'unverified' };
  return { ok: true };
}

// POST /api/payments/checkout - Create Stripe checkout session
export async function createCheckout(req, res, next) {
  try {
    const studentId = req.user.id;
    const studentEmail = req.user.email;
    const { courseId } = req.body;

    const verification = await ensureVerifiedStudent(studentId);
    if (!verification.ok && verification.reason === 'unverified') {
      return res.status(403).json({ error: 'يرجى تأكيد بريدك الإلكتروني قبل الاشتراك في الدورات' });
    }

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

// POST /api/payments/confirm - Confirm checkout session and ensure enrollment
export async function confirmCheckout(req, res, next) {
  try {
    const studentId = req.user.id;
    const { sessionId } = req.body;

    const verification = await ensureVerifiedStudent(studentId);
    if (!verification.ok && verification.reason === 'unverified') {
      return res.status(403).json({ error: 'يرجى تأكيد بريدك الإلكتروني قبل الاشتراك في الدورات' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId مطلوب' });
    }

    const session = await stripeService.getCheckoutSession(sessionId);

    if (!session || session.mode !== 'payment' || session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'جلسة الدفع غير مكتملة' });
    }

    const { courseId, studentId: metadataStudentId } = session.metadata || {};
    if (!courseId || !metadataStudentId) {
      return res.status(400).json({ error: 'بيانات الجلسة غير مكتملة' });
    }

    if (metadataStudentId !== studentId) {
      return res.status(403).json({ error: 'غير مسموح' });
    }

    const courseResult = await pool.query(
      'SELECT id, price FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    const amount = Number(session.amount_total || 0) / 100;
    const currency = (session.currency || 'egp').toLowerCase();
    const platformAmount = amount * 0.20;
    const teacherAmount = amount - platformAmount;

    // Always ensure course access even if payment-row persistence fails for any schema mismatch.
    await pool.query(
      `
      INSERT INTO enrollments (course_id, student_id)
      VALUES ($1, $2)
      ON CONFLICT (course_id, student_id) DO NOTHING
      `,
      [courseId, studentId]
    );

    let paymentRecorded = true;
    try {
      await pool.query(
        `
        INSERT INTO payments (
          student_id, course_id, amount, teacher_amount, platform_amount,
          currency, status, stripe_session_id, stripe_payment_intent_id, paid_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'completed', $7, $8, NOW())
        ON CONFLICT (stripe_session_id) DO NOTHING
        `,
        [
          studentId,
          courseId,
          amount,
          teacherAmount,
          platformAmount,
          currency,
          session.id,
          session.payment_intent,
        ]
      );
    } catch (paymentErr) {
      paymentRecorded = false;
      console.error('Payment insert failed after enrollment confirmation:', paymentErr.message);
    }

    res.json({ confirmed: true, courseId, paymentRecorded });
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
