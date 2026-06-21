const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['patient', 'admin'],
      default: 'patient',
    },
    age: {
      type: Number,
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot exceed 120'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    diabetesType: {
      type: String,
      enum: ['Type 1', 'Type 2', 'Gestational'],
    },
    glucoseUnit: {
      type: String,
      enum: ['mg/dL', 'mmol/L'],
      default: 'mg/dL',
    },
    targetRanges: {
      fastingMin: { type: Number, default: 70 },
      fastingMax: { type: Number, default: 100 },
      postMealMin: { type: Number, default: 70 },
      postMealMax: { type: Number, default: 140 },
    },
    profileImageUrl: {
      type: String,
      default: '',
    },
    fitbit: {
      connected: { type: Boolean, default: false },
      accessToken: { type: String, default: '' },
      refreshToken: { type: String, default: '' },
      tokenExpiresAt: { type: Date },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false, // User must verify email via OTP
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Never return passwordHash or fitbit tokens in JSON responses
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  if (user.fitbit) {
    delete user.fitbit.accessToken;
    delete user.fitbit.refreshToken;
  }
  return user;
};

module.exports = mongoose.model('User', userSchema);
