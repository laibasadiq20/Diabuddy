const dns = require('dns');
const nodemailer = require('nodemailer');

const PLACEHOLDER_USER = 'your_gmail_address@gmail.com';
const PLACEHOLDER_PASS = 'your_gmail_app_password';

// Prefer IPv4 — Railway often cannot reach Gmail over IPv6 (ENETUNREACH)
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const getEmailConfig = () => {
  const user = (process.env.EMAIL_USER || '').trim();
  // Gmail app passwords are often copied with spaces — strip them
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();
  const configured =
    Boolean(user) &&
    Boolean(pass) &&
    user !== PLACEHOLDER_USER &&
    pass !== PLACEHOLDER_PASS;

  return { user, pass, configured };
};

/**
 * Returns whether real SMTP credentials are loaded (no secrets).
 */
const isEmailConfigured = () => getEmailConfig().configured;

/** Force A-record (IPv4) lookups so nodemailer never dials Gmail AAAA. */
const ipv4Lookup = (hostname, _options, callback) => {
  dns.lookup(hostname, { family: 4 }, callback);
};

const createTransporter = (user, pass, { port, secure }) =>
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port,
    secure,
    auth: { user, pass },
    lookup: ipv4Lookup,
    family: 4,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: { servername: 'smtp.gmail.com' },
  });

/**
 * Send email via Gmail SMTP over IPv4.
 * Falls back to console logging only when credentials are missing locally.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const { user, pass, configured } = getEmailConfig();
  const isProd = Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_ENVIRONMENT_NAME ||
      process.env.NODE_ENV === 'production'
  );

  if (!configured) {
    const msg =
      'EMAIL_USER / EMAIL_PASS are not set. Add Gmail + App Password in Railway Variables.';
    console.error(`\n❌ [EMAIL NOT CONFIGURED] ${msg}`);
    console.error(`Would have sent to: ${to} | subject: ${subject}`);
    console.error(`Body: ${text || html}\n`);

    if (isProd) {
      throw new Error(msg);
    }

    return { mock: true, message: 'Mock email printed to console' };
  }

  const mailOptions = {
    from: `"DiaBuddy Support" <${user}>`,
    to,
    subject,
    text,
    html,
  };

  // Try SSL 465 first, then STARTTLS 587 (both forced to IPv4)
  const attempts = [
    { port: 465, secure: true, label: '465/SSL' },
    { port: 587, secure: false, label: '587/STARTTLS' },
  ];

  let lastError;

  for (const attempt of attempts) {
    const transporter = createTransporter(user, pass, attempt);
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`📨 Email sent via ${attempt.label} to ${to}: ${info.messageId}`);
      return { mock: false, messageId: info.messageId, via: attempt.label };
    } catch (err) {
      lastError = err;
      console.error(`SMTP ${attempt.label} failed:`, err.message);
    } finally {
      transporter.close();
    }
  }

  const detail = lastError?.message || 'Unknown SMTP error';
  throw new Error(
    `Gmail SMTP failed (${detail}). If this is ENETUNREACH/IPv6, redeploy with the IPv4 mailer fix. Also verify EMAIL_USER and EMAIL_PASS (App Password) on Railway.`
  );
};

module.exports = sendEmail;
module.exports.isEmailConfigured = isEmailConfigured;
