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
      required: [true, 'Activity / Exercise Type is required'],
      trim: true,
      maxlength: [100, 'Activity name cannot exceed 100 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [0, 'Duration cannot be negative'],
    },
    distance: {
      type: Number,
      default: 0,
      min: [0, 'Distance cannot be negative'],
    },
    steps: {
      type: Number,
      default: 0,
      min: [0, 'Steps cannot be negative'],
    },
    caloriesBurned: {
      type: Number,
      min: [0, 'Calories burned cannot be negative'],
      default: 0,
    },
    intensity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    source: {
      type: String,
      enum: ['Manual', 'Fitbit', 'GoogleHealth'],
      default: 'Manual',
    },
    // Only set for synced workouts — omit on manual logs so unique index works
    fitbitLogId: {
      type: String,
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

exerciseLogSchema.index({ userId: 1, timestamp: -1 });

// Unique only when an external sync id is present (not for manual null/missing)
exerciseLogSchema.index(
  { userId: 1, fitbitLogId: 1 },
  {
    unique: true,
    name: 'userId_1_fitbitLogId_1_partial',
    partialFilterExpression: {
      fitbitLogId: { $exists: true, $type: 'string', $gt: '' },
    },
  }
);

module.exports = mongoose.model('ExerciseLog', exerciseLogSchema);
