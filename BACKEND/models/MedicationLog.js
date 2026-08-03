const mongoose = require('mongoose');

const medicationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      maxlength: [100, 'Medicine name cannot exceed 100 characters'],
    },
    dose: {
      type: String,
      required: [true, 'Dose is required'],
      trim: true,
      maxlength: [50, 'Dose cannot exceed 50 characters'],
    },
    status: {
      type: String,
      enum: ['Taken', 'Missed', 'Skipped'],
      required: [true, 'Status is required'],
      default: 'Taken',
    },
    route: {
      type: String,
      enum: ['', 'Oral', 'Injection', 'Inhaler', 'Other'],
      default: '',
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

medicationLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('MedicationLog', medicationLogSchema);
