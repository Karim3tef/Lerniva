import pool from '../db/pool.js';
import { bunnyService as bunny } from '../services/bunnyService.js';

// POST /api/upload/video - Get Bunny upload credentials for lesson video
export async function uploadVideo(req, res, next) {
  try {
    const teacherId = req.user.id;
    const { lessonId, title } = req.body;

    // Check if user owns the course that this lesson belongs to
    const checkQuery = `
      SELECT c.teacher_id, l.id
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      WHERE l.id = $1
    `;
    const checkResult = await pool.query(checkQuery, [lessonId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدرس غير موجود' });
    }

    if (checkResult.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ error: 'غير مسموح برفع فيديو لهذا الدرس' });
    }

    // Create video in Bunny Stream
    const { videoId } = await bunny.createVideo(title);

    // Update lesson with bunny_video_id
    await pool.query(
      'UPDATE lessons SET bunny_video_id = $1 WHERE id = $2',
      [videoId, lessonId]
    );

    // Return upload URL for TUS upload
    const uploadUrl = bunny.getUploadUrl(videoId);
    const uploadHeaders = bunny.getTusAuth(videoId);

    res.json({
      videoId,
      uploadUrl,
      uploadHeaders,
      message: 'تم إنشاء الفيديو، يمكنك الآن رفع الملف',
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/upload/thumbnail - Upload thumbnail for course or lesson
export async function uploadThumbnail(req, res, next) {
  try {
    const teacherId = req.user.id;
    const { courseId, file } = req.body;

    if (!courseId || !file) {
      return res.status(400).json({ error: 'البيانات المطلوبة غير مكتملة' });
    }

    // Check if user owns the course
    const checkQuery = 'SELECT teacher_id FROM courses WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [courseId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'الدورة غير موجودة' });
    }

    if (checkResult.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ error: 'غير مسموح برفع صورة لهذه الدورة' });
    }

    // In a real implementation, you would:
    // 1. Upload to a storage service (S3, Cloudinary, etc.)
    // 2. Get the URL
    // 3. Update the course thumbnail

    // For now, we'll just return a placeholder response
    // This assumes the frontend handles the actual file upload to a CDN
    const thumbnailUrl = file; // Assuming file is already a URL from client-side upload

    await pool.query(
      'UPDATE courses SET thumbnail_url = $1 WHERE id = $2',
      [thumbnailUrl, courseId]
    );

    res.json({
      thumbnailUrl,
      message: 'تم رفع الصورة بنجاح',
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/upload/video/:bunnyVideoId - Delete video from Bunny
export async function deleteVideo(req, res, next) {
  try {
    const teacherId = req.user.id;
    const { bunnyVideoId } = req.params;

    // Check if user owns the lesson with this video
    const checkQuery = `
      SELECT c.teacher_id, l.id
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      WHERE l.bunny_video_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [bunnyVideoId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'الفيديو غير موجود' });
    }

    if (checkResult.rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ error: 'غير مسموح بحذف هذا الفيديو' });
    }

    // Delete from Bunny Stream
    await bunny.deleteVideo(bunnyVideoId);

    // Clear video references from lesson
    await pool.query(
      'UPDATE lessons SET bunny_video_id = NULL, bunny_playback_url = NULL WHERE bunny_video_id = $1',
      [bunnyVideoId]
    );

    res.json({ message: 'تم حذف الفيديو بنجاح' });
  } catch (error) {
    next(error);
  }
}
