const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validateEmail = require('deep-email-validator').validate;
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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

const validateEmailAddress = async (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return {
      valid: false,
      reason: 'Invalid email',
      email: normalizedEmail,
    };
  }

  const validationResult = await validateEmail({
    email: normalizedEmail,
    validateRegex: true,
    validateMx: true,
    validateTypo: true,
    validateDisposable: true,
    validateSMTP: false,
  });

  if (!validationResult.valid) {
    return {
      valid: false,
      reason: 'Invalid email',
      email: normalizedEmail,
    };
  }

  return {
    valid: true,
    reason: null,
    email: normalizedEmail,
  };
};

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

    // 2. Validate the email address properly
    const emailValidation = await validateEmailAddress(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        status: 'error',
        message: emailValidation.reason,
      });
    }

    const normalizedEmail = emailValidation.email;

    // 3. Check if user already exists in database
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      // If user exists but is unverified, resend code and notify
      if (!userExists.isVerified) {
        const newCode = generateOTP();
        userExists.verificationCode = newCode;
        userExists.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await userExists.save();

        await sendEmail({
          to: normalizedEmail,
          subject: 'DiaBuddy - Verify Your Account',
          text: `Welcome back to DiaBuddy, ${name}! Your 6-digit verification code is: ${newCode}. It is valid for 15 minutes.`,
          html: `<h3>Welcome back to DiaBuddy, ${name}!</h3>
                 <p>Your 6-digit verification code is: <strong>${newCode}</strong></p>
                 <p>It is valid for 15 minutes.</p>`,
        });

        return res.status(200).json({
          status: 'success',
          message: 'This email is registered but unverified. A new verification code has been sent to your inbox.',
          data: { email: userExists.email, isVerified: false },
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

    // 5. Generate Verification OTP code
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // 6. Create user (unverified by default)
    const newUser = await User.create({
      name,
      email: normalizedEmail,
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

    // 7. Send Verification Email
    await sendEmail({
      to: normalizedEmail,
      subject: 'DiaBuddy - Verify Your Account',
      text: `Welcome to DiaBuddy, ${name}! Your 6-digit verification code is: ${otpCode}. It is valid for 15 minutes.`,
      html: `<h3>Welcome to DiaBuddy, ${name}!</h3>
             <p>Thank you for signing up. Please enter the following 6-digit verification code to complete your registration:</p>
             <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otpCode}</p>
             <p>This code is valid for 15 minutes.</p>`,
    });

    // 8. Return response
    return res.status(201).json({
      status: 'success',
      message: 'Registration successful. A 6-digit verification code has been sent to your email.',
      data: {
        email: newUser.email,
        isVerified: false,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during registration',
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

    const emailValidation = await validateEmailAddress(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        status: 'error',
        message: emailValidation.reason,
      });
    }

    const normalizedEmail = emailValidation.email;
    const user = await User.findOne({ email: normalizedEmail });
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

    return res.json({
      status: 'success',
      message: 'Email verified successfully. You can now log in.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id), // Return JWT directly after verification
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

    const emailValidation = await validateEmailAddress(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        status: 'error',
        message: emailValidation.reason,
      });
    }

    const normalizedEmail = emailValidation.email;
    const user = await User.findOne({ email: normalizedEmail });
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
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    // Send code
    await sendEmail({
      to: normalizedEmail,
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

    const emailValidation = await validateEmailAddress(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        status: 'error',
        message: emailValidation.reason,
      });
    }

    const normalizedEmail = emailValidation.email;

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'No account found for this email address',
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Your email address is not verified. Please verify using the OTP code sent to your email address.',
        data: { isVerified: false },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid password: Authentication failed',
      });
    }

    const otpCode = generateOTP();
    user.loginOtp = otpCode;
    user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'DiaBuddy - Login Verification Code',
      text: `Your DiaBuddy login verification code is: ${otpCode}. It is valid for 10 minutes.`,
      html: `<h3>DiaBuddy Login Verification</h3>
             <p>Your 6-digit verification code is: <strong>${otpCode}</strong></p>
             <p>It is valid for 10 minutes.</p>`,
    });

    return res.json({
      status: 'success',
      message: 'A 6-digit verification code has been sent to your email. Enter it to complete login.',
      data: {
        requiresOtp: true,
        email: user.email,
      },
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
 * @desc    Verify the login OTP and complete sign-in
 * @route   POST /api/auth/verify-login-otp
 * @access  Public
 */
const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and verification code are required',
      });
    }

    const emailValidation = await validateEmailAddress(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        status: 'error',
        message: emailValidation.reason,
      });
    }

    const normalizedEmail = emailValidation.email;
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'User not found',
      });
    }

    if (!user.loginOtp || !user.loginOtpExpires) {
      return res.status(400).json({
        status: 'error',
        message: 'No pending login verification found. Please try logging in again.',
      });
    }

    if (user.loginOtp !== otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification code',
      });
    }

    if (new Date() > user.loginOtpExpires) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification code has expired. Please log in again.',
      });
    }

    user.loginOtp = null;
    user.loginOtpExpires = null;
    await user.save();

    return res.json({
      status: 'success',
      message: 'Login verified successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        glucoseUnit: user.glucoseUnit,
        targetRanges: user.targetRanges,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    console.error('Login OTP verification error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during login verification',
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
    // req.user is set by authentication middleware
    return res.json({
      status: 'success',
      data: req.user,
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
 * @desc    Request password reset (send email with token)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required',
      });
    }

    const emailValidation = await validateEmailAddress(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        status: 'error',
        message: emailValidation.reason,
      });
    }

    const normalizedEmail = emailValidation.email;
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'No account found with this email address',
      });
    }

    // Generate a random reset token (6-digit code for simplicity)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    await sendEmail({
      to: normalizedEmail,
      subject: 'DiaBuddy - Password Reset Code',
      text: `Your password reset code is: ${resetToken}. It is valid for 15 minutes.`,
      html: `<h3>Password Reset Request</h3>
             <p>Your 6-digit password reset code is: <strong>${resetToken}</strong></p>
             <p>It is valid for 15 minutes.</p>
             <p>If you did not request this, please ignore this email.</p>`,
    });

    return res.json({
      status: 'success',
      message: 'A password reset code has been sent to your email.',
      data: { email: normalizedEmail },
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during password reset request',
    });
  }
};

/**
 * @desc    Reset password using reset token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;

    if (!email || !resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, reset token, and new password are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Passwords do not match',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters',
      });
    }

    const emailValidation = await validateEmailAddress(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        status: 'error',
        message: emailValidation.reason,
      });
    }

    const normalizedEmail = emailValidation.email;
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'User not found',
      });
    }

    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({
        status: 'error',
        message: 'No password reset request found. Please request a new one.',
      });
    }

    if (user.resetPasswordToken !== resetToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reset token',
      });
    }

    if (new Date() > user.resetPasswordExpires) {
      return res.status(400).json({
        status: 'error',
        message: 'Reset token has expired. Please request a new one.',
      });
    }

    // Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    user.passwordHash = passwordHash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({
      status: 'success',
      message: 'Password reset successfully. You can now log in with your new password.',
      data: { email: user.email },
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during password reset',
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  verifyLoginOtp,
  getMe,
  forgotPassword,
  resetPassword,
};
