const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { isEmailConfigured } = sendEmail;

/**
 * Generate a JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token valid for 30 days
  });
};

/**
 * Generate a random 6-digit OTP code
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

const setAuthCookie = (res, token) => {
  // Same-origin via Vercel /api proxy — use lax (none often fails to stick)
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
};

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

/**
 * @desc    Register a new user (with email OTP verification)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      gender,
      diabetesType,
      glucoseUnit,
      targetRanges,
      role,
    } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password are required fields',
      });
    }

    // 2. Fast format check only (avoid MX lookups that hang on Railway)
    if (!isValidEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please enter a valid email address',
      });
    }

    if (!isEmailConfigured()) {
      return res.status(503).json({
        status: 'error',
        message:
          'Email is not configured for Railway. Nodemailer/Gmail SMTP is blocked there — set GMAIL_SCRIPT_URL (Apps Script, no domain) or BREVO_API_KEY. See BACKEND/EMAIL_SETUP.md',
      });
    }

    // 3. Check if user already exists in database
    const userExists = await User.findOne({ email });
    if (userExists) {
      // If user exists but is unverified, resend code and notify
      if (!userExists.isVerified) {
        const newCode = generateOTP();
        userExists.verificationCode = newCode;
        userExists.verificationCodeExpires = new Date(Date.now() + OTP_TTL_MS); // 5 mins
        await userExists.save();

        await sendEmail({
          to: email,
          subject: 'DiaBuddy - Verify Your Account',
          text: `Welcome back to DiaBuddy, ${name}! Your 6-digit verification code is: ${newCode}. It is valid for 15 minutes.`,
          html: `<h3>Welcome back to DiaBuddy, ${name}!</h3>
                 <p>Your 6-digit verification code is: <strong>${newCode}</strong></p>
                 <p>It is valid for 15 minutes.</p>`,
        });

        return res.status(200).json({
          status: 'success',
          message: 'This email is registered but unverified. A new verification code has been sent to your inbox.',
          data: { email: userExists.email, isVerified: false, emailSent: true },
        });
      }

      return res.status(400).json({
        status: 'error',
        message: 'A user with this email address already exists and is verified',
      });
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Generate a unique username from email local-part
    const emailLocal = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    let baseUsername = (emailLocal || name.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user').slice(0, 20);
    if (baseUsername.length < 3) baseUsername = `user${baseUsername}`.padEnd(3, '0');

    let username = baseUsername;
    let suffix = 0;
    while (await User.findOne({ username })) {
      suffix += 1;
      username = `${baseUsername.slice(0, 24)}${suffix}`;
    }

    // 6. Generate Verification OTP code
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_TTL_MS); // 5 minutes expiry

    // 7. Create user (unverified by default)
    const newUser = await User.create({
      name,
      username,
      email,
      passwordHash,
      age,
      gender,
      diabetesType,
      glucoseUnit: glucoseUnit || 'mg/dL',
      targetRanges: targetRanges || {
        fastingMin: 70,
        fastingMax: 100,
        postMealMin: 70,
        postMealMax: 140,
      },
      role: role || 'patient',
      isVerified: false,
      verificationCode: otpCode,
      verificationCodeExpires: otpExpiry,
    });

    // 8. Send Verification Email
    await sendEmail({
      to: email,
      subject: 'DiaBuddy - Verify Your Account',
      text: `Welcome to DiaBuddy, ${name}! Your 6-digit verification code is: ${otpCode}. It is valid for 15 minutes.`,
      html: `<h3>Welcome to DiaBuddy, ${name}!</h3>
             <p>Thank you for signing up. Please enter the following 6-digit verification code to complete your registration:</p>
             <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otpCode}</p>
             <p>This code is valid for 15 minutes.</p>`,
    });

    // 9. Return response
    return res.status(201).json({
      status: 'success',
      message: 'Registration successful. A 6-digit verification code has been sent to your email.',
      data: {
        email: newUser.email,
        isVerified: false,
        emailSent: true,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    const isMailError = /smtp|email|gmail|enetunreach/i.test(err.message || '');
    return res.status(500).json({
      status: 'error',
      message: isMailError
        ? err.message
        : 'Server error during registration',
      error: err.message,
    });
  }
};

/**
 * @desc    Verify email using OTP code
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and verification code are required',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already verified',
      });
    }

    // Check if code matches
    if (user.verificationCode !== code) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification code',
      });
    }

    // Check if code is expired
    if (new Date() > user.verificationCodeExpires) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Mark as verified and clear OTP fields
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.json({
      status: 'success',
      message: 'Email verified successfully. You can now log in.',
      data: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during verification',
    });
  }
};

/**
 * @desc    Resend verification OTP code
 * @route   POST /api/auth/resend-code
 * @access  Public
 */
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already verified',
      });
    }

    // Generate new OTP
    const newCode = generateOTP();
    user.verificationCode = newCode;
    user.verificationCodeExpires = new Date(Date.now() + OTP_TTL_MS); // 5 mins
    await user.save();

    // Send code
    await sendEmail({
      to: email,
      subject: 'DiaBuddy - Verification Code Resend',
      text: `Your new 6-digit verification code is: ${newCode}. It is valid for 15 minutes.`,
      html: `<p>Your new 6-digit verification code is: <strong>${newCode}</strong></p>
             <p>It is valid for 15 minutes.</p>`,
    });

    return res.json({
      status: 'success',
      message: 'A new 6-digit verification code has been sent to your email.',
    });
  } catch (err) {
    console.error('Resend code error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error resending verification code',
    });
  }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required',
      });
    }

    // 1. Explicitly check if email exists in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email address: User does not exist',
      });
    }

    // 2. Check if the user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Your email address is not verified. Please verify using the OTP code sent to your email address.',
        data: { isVerified: false },
      });
    }

    // 3. Explicitly verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid password: Authentication failed',
      });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          glucoseUnit: user.glucoseUnit,
          targetRanges: user.targetRanges,
          bio: user.bio,
          location: user.location,
          diabetesType: user.diabetesType,
          profileImageUrl: user.profileImageUrl,
          postsCount: user.postsCount,
          reputationScore: user.reputationScore,
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during login',
      error: err.message,
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const u = req.user.toObject ? req.user.toObject() : req.user;
    return res.json({
      status: 'success',
      data: {
        ...u,
        id: u._id,
        _id: u._id,
      },
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error fetching user profile',
    });
  }
};

