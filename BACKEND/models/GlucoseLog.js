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
    readingType: {
      type: String,
      enum: [
        'Fasting',
        'Before Breakfast',
        'After Breakfast',
        'Before Lunch',
        'After Lunch',
        'Before Dinner',
        'After Dinner',
        'Bedtime',
        'Random',
        'Before Exercise',
        'After Exercise',
        'Night',
      ],
      required: [true, 'Reading type is required'],
    },
    source: {
      type: String,
      enum: ['Fingerstick', 'CGM', 'Manual Entry'],
      default: 'Manual Entry',
    },
    status: {
      type: String,
      enum: ['Low', 'Normal', 'High'],
    },
    isInRange: {
      type: Boolean,
      default: false,
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

// Compound index for user and timestamp
glucoseLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('GlucoseLog', glucoseLogSchema);
