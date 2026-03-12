import nodemailer from 'nodemailer';
import { EmailClient } from '@azure/communication-email';
import env from '../config/env.js';

let transporter = null;
let azureClient = null;

function toLogRecipients(to) {
  if (Array.isArray(to)) return to.join(', ');
  return String(to || '');
}

function extractEmailAddress(emailFrom) {
  const value = String(emailFrom || '').trim();
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] || value).trim();
}

function getEmailProvider() {
  if (env.email.provider === 'azure') return 'azure';
  if (env.email.provider === 'smtp') return 'smtp';

  if (env.email.azureConnectionString && env.email.azureSenderAddress) return 'azure';
  return 'smtp';
}

function getAzureClient() {
  if (azureClient) return azureClient;
  if (!env.email.azureConnectionString || !env.email.azureSenderAddress) return null;
  azureClient = new EmailClient(env.email.azureConnectionString);
  return azureClient;
}

function getTransporter() {
  if (transporter) return transporter;
  if (!env.email.host || !env.email.user || !env.email.pass) return null;

  transporter = nodemailer.createTransport({
    host: env.email.host,
    port: Number(env.email.port || 587),
    secure: Number(env.email.port) === 465,
    auth: {
      user: env.email.user,
      pass: env.email.pass,
    },
  });

  return transporter;
}

function buildEmailLayout({ title, bodyHtml, ctaText = null, ctaUrl = null }) {
  const cta = ctaText && ctaUrl
    ? `<p style="margin:24px 0">
        <a href="${ctaUrl}" style="background:#1d4ed8;color:#fff;padding:12px 16px;border-radius:8px;text-decoration:none;display:inline-block">${ctaText}</a>
      </p>`
    : '';

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <h2 style="margin:0 0 16px">${title}</h2>
      <div>${bodyHtml}</div>
      ${cta}
      <p style="margin-top:24px;color:#6b7280;font-size:13px">Lerniva Platform</p>
    </div>
  `;
}

export const emailService = {
  isConfigured() {
    const provider = getEmailProvider();
    if (provider === 'azure') {
      return Boolean(getAzureClient() && env.email.azureSenderAddress);
    }

    return Boolean(getTransporter());
  },

  async send({ to, subject, html, text }) {
    const provider = getEmailProvider();
    const recipients = toLogRecipients(to);
    const startedAt = Date.now();

    console.info(`[email] send attempt provider=${provider} to="${recipients}" subject="${subject}"`);

    if (provider === 'azure') {
      const client = getAzureClient();
      if (!client || !env.email.azureSenderAddress) {
        throw new Error('Azure Communication Services Email is not configured');
      }
      try {
        const poller = await client.beginSend({
          senderAddress: env.email.azureSenderAddress,
          content: {
            subject,
            plainText: text || '',
            html,
          },
          recipients: {
            to: Array.isArray(to)
              ? to.map((address) => ({ address }))
              : [{ address: to }],
          },
        });

        const result = await poller.pollUntilDone();
        const elapsedMs = Date.now() - startedAt;
        console.info(
          `[email] azure result status=${result.status} messageId=${result.id || 'n/a'} durationMs=${elapsedMs}`
        );
        if (result.status !== 'Succeeded') {
          throw new Error(`Azure email send failed with status: ${result.status}`);
        }
      } catch (error) {
        const elapsedMs = Date.now() - startedAt;
        console.error(`[email] azure send failed to="${recipients}" subject="${subject}"`, {
          message: error?.message,
          code: error?.code,
          statusCode: error?.statusCode,
          durationMs: elapsedMs,
        });
        throw error;
      }

      return;
    }

    const activeTransporter = getTransporter();
    if (!activeTransporter) {
      throw new Error('SMTP is not configured');
    }
    try {
      const smtpResult = await activeTransporter.sendMail({
        from: env.email.from || extractEmailAddress(env.email.azureSenderAddress),
        to,
        subject,
        html,
        text,
      });
      const elapsedMs = Date.now() - startedAt;
      console.info(
        `[email] smtp sent messageId=${smtpResult?.messageId || 'n/a'} to="${recipients}" durationMs=${elapsedMs}`
      );
    } catch (error) {
      const elapsedMs = Date.now() - startedAt;
      console.error(`[email] smtp send failed to="${recipients}" subject="${subject}"`, {
        message: error?.message,
        code: error?.code,
        durationMs: elapsedMs,
      });
      throw error;
    }
  },

  async sendEmailVerification(to, fullName, verifyUrl) {
    const safeName = fullName || 'there';
    const subject = 'Confirm your Lerniva account';
    const html = buildEmailLayout({
      title: 'Confirm your email address',
      bodyHtml: `<p>Hello ${safeName},</p><p>Please confirm your account to complete signup.</p>`,
      ctaText: 'Confirm account',
      ctaUrl: verifyUrl,
    });
    const text = `Hello ${safeName}, confirm your account: ${verifyUrl}`;

    await this.send({ to, subject, html, text });
  },

  async sendPasswordReset(to, fullName, resetUrl) {
    const safeName = fullName || 'there';
    const subject = 'Reset your Lerniva password';
    const html = buildEmailLayout({
      title: 'Password reset request',
      bodyHtml: `<p>Hello ${safeName},</p><p>Use the button below to reset your password. This link expires soon.</p>`,
      ctaText: 'Reset password',
      ctaUrl: resetUrl,
    });
    const text = `Hello ${safeName}, reset your password: ${resetUrl}`;

    await this.send({ to, subject, html, text });
  },

  async sendAnnouncement(to, subject, htmlBody, textBody) {
    const html = buildEmailLayout({
      title: subject,
      bodyHtml: htmlBody,
    });

    await this.send({
      to,
      subject,
      html,
      text: textBody || subject,
    });
  },
};
