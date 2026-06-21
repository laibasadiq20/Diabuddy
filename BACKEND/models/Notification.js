const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['Reminder', 'NewComment', 'NewMessage', 'SystemAlert'],
      required: [true, 'Notification type is required'],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      // Points to the related post, comment, message, or reminder
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      maxlength: [300, 'Message cannot exceed 300 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching unread notifications (newest first)
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
