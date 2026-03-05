import 'dotenv/config';

export default {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  },

  bunny: {
    libraryId: process.env.BUNNY_LIBRARY_ID,
    apiKey: process.env.BUNNY_API_KEY,
    cdnHostname: process.env.BUNNY_CDN_HOSTNAME,
    webhookSecret: process.env.BUNNY_WEBHOOK_SECRET,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'Lerniva <noreply@lerniva.com>',
  },
};
