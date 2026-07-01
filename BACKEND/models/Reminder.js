const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['Insulin', 'Glucose Check', 'Medication', 'Custom'],
      required: [true, 'Reminder type is required'],
    },
    title: {
      type: String,
      required: [true, 'Reminder title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm 24-hour format'],
      // e.g., "08:00", "14:30", "21:00"
    },
    days: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: [true, 'At least one day must be selected'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastTriggeredAt: {
      type: Date,
      default: null,
      // Used to prevent duplicate notification firing
    },
  },
  {
    timestamps: true,
  }
);

// Index for scheduler to find active reminders
reminderSchema.index({ isActive: 1, time: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
