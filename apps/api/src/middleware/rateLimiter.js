import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit auth endpoints to 5 requests per 15 minutes
  message: { error: 'تم تجاوز الحد المسموح من محاولات تسجيل الدخول' },
  skipSuccessfulRequests: true,
});
