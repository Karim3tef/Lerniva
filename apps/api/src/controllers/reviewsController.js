import pool from '../db/pool.js';

// GET /api/reviews/course/:courseId - Get reviews for a course
export async function getCourseReviews(req, res, next) {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT r.*,
        u.full_name as user_name,
        u.avatar_url as user_avatar
      FROM reviews r
      JOIN users u ON r.student_id = u.id
      WHERE r.course_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [courseId, limit, offset]);

    // Get average rating and count
    const statsQuery = `
      SELECT
        COALESCE(AVG(rating), 0) as avg_rating,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews
      WHERE course_id = $1
    `;

    const statsResult = await pool.query(statsQuery, [courseId]);

    res.json({
      reviews: result.rows,
      stats: statsResult.rows[0],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(statsResult.rows[0].total_reviews),
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/reviews - Submit a review (enrolled students only)
export async function submitReview(req, res, next) {
  try {
    const studentId = req.user.id;
    const { courseId, rating, comment } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'التقييم يجب أن يكون بين 1 و 5' });
    }

    // Check if student is enrolled
    const enrollmentCheck = await pool.query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [courseId, studentId]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({ error: 'يجب أن تكون مسجلاً في الدورة لتقييمها' });
    }

    // Check if already reviewed
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE course_id = $1 AND student_id = $2',
      [courseId, studentId]
    );

    if (existingReview.rows.length > 0) {
      // Update existing review
      const updateQuery = `
        UPDATE reviews
        SET rating = $1, comment = $2
        WHERE course_id = $3 AND student_id = $4
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [rating, comment, courseId, studentId]);

      return res.json({
        ...result.rows[0],
        message: 'تم تحديث تقييمك بنجاح',
      });
    }

    // Create new review
    const insertQuery = `
      INSERT INTO reviews (course_id, student_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [courseId, studentId, rating, comment]);

    res.status(201).json({
      ...result.rows[0],
      message: 'شكراً لتقييمك',
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/reviews/:courseId - Delete own review
export async function deleteReview(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM reviews WHERE course_id = $1 AND student_id = $2 RETURNING id',
      [courseId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'التقييم غير موجود' });
    }

    res.json({ message: 'تم حذف التقييم بنجاح' });
  } catch (error) {
    next(error);
  }
}
