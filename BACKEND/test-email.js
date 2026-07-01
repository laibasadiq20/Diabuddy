require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

const to = process.argv[2];

if (!to) {
  console.log('Usage: node test-email.js your_email@example.com');
  process.exit(1);
}

(async () => {
  try {
    const result = await sendEmail({
      to,
      subject: 'DiaBuddy email test',
      text: 'This is a test email from DiaBuddy. If you received it, your Gmail SMTP setup is working.',
      html: '<p>This is a test email from DiaBuddy.</p><p>If you received it, your Gmail SMTP setup is working.</p>',
    });

    console.log('Email result:', result);
  } catch (error) {
    console.error('Email test failed:', error.message);
    process.exit(1);
  }
})();
