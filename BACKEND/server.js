require('dotenv').config();

const dns = require('dns');

// Prefer IPv4 (Railway often cannot reach external SMTP over IPv6)
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Force Node to use public DNS servers for SRV lookups
dns.setServers([
  '8.8.8.8',
  '8.8.4.4',
  '1.1.1.1',
  '1.0.0.1'
]);

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const seedTopics = require('./seedTopics');
const seedForumPosts = require('./seedForumPosts');

const app = express();

// Debug information
console.log('__dirname:', __dirname);
console.log('MONGO_URI =', process.env.MONGO_URI ? 'Loaded ✅' : 'Missing ❌');
console.log('JWT_SECRET =', process.env.JWT_SECRET ? 'Loaded ✅' : 'Missing ❌');
console.log(
  'EMAIL =',
  require('./utils/sendEmail').isEmailConfigured()
    ? `Configured ✅ (${
        process.env.GMAIL_SCRIPT_URL
          ? 'Gmail Apps Script'
          : process.env.BREVO_API_KEY
            ? 'Brevo'
            : process.env.RESEND_API_KEY
              ? 'Resend'
              : 'Nodemailer SMTP'
      })`
    : 'Missing ❌ (on Railway set GMAIL_SCRIPT_URL — see BACKEND/EMAIL_SETUP.md)'
);

// Connect to MongoDB then seed defaults
connectDB()
  .then(async () => {
    await seedTopics();
    await seedForumPosts();
  })
  .catch(err => console.error('DB/Seed error:', err));


// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://diabuddy-backend.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow same-origin / non-browser tools (no Origin header)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Body-parser SyntaxError otherwise returns an HTML "<!DOCTYPE…" page
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ status: 'error', message: 'Invalid JSON body' });
  }
  return next(err);
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const topicRoutes = require('./routes/topicRoutes');
app.use('/api/topics', topicRoutes);

const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

const commentRoutes = require('./routes/commentRoutes');
app.use('/api/comments', commentRoutes);

const reactionRoutes = require('./routes/reactionRoutes');
app.use('/api/reactions', reactionRoutes);

const pollRoutes = require('./routes/pollRoutes');
app.use('/api/polls', pollRoutes);

const conversationRoutes = require('./routes/conversationRoutes');
app.use('/api/conversations', conversationRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

const healthLogRoutes = require('./routes/healthLogRoutes');
app.use('/api/health-logs', healthLogRoutes);

const googleHealthRoutes = require('./routes/googleHealthRoutes');
app.use('/api/google-health', googleHealthRoutes);
const reminderRoutes = require('./routes/reminderRoutes');
app.use('/api/reminders', reminderRoutes);

const { initReminderScheduler } = require('./utils/reminderScheduler');
initReminderScheduler();

// Test / health routes
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'DiaBuddy backend is running',
    emailConfigured: require('./utils/sendEmail').isEmailConfigured(),
  });
});

// JSON 404 for unknown API routes (avoid Express HTML error pages breaking the SPA)
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});