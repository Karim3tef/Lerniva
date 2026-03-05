import pool from '../db/pool.js';

export const notificationService = {
  // Create notification
  async create({ userId, type, title, message, link = null }) {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, type, title, message, link]
    );
    // Trigger will automatically send pg_notify
    return result.rows[0];
  },

  // Bulk create notifications
  async createMany(notifications) {
    const promises = notifications.map(notif => this.create(notif));
    return Promise.all(promises);
  },

  // Get user notifications
  async getUserNotifications(userId, limit = 20) {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  // Mark as read
  async markAsRead(notificationId, userId) {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );
    return result.rows[0];
  },

  // Mark all as read
  async markAllAsRead(userId) {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [userId]
    );
  },

  // Get unread count
  async getUnreadCount(userId) {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  },
};
