import rateLimit from 'express-rate-limit';

function isLocalTraffic(req) {
  const origin = req.headers.origin || '';
  const host = req.headers.host || '';
  const xForwardedFor = req.headers['x-forwarded-for'] || '';
  const ip = req.ip || '';
  const localPattern = /(localhost|127\.0\.0\.1|::1)/i;
  return localPattern.test(origin) ||
    localPattern.test(host) ||
    localPattern.test(String(xForwardedFor)) ||
    localPattern.test(ip);
}

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX || 1000),
  message: { error: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isLocalTraffic(req),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  message: { error: 'تم تجاوز الحد المسموح من محاولات تسجيل الدخول' },
  skipSuccessfulRequests: true,
  skip: (req) => isLocalTraffic(req),
});

export const authActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_ACTION_RATE_LIMIT_MAX || 60),
  message: { error: 'تم تجاوز الحد المسموح من طلبات المصادقة. يرجى المحاولة لاحقاً' },
  skipSuccessfulRequests: true,
  skip: (req) => isLocalTraffic(req),
});
