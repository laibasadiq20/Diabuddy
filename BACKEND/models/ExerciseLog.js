const mongoose = require('mongoose');

const exerciseLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    activity: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
      maxlength: [100, 'Activity name cannot exceed 100 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      // Duration in minutes
    },
    caloriesBurned: {
      type: Number,
      min: [0, 'Calories burned cannot be negative'],
      default: 0,
    },
    source: {
      type: String,
      enum: ['Manual', 'Fitbit'],
      default: 'Manual',
    },
    fitbitLogId: {
      type: String,
      default: null,
      // External Fitbit ID to prevent duplicate syncs
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user-specific time-range queries
exerciseLogSchema.index({ userId: 1, timestamp: -1 });

// Sparse unique index to prevent duplicate Fitbit syncs (only indexes docs where fitbitLogId exists)
exerciseLogSchema.index(
  { userId: 1, fitbitLogId: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('ExerciseLog', exerciseLogSchema);
