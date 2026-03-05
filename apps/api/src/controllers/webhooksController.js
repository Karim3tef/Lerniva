import pool from '../db/pool.js';
import { stripeService } from '../services/stripeService.js';
import { bunnyService } from '../services/bunnyService.js';
import { notificationService } from '../services/notificationService.js';

// POST /api/webhooks/stripe - Handle Stripe webhook events
export async function handleStripeWebhook(req, res, next) {
  try {
    const signature = req.headers['stripe-signature'];
    const event = stripeService.verifyWebhook(req.body, signature);

    if (!event) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { courseId, studentId } = session.metadata;

      // Get course details
      const courseQuery = 'SELECT id, title, price, teacher_id FROM courses WHERE id = $1';
      const courseResult = await pool.query(courseQuery, [courseId]);

      if (courseResult.rows.length === 0) {
        console.error('Course not found:', courseId);
        return res.json({ received: true });
      }

      const course = courseResult.rows[0];
      const amount = parseFloat(course.price);

      // Calculate platform commission (e.g., 20%)
      const platformCommission = 0.20;
      const platformAmount = amount * platformCommission;
      const teacherAmount = amount - platformAmount;

      // Create payment record
      const paymentQuery = `
        INSERT INTO payments (
          student_id, course_id, amount, teacher_amount,
          platform_amount, status, stripe_session_id, stripe_payment_intent_id
        )
        VALUES ($1, $2, $3, $4, $5, 'completed', $6, $7)
        RETURNING id
      `;

      const paymentResult = await pool.query(paymentQuery, [
        studentId,
        courseId,
        amount,
        teacherAmount,
        platformAmount,
        session.id,
        session.payment_intent,
      ]);

      // Enroll student in course
      const enrollmentQuery = `
        INSERT INTO enrollments (course_id, student_id)
        VALUES ($1, $2)
        ON CONFLICT (course_id, student_id) DO NOTHING
      `;
      await pool.query(enrollmentQuery, [courseId, studentId]);

      // Create notification for student
      await notificationService.create({
        userId: studentId,
        type: 'enrollment',
        title: 'تم التسجيل بنجاح',
        message: `تم تسجيلك في دورة "${course.title}" بنجاح`,
        link: `/learn/${courseId}`,
      });

      // Create notification for teacher
      await notificationService.create({
        userId: course.teacher_id,
        type: 'new_student',
        title: 'طالب جديد',
        message: `انضم طالب جديد إلى دورتك "${course.title}"`,
        link: `/teacher/courses/${courseId}`,
      });

      console.log('Payment processed successfully:', paymentResult.rows[0].id);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    next(error);
  }
}

// POST /api/webhooks/bunny - Handle Bunny Stream webhook events
export async function handleBunnyWebhook(req, res, next) {
  try {
    const signature = req.headers['bunny-signature'];
    const rawBody = req.body.toString();

    if (!bunnyService.verifyWebhook(rawBody, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody);

    // Handle video encoding completion
    if (event.Status === 4) {
      // Status 4 = Finished encoding
      const videoId = event.VideoGuid;
      const playbackUrl = bunnyService.getPlaybackUrl(videoId);

      // Update lesson with playback URL
      const updateQuery = `
        UPDATE lessons
        SET bunny_playback_url = $1, updated_at = NOW()
        WHERE bunny_video_id = $2
        RETURNING id, course_id
      `;

      const result = await pool.query(updateQuery, [playbackUrl, videoId]);

      if (result.rows.length > 0) {
        const lesson = result.rows[0];

        // Get course and teacher info
        const courseQuery = 'SELECT teacher_id, title FROM courses WHERE id = $1';
        const courseResult = await pool.query(courseQuery, [lesson.course_id]);

        if (courseResult.rows.length > 0) {
          const course = courseResult.rows[0];

          // Notify teacher that video is ready
          await notificationService.create({
            userId: course.teacher_id,
            type: 'video_ready',
            title: 'اكتملت معالجة الفيديو',
            message: `تمت معالجة الفيديو بنجاح وهو جاهز للعرض في دورة "${course.title}"`,
            link: `/teacher/courses/${lesson.course_id}`,
          });
        }

        console.log('Video encoding completed:', videoId);
      }
    }

    // Handle encoding error
    if (event.Status === 5) {
      // Status 5 = Error
      const videoId = event.VideoGuid;
      console.error('Bunny encoding error for video:', videoId);

      // Get lesson and notify teacher
      const lessonQuery = `
        SELECT l.id, l.course_id, c.teacher_id, c.title
        FROM lessons l
        JOIN courses c ON l.course_id = c.id
        WHERE l.bunny_video_id = $1
      `;

      const result = await pool.query(lessonQuery, [videoId]);

      if (result.rows.length > 0) {
        const { teacher_id, title } = result.rows[0];

        await notificationService.create({
          userId: teacher_id,
          type: 'video_error',
          title: 'خطأ في معالجة الفيديو',
          message: `حدث خطأ أثناء معالجة الفيديو في دورة "${title}". يرجى المحاولة مرة أخرى`,
          link: `/teacher/courses/${result.rows[0].course_id}`,
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Bunny webhook error:', error);
    next(error);
  }
}
