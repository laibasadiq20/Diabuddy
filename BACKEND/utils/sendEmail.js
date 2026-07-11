const nodemailer = require('nodemailer');

/**
 * Utility to send email via Gmail SMTP
 * Falls back to console logging if credentials are not configured.
 * Times out after 12s so auth requests never hang on Railway.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const isConfigured =
    process.env.EMAIL_USER &&
    process.env.EMAIL_USER !== 'your_gmail_address@gmail.com' &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_PASS !== 'your_gmail_app_password';

  if (!isConfigured) {
    console.log('\n==================================================');
    console.log('📬  [MOCK EMAIL SERVICE] Email Sent (SMTP Not Configured)');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:    ${text || html}`);
    console.log('==================================================\n');
    return { mock: true, message: 'Mock email printed to console' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 12000,
  });

  const mailOptions = {
    from: `"DiaBuddy Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  const sendPromise = transporter.sendMail(mailOptions);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Email send timed out')), 12000);
  });

  const info = await Promise.race([sendPromise, timeoutPromise]);
  console.log(`📨 Real email sent: %s`, info.messageId);
  return info;
};

module.exports = sendEmail;
