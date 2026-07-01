const mongoose = require('mongoose');

const insulinLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    insulinDose: {
      type: Number,
      required: [true, 'Insulin dose is required'],
      min: [0.1, 'Insulin dose must be at least 0.1 units'],
    },
    insulinType: {
      type: String,
      enum: ['Rapid-Acting', 'Long-Acting', 'Mixed'],
      required: [true, 'Insulin type is required'],
    },
    relatedGlucoseLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GlucoseLog',
      default: null,
    },
    relatedMealLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealLog',
      default: null,
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
insulinLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('InsulinLog', insulinLogSchema);
