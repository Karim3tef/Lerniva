import pool from '../db/pool.js';
import { jwtService } from '../services/jwtService.js';
import { emailService } from '../services/emailService.js';
import env from '../config/env.js';
import crypto from 'crypto';

function getRefreshCookieOptions() {
  const frontendUrl = process.env.FRONTEND_URL || '';
  const isHttpsFrontend = frontendUrl.startsWith('https://');
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || (process.env.NODE_ENV === 'production' && isHttpsFrontend),
    // Stripe returns from a cross-site top-level navigation; Lax preserves cookie on that redirect.
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}

function getRefreshCookieClearOptions() {
  const frontendUrl = process.env.FRONTEND_URL || '';
  const isHttpsFrontend = frontendUrl.startsWith('https://');
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || (process.env.NODE_ENV === 'production' && isHttpsFrontend),
    sameSite: 'lax',
    path: '/',
  };
}

async function createEmailVerificationToken(userId) {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
  const expiresAt = new Date(Date.now() + env.email.verificationTokenHours * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return verificationToken;
}

async function sendVerificationEmail(user) {
  if (!emailService.isConfigured()) return false;
  const token = await createEmailVerificationToken(user.id);
  const verifyUrl = `${env.frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
  await emailService.sendEmailVerification(user.email, user.full_name, verifyUrl);
  return true;
}

function runInBackground(task, label) {
  setImmediate(() => {
    task().catch((error) => {
      console.error(`[background:${label}] failed`, error?.message || error);
    });
  });
}

export const authController = {
  // POST /api/auth/register
  async register(req, res, next) {
    try {
      const { full_name, email, password, role = 'student' } = req.body;
      const normalizedEmail = String(email || '').trim().toLowerCase();

      // Validate role
      if (!['student', 'teacher'].includes(role)) {
        return res.status(400).json({ error: 'نوع المستخدم غير صحيح' });
      }

      // Check if user exists
      const existing = await pool.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
        [normalizedEmail]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'البريد الإلكتروني مسجل بالفعل' });
      }

      // Hash password
      const password_hash = await jwtService.hashPassword(password);

      // Create user
      const emailVerified = !env.email.requireVerification;
      const result = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role, email_verified, email_verified_at)
         VALUES ($1, $2, $3, $4, $5, CASE WHEN $5 THEN NOW() ELSE NULL END)
         RETURNING id, full_name, email, role, avatar_url, created_at, email_verified`,
        [full_name, normalizedEmail, password_hash, role, emailVerified]
      );

      const user = result.rows[0];

      let verificationEmailSent = false;
      if (env.email.requireVerification) {
        verificationEmailSent = emailService.isConfigured();
        if (verificationEmailSent) {
          runInBackground(() => sendVerificationEmail(user), 'email-verification');
        }
      }

      if (env.email.requireVerification) {
        return res.status(201).json({
          message: verificationEmailSent
            ? 'تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب'
            : 'تم إنشاء الحساب. تعذر إرسال بريد التأكيد حالياً',
          emailVerificationRequired: true,
          emailVerificationSent: verificationEmailSent,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url,
            email_verified: user.email_verified,
          },
        });
      }

      // Generate tokens
      const accessToken = jwtService.generateAccessToken(user);
      const refreshToken = await jwtService.generateRefreshToken(user.id);

      // Set refresh token cookie
      res.cookie('refresh_token', refreshToken, getRefreshCookieOptions());

      res.status(201).json({
        accessToken,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          email_verified: user.email_verified,
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
      const normalizedEmail = String(email || '').trim().toLowerCase();

      // Find user
      const result = await pool.query(
        `SELECT id, full_name, email, password_hash, role, avatar_url, is_active, email_verified
         FROM users WHERE LOWER(email) = LOWER($1)`,
        [normalizedEmail]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
      }

      const user = result.rows[0];

      // Check if user is active
      if (!user.is_active) {
        return res.status(403).json({ error: 'الحساب معطل. يرجى الاتصال بالدعم' });
      }

      if (env.email.requireVerification && !user.email_verified) {
        return res.status(403).json({ error: 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول' });
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
      res.cookie('refresh_token', refreshToken, getRefreshCookieOptions());

      res.json({
        accessToken,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          email_verified: user.email_verified,
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
        res.clearCookie('refresh_token', getRefreshCookieClearOptions());
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

      res.clearCookie('refresh_token', getRefreshCookieClearOptions());
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
      const normalizedEmail = String(email || '').trim().toLowerCase();

      // Find user
      const result = await pool.query(
        'SELECT id, full_name, email FROM users WHERE LOWER(email) = LOWER($1)',
        [normalizedEmail]
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

      if (emailService.isConfigured()) {
        const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;
        runInBackground(
          () => emailService.sendPasswordReset(user.email, user.full_name, resetUrl),
          'password-reset'
        );
      }

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

  // GET /api/auth/verify-email?token=...
  async verifyEmail(req, res, next) {
    try {
      const token = String(req.query.token || req.body?.token || '').trim();
      if (!token) {
        return res.status(400).json({ error: 'رمز التأكيد مطلوب' });
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const result = await pool.query(
        `SELECT evt.id, evt.user_id
         FROM email_verification_tokens evt
         WHERE evt.token_hash = $1
           AND evt.used_at IS NULL
           AND evt.expires_at > NOW()`,
        [tokenHash]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'رابط التأكيد غير صالح أو منتهي الصلاحية' });
      }

      const verification = result.rows[0];
      await pool.query(
        `UPDATE users
         SET email_verified = true, email_verified_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [verification.user_id]
      );
      await pool.query(
        `DELETE FROM email_verification_tokens
         WHERE id = $1 OR user_id = $2`,
        [verification.id, verification.user_id]
      );

      res.json({ message: 'تم تأكيد البريد الإلكتروني بنجاح' });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/verify-email/request
  async resendVerificationEmail(req, res, next) {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      if (!email) {
        return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
      }

      const result = await pool.query(
        `SELECT id, full_name, email, email_verified
         FROM users
         WHERE LOWER(email) = LOWER($1)`,
        [email]
      );

      if (result.rows.length === 0) {
        return res.json({ message: 'إذا كان البريد موجوداً، سيتم إرسال رسالة التأكيد' });
      }

      const user = result.rows[0];
      if (user.email_verified) {
        return res.json({ message: 'تم تأكيد هذا البريد بالفعل' });
      }

      if (!emailService.isConfigured()) {
        return res.status(503).json({ error: 'خدمة البريد غير مهيأة' });
      }

      runInBackground(() => sendVerificationEmail(user), 'email-resend-verification');
      res.json({ message: 'تم إرسال بريد التأكيد' });
    } catch (error) {
      next(error);
    }
  },
};
