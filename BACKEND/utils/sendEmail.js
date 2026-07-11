const nodemailer = require('nodemailer');

const PLACEHOLDER_USER = 'your_gmail_address@gmail.com';
const PLACEHOLDER_PASS = 'your_gmail_app_password';

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

/**
 * Send email via Gmail SMTP.
 * Falls back to console logging only when credentials are missing locally.
 * In production/Railway, missing credentials throw so deploys fail loudly.
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

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  try {
    await transporter.verify();
  } catch (verifyErr) {
    console.error('SMTP verify failed:', verifyErr.message);
    throw new Error(
      `Gmail SMTP login failed: ${verifyErr.message}. Check EMAIL_USER and EMAIL_PASS (App Password) on Railway.`
    );
  }

  const info = await transporter.sendMail({
    from: `"DiaBuddy Support" <${user}>`,
    to,
    subject,
    text,
    html,
  });

  console.log(`📨 Real email sent to ${to}: ${info.messageId}`);
  return { mock: false, messageId: info.messageId };
};

module.exports = sendEmail;
module.exports.isEmailConfigured = isEmailConfigured;
