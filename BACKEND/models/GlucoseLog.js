const mongoose = require('mongoose');

const glucoseLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    glucoseLevel: {
      type: Number,
      required: [true, 'Glucose level is required'],
      min: [1, 'Glucose level must be positive'],
    },
    unit: {
      type: String,
      enum: ['mg/dL', 'mmol/L'],
      required: [true, 'Unit is required'],
    },
    context: {
      type: String,
      enum: ['Fasting', 'Pre-Meal', 'Post-Meal', 'Bedtime', 'Random'],
      required: [true, 'Context is required'],
    },
    isInRange: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user-specific time-range queries
glucoseLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('GlucoseLog', glucoseLogSchema);
