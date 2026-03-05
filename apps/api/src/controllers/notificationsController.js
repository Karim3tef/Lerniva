import pool from '../db/pool.js';

// GET /api/notifications - Get notifications for authenticated user
export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const query = `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);

    // Get unread count
    const unreadQuery = `
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `;

    const unreadResult = await pool.query(unreadQuery, [userId]);

    res.json({
      notifications: result.rows,
      unread_count: parseInt(unreadResult.rows[0].unread_count),
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/notifications/:id/read - Mark notification as read
export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'الإشعار غير موجود' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

// PUT /api/notifications/read-all - Mark all notifications as read
export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;

    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE user_id = $1 AND is_read = false
      RETURNING COUNT(*) as updated_count
    `;

    await pool.query(query, [userId]);

    res.json({ message: 'تم تعليم جميع الإشعارات كمقروءة' });
  } catch (error) {
    next(error);
  }
}
