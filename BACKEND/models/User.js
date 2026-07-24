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
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
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
    /** Temporary mute — user can log in but cannot post/comment/message until this date */
    mutedUntil: {
      type: Date,
      default: null,
    },
    warnings: [
      {
        message: {
          type: String,
          maxlength: [500, 'Warning message cannot exceed 500 characters'],
          required: true,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
    resetPasswordCode: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    bio: {
  type: String,
  maxlength: [300, 'Bio cannot exceed 300 characters'],
  default: '',
},

location: {
  type: String,
  maxlength: [100, 'Location cannot exceed 100 characters'],
  default: '',
},

diagnosisYear: {
  type: Number,
  min: [1900, 'Diagnosis year is invalid'],
  max: [new Date().getFullYear(), 'Diagnosis year cannot be in the future'],
  default: null,
  // used to compute the "T1D · 7y" style badge on the profile card
},

isVerifiedProfessional: {
  type: Boolean,
  default: false,
  // shows the "Verified pro" badge (e.g. Dr. Aisha Rahman) next to name on posts
},

professionalVerification: {
  status: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none',
  },
  credentials: {
    type: String,
    maxlength: [500, 'Credentials cannot exceed 500 characters'],
    default: '',
  },
  note: {
    type: String,
    maxlength: [500, 'Note cannot exceed 500 characters'],
    default: '',
  },
  requestedAt: { type: Date, default: null },
  reviewedAt: { type: Date, default: null },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
},

reputationScore: {
  type: Number,
  default: 0,
  // distinct from likesReceived — weighted score shown as "REP" on profile card
},

postsCount: {
  type: Number,
  default: 0,
},

commentsCount: {
  type: Number,
  default: 0,
},

likesReceived: {
  type: Number,
  default: 0,
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