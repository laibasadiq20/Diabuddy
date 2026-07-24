const mongoose = require('mongoose');

const sleepLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    sleepTime: {
      type: Date,
      required: [true, 'Sleep start time is required'],
    },
    wakeTime: {
      type: Date,
      required: [true, 'Wake time is required'],
    },
    totalHours: {
      type: Number,
      required: [true, 'Total hours is required'],
      min: [0, 'Sleep hours cannot be negative'],
    },
    quality: {
      type: String,
      enum: ['Poor', 'Average', 'Good', 'Excellent'],
      required: [true, 'Sleep quality is required'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
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

sleepLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('SleepLog', sleepLogSchema);