/**
 * @desc    Logout — clear auth cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  clearAuthCookie(res);
  return res.json({
    status: 'success',
    message: 'Logged out',
  });
};

/**
 * @desc    Search/List other users
 * @route   GET /api/auth/users
 * @access  Private
 */
const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { _id: { $ne: req.user.id }, isVerified: true, isActive: true }; // Exclude self, must be verified/active

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('name username email profileImageUrl diabetesType diagnosisYear isVerifiedProfessional')
      .limit(20);

    return res.json({
      status: 'success',
      data: users,
    });
  } catch (err) {
    console.error('User search error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error searching users',
    });
  }
};

/**
 * @desc    Public community profile (safe fields only)
 * @route   GET /api/auth/users/:id
 * @access  Private
 */
const getPublicProfile = async (req, res) => {
  try {
    const profile = await User.findOne({
      _id: req.params.id,
      isActive: true,
      isVerified: true,
    }).select(
      'name username bio location profileImageUrl diabetesType diagnosisYear isVerifiedProfessional postsCount commentsCount createdAt isOnline lastSeen'
    );

    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const u = profile.toObject();
    return res.json({
      status: 'success',
      data: { ...u, id: u._id, _id: u._id },
    });
  } catch (err) {
    console.error('Public profile error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error fetching profile',
    });
  }
};

/**
 * @desc    Send password reset OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required',
      });
    }

    if (!isEmailConfigured()) {
      return res.status(503).json({
        status: 'error',
        message:
          'Email is not configured for Railway. Nodemailer/Gmail SMTP is blocked there — set GMAIL_SCRIPT_URL (Apps Script, no domain) or BREVO_API_KEY. See BACKEND/EMAIL_SETUP.md',
      });
    }

    const user = await User.findOne({ email });

    // Always return success-looking response to avoid email enumeration
    if (!user) {
      return res.json({
        status: 'success',
        message: 'If an account exists for that email, a reset code has been sent.',
      });
    }

    const resetCode = generateOTP();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    await sendEmail({
      to: email,
      subject: 'DiaBuddy - Password Reset Code',
      text: `Your password reset code is: ${resetCode}. It is valid for 15 minutes.`,
      html: `<h3>Password reset</h3>
             <p>Your 6-digit reset code is: <strong>${resetCode}</strong></p>
             <p>It is valid for 15 minutes. If you did not request this, you can ignore this email.</p>`,
    });

    return res.json({
      status: 'success',
      message: 'If an account exists for that email, a reset code has been sent.',
      data: { emailSent: true },
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Server error sending reset code',
    });
  }
};

/**
 * @desc    Reset password using OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const { code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, reset code, and new password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters',
      });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset code',
      });
    }

    if (user.resetPasswordCode !== String(code).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset code',
      });
    }

    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      return res.status(400).json({
        status: 'error',
        message: 'Reset code has expired. Please request a new one.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({
      status: 'success',
      message: 'Password reset successful. You can now sign in.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error resetting password',
      error: err.message,
    });
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'location', 'diabetesType', 'gender', 'age', 'glucoseUnit'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.name && String(updates.name).trim().length < 2) {
      return res.status(400).json({ status: 'error', message: 'Name must be at least 2 characters' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const u = user.toObject();
    return res.json({
      status: 'success',
      message: 'Profile updated',
      data: { ...u, id: u._id, _id: u._id },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Server error updating profile',
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  logout,
  getMe,
  updateProfile,
  searchUsers,
  getPublicProfile,
  forgotPassword,
  resetPassword,
};

