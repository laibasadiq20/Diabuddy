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

const app = express();

// Debug information
console.log('__dirname:', __dirname);
console.log('MONGO_URI =', process.env.MONGO_URI ? 'Loaded ✅' : 'Missing ❌');
console.log('JWT_SECRET =', process.env.JWT_SECRET ? 'Loaded ✅' : 'Missing ❌');

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

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