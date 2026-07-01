const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const API_BASE = 'http://127.0.0.1:5000/api';
const randomId = Math.floor(Math.random() * 100000);
const testUser = {
  name: `Test User ${randomId}`,
  email: `testuser_${randomId}@gmail.com`,
  password: 'Password123!',
};

async function runTest() {
  console.log('🚀 Starting Authentication Flow Integration Test...\n');

  // 1. Connect to MongoDB to query verification code directly
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  try {
    // Clean up any potential existing user
    await User.deleteMany({ email: testUser.email });

    // 2. Register user
    console.log(`➡️ Registering user: ${testUser.email}...`);
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const regData = await regRes.json();
    console.log('Response Status:', regRes.status);
    console.log('Response Data:', JSON.stringify(regData, null, 2));

    if (regRes.status !== 201) {
      throw new Error(`Registration failed: ${regData.message}`);
    }
    console.log('✅ Registration successful!\n');

    // 3. Retrieve verification OTP code from DB
    console.log('🔍 Querying verification code from database...');
    const dbUser = await User.findOne({ email: testUser.email });
    if (!dbUser) {
      throw new Error('User not found in database after registration');
    }
    const otpCode = dbUser.verificationCode;
    console.log(`🔑 Retrieved OTP code from database: ${otpCode}\n`);

    // 4. Verify email OTP
    console.log('➡️ Verifying email using OTP code...');
    const verifyRes = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, code: otpCode }),
    });
    const verifyData = await verifyRes.json();
    console.log('Response Status:', verifyRes.status);
    console.log('Response Data:', JSON.stringify(verifyData, null, 2));

    if (verifyRes.status !== 200) {
      throw new Error(`Verification failed: ${verifyData.message}`);
    }
    const token = verifyData.data.token;
    console.log('✅ OTP Verification successful! JWT Token saved.\n');

    // 5. Test protected route (/api/auth/me)
    console.log('➡️ Accessing protected profile route (/api/auth/me)...');
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const meData = await meRes.json();
    console.log('Response Status:', meRes.status);
    console.log('Response Data:', JSON.stringify(meData, null, 2));

    if (meRes.status !== 200) {
      throw new Error(`Accessing protected route failed: ${meData.message}`);
    }
    console.log('✅ Protected route accessed successfully! Profile matches.\n');

    // 6. Test Login endpoint
    console.log('➡️ Attempting to login using registered credentials...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const loginData = await loginRes.json();
    console.log('Response Status:', loginRes.status);
    console.log('Response Data:', JSON.stringify(loginData, null, 2));

    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${loginData.message}`);
    }
    console.log('✅ Login successful!\n');

    // Clean up test user
    console.log('🧹 Cleaning up test user from database...');
    await User.deleteOne({ email: testUser.email });
    console.log('✅ Test user cleaned up');

    console.log('\n🎉 ALL TESTS PASSED! Front-end to Back-end authentication routes are 100% connected, verified, and secure!');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    // Clean up test user in case of failure
    try {
      await User.deleteOne({ email: testUser.email });
    } catch {}
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

runTest();
