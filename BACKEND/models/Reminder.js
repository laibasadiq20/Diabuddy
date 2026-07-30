const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Reminder title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: ['default', 'custom'],
      default: 'custom',
    },
    time: {
      type: String,
      default: '',
      // Store in 24-hour HH:mm format e.g., "08:00", "14:30", "22:00" or ""
    },
    repeat: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily',
    },
    days: {
      type: [String],
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      default: [],
    },
    appointmentDate: {
      type: Date,
      default: null,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    nextTriggerAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastCompletedAt: {
      type: Date,
      default: null,
    },
    lastTriggeredAt: {
      type: Date,
      default: null,
    },
    icon: {
      type: String,
      default: '🔔',
    },
    tzOffset: {
      type: Number,
      default: 0,
      // Timezone offset in minutes (e.g. -300 for GMT+5)
    },
  },
  {
    timestamps: true,
  }
);

// Index for scheduler query: enabled reminders due on or before current time
reminderSchema.index({ enabled: 1, nextTriggerAt: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
