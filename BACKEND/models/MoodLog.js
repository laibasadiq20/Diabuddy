const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    mood: {
      type: String,
      enum: ['Great', 'Good', 'Okay', 'Low', 'Stressed'],
      required: [true, 'Mood is required'],
    },
    journalEntry: {
      type: String,
      maxlength: [1000, 'Journal entry cannot exceed 1000 characters'],
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

moodLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('MoodLog', moodLogSchema);
