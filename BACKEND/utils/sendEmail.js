const nodemailer = require('nodemailer');

/**
 * Utility to send email via Gmail SMTP
 * Falls back to console logging if credentials are not configured.
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

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Needs to be a Gmail App Password
    },
  });

  // Mail options
  const mailOptions = {
    from: `"DiaBuddy Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  // Send mail
  const info = await transporter.sendMail(mailOptions);
  console.log(`📨 Real email sent: %s`, info.messageId);
  return info;
};

module.exports = sendEmail;
