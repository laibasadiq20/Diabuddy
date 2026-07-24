const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [1, 'Weight must be at least 1 kg'],
    },
    bmi: {
      type: Number,
      min: [0, 'BMI cannot be negative'],
    },
    bodyFat: {
      type: Number,
      min: [0, 'Body fat percentage cannot be negative'],
      max: [100, 'Body fat percentage cannot exceed 100%'],
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

weightLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('WeightLog', weightLogSchema);
