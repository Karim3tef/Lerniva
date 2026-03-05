import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import env from '../config/env.js';
import pool from '../db/pool.js';

export const jwtService = {
  // Generate access token (short-lived, in memory)
  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.accessExpires }
    );
  },

  // Generate refresh token (long-lived, stored in DB)
  async generateRefreshToken(userId) {
    const token = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    const days = parseInt(env.jwt.refreshExpires) || 30;
    expiresAt.setDate(expiresAt.getDate() + days);

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );

    return token;
  },

  // Verify refresh token
  async verifyRefreshToken(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await pool.query(
      `SELECT rt.*, u.id, u.email, u.role, u.full_name, u.avatar_url
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1
         AND rt.revoked = false
         AND rt.expires_at > NOW()`,
      [tokenHash]
    );

    return result.rows[0] || null;
  },

  // Revoke refresh token
  async revokeRefreshToken(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await pool.query(
      `UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1`,
      [tokenHash]
    );
  },

  // Hash password
  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  },

  // Compare password
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  },
};
