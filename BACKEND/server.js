require('dotenv').config();

const dns = require('dns');

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

const app = express();

// Debug information
console.log('__dirname:', __dirname);
console.log('MONGO_URI =', process.env.MONGO_URI ? 'Loaded ✅' : 'Missing ❌');
console.log('JWT_SECRET =', process.env.JWT_SECRET ? 'Loaded ✅' : 'Missing ❌');

// Connect to MongoDB then seed defaults
connectDB().then(() => seedTopics()).catch(err => console.error('DB/Seed error:', err));


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

app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

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

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'DiaBuddy backend is running',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});