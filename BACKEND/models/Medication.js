const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true,
      maxlength: [100, 'Medication name cannot exceed 100 characters'],
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
      // e.g., "500mg", "10 units", "2 tablets"
    },
    frequency: {
      type: String,
      enum: ['Once Daily', 'Twice Daily', 'Three Times Daily', 'As Needed'],
      required: [true, 'Frequency is required'],
    },
    timeSlots: {
      type: [String],
      // Array of HH:mm strings, e.g. ["08:00", "20:00"]
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
      // null means ongoing / no end date
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

// Index for fetching active medications for a user
medicationSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Medication', medicationSchema);
