const dns = require('dns').promises;
const nodemailer = require('nodemailer');

const PLACEHOLDER_USER = 'your_gmail_address@gmail.com';
const PLACEHOLDER_PASS = 'your_gmail_app_password';
const SMTP_HOST = 'smtp.gmail.com';

const isRailway = () =>
  Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_ENVIRONMENT_NAME ||
      process.env.RAILWAY_PROJECT_ID
  );

const getSmtpConfig = () => {
  const user = (process.env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();
  const configured =
    Boolean(user) &&
    Boolean(pass) &&
    user !== PLACEHOLDER_USER &&
    pass !== PLACEHOLDER_PASS;
  return { user, pass, configured };
};

const getResendKey = () => (process.env.RESEND_API_KEY || '').trim();
const getBrevoKey = () => (process.env.BREVO_API_KEY || '').trim();

/**
 * True when any working email provider is configured.
 * On Railway, SMTP is blocked — only HTTPS APIs (Resend/Brevo) count.
 */
const isEmailConfigured = () => {
  if (getResendKey() || getBrevoKey()) return true;
  // Gmail SMTP works locally, but Railway blocks outbound 465/587
  if (isRailway()) return false;
  return getSmtpConfig().configured;
};

const resolveSmtpIpv4 = async () => {
  const { address, family } = await dns.lookup(SMTP_HOST, { family: 4 });
  if (!address || family !== 4) {
    throw new Error(`No IPv4 address found for ${SMTP_HOST}`);
  }
  return address;
};

const sendViaResend = async ({ to, subject, html, text }) => {
  const apiKey = getResendKey();
  const from =
    (process.env.EMAIL_FROM || '').trim() ||
    'DiaBuddy <onboarding@resend.dev>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Resend HTTP ${response.status}`);
  }

  console.log(`📨 Email sent via Resend to ${to}: ${data.id}`);
  return { mock: false, provider: 'resend', messageId: data.id };
};

const sendViaBrevo = async ({ to, subject, html, text }) => {
  const apiKey = getBrevoKey();
  const senderEmail =
    (process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || '').trim();
  const senderName = (process.env.EMAIL_FROM_NAME || 'DiaBuddy').trim();

  if (!senderEmail) {
    throw new Error(
      'Set EMAIL_USER (or EMAIL_FROM_ADDRESS) to your verified Brevo sender email.'
    );
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Brevo HTTP ${response.status}`);
  }

  console.log(`📨 Email sent via Brevo to ${to}: ${data.messageId || 'ok'}`);
  return { mock: false, provider: 'brevo', messageId: data.messageId };
};

const sendViaGmailSmtp = async ({ to, subject, html, text }) => {
  const { user, pass, configured } = getSmtpConfig();
  if (!configured) {
    throw new Error('Gmail SMTP credentials are not configured.');
  }

  const ipv4 = await resolveSmtpIpv4();
  console.log(`SMTP resolving ${SMTP_HOST} -> ${ipv4} (IPv4)`);

  const mailOptions = {
    from: `"DiaBuddy Support" <${user}>`,
    to,
    subject,
    text,
    html,
  };

  const attempts = [
    { port: 465, secure: true, label: '465/SSL' },
    { port: 587, secure: false, label: '587/STARTTLS' },
  ];

  let lastError;
  for (const attempt of attempts) {
    const transporter = nodemailer.createTransport({
      host: ipv4,
      port: attempt.port,
      secure: attempt.secure,
      auth: { user, pass },
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 15000,
      tls: {
        servername: SMTP_HOST,
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      },
    });

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`📨 Email sent via Gmail ${attempt.label} to ${to}: ${info.messageId}`);
      return { mock: false, provider: 'gmail-smtp', messageId: info.messageId };
    } catch (err) {
      lastError = err;
      console.error(`SMTP ${attempt.label} via ${ipv4} failed:`, err.message);
    } finally {
      transporter.close();
    }
  }

  throw new Error(lastError?.message || 'Gmail SMTP failed');
};

/**
 * Send email.
 * Prefer HTTPS providers on Railway (SMTP ports are blocked there).
 * Order: Resend → Brevo → Gmail SMTP (local only).
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const payload = { to, subject, html, text };

  if (getResendKey()) {
    return sendViaResend(payload);
  }

  if (getBrevoKey()) {
    return sendViaBrevo(payload);
  }

  if (isRailway()) {
    const msg =
      'Railway blocks Gmail SMTP (ports 465/587 time out). Set RESEND_API_KEY or BREVO_API_KEY in Railway Variables.';
    console.error(`\n❌ [EMAIL] ${msg}`);
    console.error(`Would have sent to: ${to} | ${subject}\n${text || html}\n`);
    throw new Error(msg);
  }

  const { configured } = getSmtpConfig();
  if (!configured) {
    console.error('\n❌ [EMAIL NOT CONFIGURED] Set RESEND_API_KEY, BREVO_API_KEY, or EMAIL_USER/EMAIL_PASS');
    console.error(`Would have sent to: ${to} | ${subject}\n${text || html}\n`);
    return { mock: true, message: 'Mock email printed to console' };
  }

  return sendViaGmailSmtp(payload);
};

module.exports = sendEmail;
module.exports.isEmailConfigured = isEmailConfigured;
