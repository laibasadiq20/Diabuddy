const nodemailer = require('nodemailer');

/**
 * Utility to send email via Gmail SMTP.
 * Falls back to console logging when the app password is not configured.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  const isConfigured =
    emailUser &&
    emailUser !== 'your_gmail_address@gmail.com' &&
    emailPass &&
    emailPass !== 'your_gmail_app_password';

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
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.verify();

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"DiaBuddy Support" <${emailUser}>`,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📨 Real email sent: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
