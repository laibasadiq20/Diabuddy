/**
 * DiaBuddy email helper
 *
 * Railway BLOCKS outbound SMTP (465/587), so plain Nodemailer → Gmail
 * times out on Railway even with a valid App Password.
 *
 * Supported providers (first match wins):
 * 1. GMAIL_SCRIPT_URL  — Google Apps Script webhook (uses your Gmail, no domain)
 * 2. BREVO_API_KEY      — Brevo HTTPS API (verify sender email only, no domain)
 * 3. RESEND_API_KEY     — Resend HTTPS API (needs verified domain for other inboxes)
 * 4. EMAIL_USER/PASS    — Nodemailer Gmail SMTP (local/dev only)
 */

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

const getScriptUrl = () => (process.env.GMAIL_SCRIPT_URL || '').trim();
const getScriptSecret = () => (process.env.GMAIL_SCRIPT_SECRET || '').trim();
const getBrevoKey = () => (process.env.BREVO_API_KEY || '').trim();
const getResendKey = () => (process.env.RESEND_API_KEY || '').trim();

const isEmailConfigured = () => {
  if (getScriptUrl()) return true;
  if (getBrevoKey()) return true;
  if (getResendKey()) return true;
  if (isRailway()) return false; // SMTP blocked on Railway
  return getSmtpConfig().configured;
};

const resolveSmtpIpv4 = async () => {
  const { address, family } = await dns.lookup(SMTP_HOST, { family: 4 });
  if (!address || family !== 4) {
    throw new Error(`No IPv4 address found for ${SMTP_HOST}`);
  }
  return address;
};

/** Send via Google Apps Script (HTTPS → GmailApp). No custom domain needed. */
const sendViaGmailScript = async ({ to, subject, html, text }) => {
  const url = getScriptUrl();
  const secret = getScriptSecret();

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret,
      to,
      subject,
      text: text || '',
      html: html || '',
    }),
    redirect: 'follow',
  });

  const bodyText = await response.text();
  let data = {};
  try {
    data = JSON.parse(bodyText);
  } catch {
    data = { raw: bodyText };
  }

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || data.raw || `Gmail script HTTP ${response.status}`);
  }

  console.log(`📨 Email sent via Gmail Apps Script to ${to}`);
  return { mock: false, provider: 'gmail-apps-script' };
};

const sendViaBrevo = async ({ to, subject, html, text }) => {
  const apiKey = getBrevoKey();
  const senderEmail =
    (process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || '').trim();
  const senderName = (process.env.EMAIL_FROM_NAME || 'DiaBuddy').trim();

  if (!senderEmail) {
    throw new Error('Set EMAIL_USER to your Brevo-verified sender email.');
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

  console.log(`📨 Email sent via Brevo to ${to}`);
  return { mock: false, provider: 'brevo', messageId: data.messageId };
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

/** Nodemailer → Gmail SMTP. Works locally; blocked on Railway. */
const sendViaNodemailerGmail = async ({ to, subject, html, text }) => {
  const { user, pass, configured } = getSmtpConfig();
  if (!configured) {
    throw new Error('EMAIL_USER / EMAIL_PASS are not set.');
  }

  const ipv4 = await resolveSmtpIpv4();
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
      console.log(`📨 Email sent via Nodemailer ${attempt.label} to ${to}: ${info.messageId}`);
      return { mock: false, provider: 'nodemailer-gmail', messageId: info.messageId };
    } catch (err) {
      lastError = err;
      console.error(`Nodemailer ${attempt.label} failed:`, err.message);
    } finally {
      transporter.close();
    }
  }

  throw new Error(lastError?.message || 'Nodemailer Gmail SMTP failed');
};

const sendEmail = async ({ to, subject, html, text }) => {
  const payload = { to, subject, html, text };

  // 1) Apps Script — best Railway option without a domain
  if (getScriptUrl()) {
    return sendViaGmailScript(payload);
  }

  // 2) Brevo — verify one sender email, no domain DNS
  if (getBrevoKey()) {
    return sendViaBrevo(payload);
  }

  // 3) Resend — needs domain to mail anyone except your own inbox
  if (getResendKey()) {
    return sendViaResend(payload);
  }

  // 4) Nodemailer SMTP — local only
  if (isRailway()) {
    throw new Error(
      'Railway blocks Nodemailer/Gmail SMTP (ports 465/587). Set GMAIL_SCRIPT_URL (Apps Script) or BREVO_API_KEY — no domain required. See BACKEND/EMAIL_SETUP.md'
    );
  }

  const { configured } = getSmtpConfig();
  if (!configured) {
    console.error('[EMAIL] Not configured — printing mock email');
    console.error(`To: ${to}\nSubject: ${subject}\n${text || html}`);
    return { mock: true };
  }

  return sendViaNodemailerGmail(payload);
};

module.exports = sendEmail;
module.exports.isEmailConfigured = isEmailConfigured;
