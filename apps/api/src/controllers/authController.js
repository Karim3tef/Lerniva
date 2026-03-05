import pool from '../db/pool.js';
import { jwtService } from '../services/jwtService.js';
import { notificationService } from '../services/notificationService.js';
import crypto from 'crypto';

export const authController = {
  // POST /api/auth/register
  async register(req, res, next) {
    try {
      const { full_name, email, password, role = 'student' } = req.body;

      // Validate role
      if (!['student', 'teacher'].includes(role)) {
        return res.status(400).json({ error: 'نوع المستخدم غير صحيح' });
      }

      // Check if user exists
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'البريد الإلكتروني مسجل بالفعل' });
      }

      // Hash password
      const password_hash = await jwtService.hashPassword(password);

      // Create user
      const result = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, full_name, email, role, avatar_url, created_at`,
        [full_name, email, password_hash, role]
      );

      const user = result.rows[0];

      // Generate tokens
      const accessToken = jwtService.generateAccessToken(user);
      const refreshToken = await jwtService.generateRefreshToken(user.id);

      // Set refresh token cookie
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(201).json({
        accessToken,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const result = await pool.query(
        `SELECT id, full_name, email, password_hash, role, avatar_url, is_active
         FROM users WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
      }

      const user = result.rows[0];

      // Check if user is active
      if (!user.is_active) {
        return res.status(403).json({ error: 'الحساب معطل. يرجى الاتصال بالدعم' });
      }

      // Verify password
      const isValid = await jwtService.comparePassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
      }

      // Generate tokens
      const accessToken = jwtService.generateAccessToken(user);
      const refreshToken = await jwtService.generateRefreshToken(user.id);

      // Set refresh token cookie
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        accessToken,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/refresh
  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({ error: 'غير مصرح' });
      }

      // Verify refresh token
      const tokenData = await jwtService.verifyRefreshToken(refreshToken);
      if (!tokenData) {
        res.clearCookie('refresh_token');
        return res.status(401).json({ error: 'انتهت صلاحية الجلسة' });
      }

      // Generate new access token
      const accessToken = jwtService.generateAccessToken(tokenData);

      res.json({
        accessToken,
        user: {
          id: tokenData.id,
          full_name: tokenData.full_name,
          email: tokenData.email,
          role: tokenData.role,
          avatar_url: tokenData.avatar_url,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (refreshToken) {
        await jwtService.revokeRefreshToken(refreshToken);
      }

      res.clearCookie('refresh_token');
      res.json({ message: 'تم تسجيل الخروج بنجاح' });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me
  async getMe(req, res, next) {
    try {
      const result = await pool.query(
        `SELECT id, full_name, email, role, avatar_url, bio, created_at
         FROM users WHERE id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'المستخدم غير موجود' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/auth/me
  async updateMe(req, res, next) {
    try {
      const { full_name, bio, avatar_url } = req.body;

      const result = await pool.query(
        `UPDATE users
         SET full_name = COALESCE($1, full_name),
             bio = COALESCE($2, bio),
             avatar_url = COALESCE($3, avatar_url),
             updated_at = NOW()
         WHERE id = $4
         RETURNING id, full_name, email, role, avatar_url, bio`,
        [full_name, bio, avatar_url, req.user.id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/forgot-password
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      // Find user
      const result = await pool.query(
        'SELECT id, full_name, email FROM users WHERE email = $1',
        [email]
      );

      // Always return success to prevent email enumeration
      if (result.rows.length === 0) {
        return res.json({ message: 'إذا كان البريد مسجلاً، ستتلقى رابط إعادة تعيين كلمة المرور' });
      }

      const user = result.rows[0];

      // Generate reset token (valid for 1 hour)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token (you might want to create a password_reset_tokens table)
      await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked)
         VALUES ($1, $2, $3, false)
         ON CONFLICT (token_hash) DO UPDATE SET expires_at = $3`,
        [user.id, resetTokenHash, expiresAt]
      );

      // TODO: Send email with reset link
      // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      // await emailService.sendPasswordReset(user.email, user.full_name, resetUrl);

      res.json({ message: 'إذا كان البريد مسجلاً، ستتلقى رابط إعادة تعيين كلمة المرور' });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/reset-password
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find valid reset token
      const result = await pool.query(
        `SELECT rt.user_id
         FROM refresh_tokens rt
         WHERE rt.token_hash = $1
           AND rt.revoked = false
           AND rt.expires_at > NOW()`,
        [tokenHash]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية' });
      }

      const userId = result.rows[0].user_id;

      // Hash new password
      const password_hash = await jwtService.hashPassword(newPassword);

      // Update password
      await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [password_hash, userId]
      );

      // Revoke reset token
      await pool.query(
        'UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1',
        [tokenHash]
      );

      res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error) {
      next(error);
    }
  },
};
